const AWS = require('aws-sdk');
const { backupUsers } = require('cognito-backup-restore');
const s3 = new AWS.S3();

// Handler
exports.handler = async (event) => {
  const cognitoISP = new AWS.CognitoIdentityServiceProvider();
  const userPoolId = process.env.USER_POOL_ID;
  const s3BucketName = process.env.S3_BUCKET_NAME;
  const backupDirectory = process.env.BACKUP_DIRECTORY;

  try {
    // Perform the backup
    // It's assumed backupUsers returns the data needed; adjust as necessary.
    const backupData = await backupUsers(cognitoISP, userPoolId);
    console.log(`Backup completed for User Pool ID: ${userPoolId}`);
    
    // Convert backup data to JSON string
    const backupJson = JSON.stringify(backupData);

    // Define S3 put parameters
    const putParams = {
      Bucket: s3BucketName,
      Key: `${backupDirectory}/backup-${userPoolId}-${new Date().toISOString()}.json`,
      Body: backupJson,
      ContentType: 'application/json'
    };

    // Save the backup to S3
    await s3.putObject(putParams).promise();
    console.log('Backup successfully saved to S3');
  } catch (error) {
    console.error('Error during backup process:', error);
    throw error; // Rethrow to mark the Lambda execution as failed
  }
};
