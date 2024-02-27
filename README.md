### COGNITO BACKUP LAMBDA

## Overview

This simple AWS lambda functon will do a daily backup of your AWS cognito user pool to an S3 bucket. It uses the CBR backup tool which also has the ability to restore from the backup file. Currently there is no backup option provided by AWS for cognito.

You can read more about CBR backup usage here: 

https://github.com/rahulpsd18/cognito-backup-restore/tree/master


Here is the main npm repo:

https://www.npmjs.com/package/cognito-backup-restore


## Instructions
Navitage to the cognito-backup folder and do a few things:

Add your unique bucket name and congnito pool name to the terraform.tfvars
```
user_pool_id     = "your-userpool-id"
s3_bucket_name   = "your-s3-bucket-name"
backup_directory = "path/to/backup/directory"
```


Do a terraform plan and apply
```
terraform plan
terraform apply
``` 

# Lambda Pre-Build

The lambda has been pre build and zipped with its node_modules dependeies. If you need to rebuild it you can navigate to the /lambda folder and issue 
```
npm install
```
