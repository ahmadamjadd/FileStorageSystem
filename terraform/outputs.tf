output "learning_parameter_name" {
  description = "The name of the parameter we created"
  value       = aws_ssm_parameter.learning_example.name
}

output "database_url" {
  description = "The database URL to put into GitHub Secrets"
  value       = "postgresql://${aws_db_instance.database.username}:${random_password.db_password.result}@${aws_db_instance.database.endpoint}/${aws_db_instance.database.db_name}"
  sensitive   = true
}
