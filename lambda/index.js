const AWS = require('aws-sdk');
const { promises: fs } = require('fs');
const path = require('path');
const { backupUsers } = require('cognito-backup-restore');
const s3 = new AWS.S3();

// Handler
exports.handler = async (event) => {
  const cognitoISP = new AWS.CognitoIdentityServiceProvider();
  const userPoolId = process.env.USER_POOL_ID;
  const s3BucketName = process.env.S3_BUCKET_NAME;
  const backupDirectory = process.env.BACKUP_DIRECTORY;
  // Generate a unique filename for the backup
  const backupFileName = `backup-${userPoolId}-${new Date().toISOString()}.json`;
  const backupFilePath = path.join('/tmp', backupFileName);

  try {
    // Assuming backupUsers function now correctly handles writing to the specified file
    const backupData = await backupUsers(cognitoISP, userPoolId, backupFilePath);
    console.log(`Backup completed for User Pool ID: ${userPoolId}`);

    // Upload the backup file to S3
    const fileContent = await fs.readFile(backupFilePath);
    const putParams = {
      Bucket: s3BucketName,
      Key: `${backupDirectory}${backupFileName}`,
      Body: fileContent,
      ContentType: 'application/json'
    };
    await s3.putObject(putParams).promise();
    console.log('Backup successfully saved to S3');
  } catch (error) {
    console.error('Error during backup process:', error);
    throw error; // Rethrow to mark the Lambda execution as failed
  } finally {
    // Clean up: Delete the temporary file
    try {
      await fs.unlink(backupFilePath);
    } catch (err) {
      console.error('Error cleaning up the temporary file:', err);
    }
  }
};
