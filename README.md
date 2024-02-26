### COGNITO BACKUP LAMBDA

## Overview

This simple AWS lambda functon will do a daily backup of your AWS cognito user pool to an S3 bucket. It uses the CBR backup tool which also has the ability to restore from the backup file.

You can read more about CBR backup usage here: 

https://medium.com/geekculture/how-to-quickly-backup-and-restore-aws-cognito-user-pool-c1d820b927a8

Here is the main npm repo:

https://www.npmjs.com/package/cognito-backup-restore


## Instructions
Navitage to the cognito-backup folder and do a few things. 

- Add your unique bucket name and congnito pool name to the terraform.tfvars
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