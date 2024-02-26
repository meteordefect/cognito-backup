const AWS = require('aws-sdk');
const fs = require('fs');
const { backupUsers } = require('cognito-backup-restore');
const s3 = new AWS.S3();
const path = require('path');

// Handler
exports.handler = async (event) => {
  const cognitoISP = new AWS.CognitoIdentityServiceProvider();
  const userPoolId = process.env.USER_POOL_ID;
  const s3BucketName = process.env.S3_BUCKET_NAME;
  const backupDirectory = process.env.BACKUP_DIRECTORY;
  const backupFilePath = path.join('/tmp', `backup-${userPoolId}-${new Date().toISOString()}.json`);

  try {
    // Perform the backup to a file in /tmp
    await backupUsers(cognitoISP, userPoolId, backupFilePath);
    console.log(`Backup completed for User Pool ID: ${userPoolId}`);
    
    // Read the backup file from /tmp
    const backupData = fs.readFileSync(backupFilePath);

    // Define S3 put parameters
    const putParams = {
      Bucket: s3BucketName,
      Key: `${backupDirectory}${path.basename(backupFilePath)}`,
      Body: backupData,
      ContentType: 'application/json'
    };

    // Save the backup to S3
    await s3.putObject(putParams).promise();
    console.log('Backup successfully saved to S3');
  } catch (error) {
    console.error('Error during backup process:', error);
    throw error; // Rethrow to mark the Lambda execution as failed
  } finally {
    // Clean up: Delete the temporary file
    try {
      fs.unlinkSync(backupFilePath);
    } catch (
