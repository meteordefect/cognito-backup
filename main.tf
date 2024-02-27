# Create and S3 bucket
resource "aws_s3_bucket" "cognito_backup_bucket" {
  bucket = var.s3_bucket_name
}

resource "aws_s3_bucket_versioning" "cognito_backup_bucket_versioning" {
  bucket = aws_s3_bucket.cognito_backup_bucket.id
  versioning_configuration {
    status = "Disabled"
  }
}


#Create a policy 
resource "aws_iam_role" "lambda_execution_role" {
  name = "cognito_backup_lambda_role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "lambda.amazonaws.com"
        }
      },
    ]
  })
}

resource "aws_iam_policy" "lambda_policy" {
  name        = "cognito_backup_lambda_policy"
  description = "IAM policy for cognito backup lambda"

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = [
          "cognito-idp:*",
          "s3:PutObject",
          "logs:CreateLogGroup",
          "logs:CreateLogStream",
          "logs:PutLogEvents"
        ]
        Effect   = "Allow"
        Resource = "*"
      },
    ]
  })
}

resource "aws_iam_role_policy_attachment" "lambda_policy_attachment" {
  role       = aws_iam_role.lambda_execution_role.name
  policy_arn = aws_iam_policy.lambda_policy.arn
}

# Lambda Function for Cognito Backup
resource "aws_lambda_function" "cognito_backup" {
  function_name = "cognito_backup_function"
  role          = aws_iam_role.lambda_execution_role.arn

  handler       = "index.handler"
  runtime       = "nodejs16.x" # Make sure this is a supported runtime

  s3_bucket     = aws_s3_bucket.cognito_backup_bucket.bucket
  s3_key        = "lambda/package.zip" # This should match the key used in the aws_s3_bucket_object resource below

  environment {
    variables = {
      S3_BUCKET_NAME   = aws_s3_bucket.cognito_backup_bucket.bucket
      BACKUP_DIRECTORY = var.backup_directory
      REGION           = var.lambda_region
      USER_POOL_ID     = var.user_pool_id
    }
  }
  
  timeout       = 900 # Increase the timeout up to the maximum of 15 minutes
  depends_on = [aws_s3_object.lambda_function_package]
}

resource "aws_s3_object" "lambda_function_package" {
  bucket = aws_s3_bucket.cognito_backup_bucket.bucket
  key    = "lambda/package.zip"
  source = "${path.module}/lambda/package.zip" # Corrected file path
}


# Create a schedule to run the backup usng a cloudwatch rule
resource "aws_cloudwatch_event_rule" "daily_trigger" {
  name                = "cognito_backup_daily"
  schedule_expression = "cron(0 1 * * ? *)" # Runs at 1:00 AM UTC every day
}

resource "aws_cloudwatch_event_target" "trigger_backup" {
  rule      = aws_cloudwatch_event_rule.daily_trigger.name
  target_id = "CognitoBackupTarget"
  arn       = aws_lambda_function.cognito_backup.arn
}

resource "aws_lambda_permission" "allow_cloudwatch_to_call_backup" {
  statement_id  = "AllowExecutionFromCloudWatch"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.cognito_backup.function_name
  principal     = "events.amazonaws.com"
  source_arn    = aws_cloudwatch_event_rule.daily_trigger.arn
}
