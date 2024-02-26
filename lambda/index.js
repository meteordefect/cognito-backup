const { exec } = require('child_process');
const AWS = require('aws-sdk');
const fs = require('fs').promises;
const path = require('path');

const s3 = new AWS.S3({ region: process.env.REGION });

exports.handler = async (event) => {
  const localBackupDirectory = `/tmp/backups/`;
  const timestamp = new Date().toISOString();
  const s3BackupDirectory = `backups/${timestamp}/`;

  try {
    await fs.mkdir(localBackupDirectory, { recursive: true });

    const command = `cbr backup --pool all --profile prod --region ${process.env.REGION} --dir ${localBackupDirectory}`;
    await executeCommand(command);

    const files = await fs.readdir(localBackupDirectory);

    await Promise.all(files.map(async (file) => {
      const filePath = path.join(localBackupDirectory, file);
      const fileContent = await fs.readFile(filePath);
      const s3Key = `${s3BackupDirectory}${file}`;

      await uploadToS3(fileContent, s3Key);
      console.log(`Uploaded ${file} to S3.`);
    }));

    console.log('Backup completed successfully.');
  } catch (error) {
    console.error('Error during backup process:', error);
    throw error;
  }
};

function executeCommand(command) {
  return new Promise((resolve, reject) => {
    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error('Error executing command:', error);
        reject(error);
      } else if (stderr) {
        console.error('Error output from command:', stderr);
        reject(new Error(stderr));
      } else {
        console.log('Command output:', stdout);
        resolve();
      }
    });
  });
}

function uploadToS3(data, key) {
  const params = {
    Bucket: process.env.S3_BUCKET_NAME,
    Key: key,
    Body: data,
    ContentType: 'application/json'
  };
  return s3.upload(params).promise();
}
