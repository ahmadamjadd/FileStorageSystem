resource "aws_ssm_parameter" "learning_example" {
  name  = "/filestorage/learning/hello-world"
  type  = "String"
  value = "Hello from Terraform!"

  description = "A safe test parameter to learn Terraform"
}

# 3. Import our existing ECR Repository
resource "aws_ecr_repository" "backend" {
  name                 = "filestorage-backend"
  image_tag_mutability = "MUTABLE"

  image_scanning_configuration {
    scan_on_push = true
  }
}
