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
