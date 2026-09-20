resource "aws_ssm_parameter" "learning_example" {
  name  = "/filestorage/learning/hello-world"
  type  = "String"
  value = "Hello from Terraform!"
  
  description = "A safe test parameter to learn Terraform"
}
