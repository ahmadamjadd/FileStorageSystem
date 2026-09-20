output "learning_parameter_name" {
  description = "The name of the parameter we created"
  value       = aws_ssm_parameter.learning_example.name
}
