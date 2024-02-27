const AWS = require('aws-sdk');
const { backupUsers } = require('cognito-backup-restore');
const s3 = new AWS.S3();
const fs = require('fs').promises;
const cognitoISP = new AWS.CognitoIdentityServiceProvider();

exports.handler = async (event) => {
    console.log('Function execution started');
    const s3BucketName = process.env.S3_BUCKET_NAME;
    const backupDirectory = process.env.BACKUP_DIRECTORY || ""; // Default to empty string if not set
    const userPoolId = process.env.USER_POOL_ID; // Make sure this is set in your Lambda environment variables
    const timestamp = new Date().toISOString();
    const directory = '/tmp';
    console.log('Environment Variables:', JSON.stringify(process.env, null, 2));
    if (!userPoolId) {
        console.error('UserPoolId is not specified in environment variables.');
        return;
    }

    try {
        await backupUsers(cognitoISP, userPoolId, directory);
        console.log(`Backup completed for user pool ${userPoolId}`);

        const files = await fs.readdir(directory);
        for (const fileName of files) {
            const filePath = `${directory}/${fileName}`;
            if (fileName) { // Ensure fileName is truthy to avoid uploading undefined.json
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
        }
    } catch (error) {
        console.error('Error during backup process:', error);
        throw error; // Rethrow to mark the Lambda execution as failed
    }
    console.log('Function execution ended');
};
