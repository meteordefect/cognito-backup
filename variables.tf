variable "user_pool_id" {
  description = "The ID of the Cognito User Pool to back up"
  type        = string
}

variable "s3_bucket_name" {
  description = "The name of the S3 bucket where backups will be stored"
  type        = string
}

variable "backup_directory" {
  description = "The directory (path) in the S3 bucket where backups will be stored"
  type        = string
}
