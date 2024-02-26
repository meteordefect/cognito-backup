const AWS = require('aws-sdk');
const { backup } = require('cognito-backup-restore');
const s3 = new AWS.S3();

exports.handler = async (event) => {
  const s3BucketName = process.env.S3_BUCKET_NAME;
  const backupDirectory = process.env.BACKUP_DIRECTORY; // Ensure this ends with a "/"
  const timestamp = new Date().toISOString();

  try {
    // Assuming backup without specifying a user pool backs up all pools
    const backupResults = await backup({
      region: process.env.REGION,
      directory: '/tmp', // Use /tmp for Lambda temporary storage
    });

    // After backup, upload the result to S3
    for (const result of backupResults) {
      const fileName = result.fileName; // Or any appropriate identifier from the result
      const filePath = `/tmp/${fileName}`;
      const fileContent = await fs.readFile(filePath);

      const s3Key = `${backupDirectory}${timestamp}/${fileName}`;
      await s3.upload({
        Bucket: s3BucketName,
        Key: s3Key,
        Body: fileContent,
        ContentType: 'application/json',
      }).promise();

      console.log(`Uploaded ${fileName} to S3 bucket ${s3BucketName} at key ${s3Key}.`);
    }
  } catch (error) {
    console.error('Error during backup process:', error);
    throw error; // Rethrow to mark the Lambda execution as failed
  }
};
