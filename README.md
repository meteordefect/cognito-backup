### COGNITO BACKUP LAMBDA

## Overview

This simple AWS lambda functon will do a daily backup of your AWS cognito user pool to an S3 bucket. It uses the CBR backup tool which also has the ability to restore from the backup file. Currently there is no backup option provided by AWS for cognito.

## Instructions
Navitage to the cognito-backup folder and do a few things:

Add your unique bucket name, regio and congnito pool name to the terraform.tfvars
```
user_pool_id     = "your-userpool-id"
s3_bucket_name   = "your-s3-bucket-name"
backup_directory = "backups/"
lambda_region = "us-west-2"
```


Do a terraform plan and apply
```
terraform plan
terraform apply
``` 

BAckuos will then be places in the s3 bucket in a folder named with the timestamp of the backup. 


# Lambda Pre-Build

The lambda has been pre build and zipped with its node_modules dependeies. If you need to rebuild it you can navigate to the /lambda folder and issue 
```
npm install
```


# References

You can read more about CBR backup usage here: 

https://github.com/rahulpsd18/cognito-backup-restore/tree/master


Here is the main npm repo:

https://www.npmjs.com/package/cognito-backup-restore
