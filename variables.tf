variable "s3_bucket_name" {
  type        = string
  description = "The name of the S3 bucket for backups"
}

variable "backup_directory" {
  type        = string
  description = "The directory within the S3 bucket where backups will be stored"
}

variable "lambda_region" {
  description = "The AWS region where the Lambda function will be deployed."
  type        = string
  default     = "ap-southeast-1" // Default to us-east-1, you can change this to any region
}

variable "user_pool_id" { 
  type = string
}