output "lambda_function_arn" {
  description = "The ARN of the Lambda function used for backing up Cognito user pools."
  value       = aws_lambda_function.cognito_backup.arn
}

output "cloudwatch_event_rule_arn" {
  description = "The ARN of the CloudWatch Event Rule that triggers the Lambda backup function."
  value       = aws_cloudwatch_event_rule.daily_trigger.arn
}
