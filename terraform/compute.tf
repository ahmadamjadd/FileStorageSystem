# 1. ECS Cluster
resource "aws_ecs_cluster" "main" {
  name = "filestorage-cluster-tf"
}

# 2. IAM Roles
# A. EC2 Instance Role (Allows the underlying EC2 server to join the ECS cluster)
resource "aws_iam_role" "ecs_node_role" {
  name = "filestorage-ecs-node-role-tf"
  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{ Action = "sts:AssumeRole", Effect = "Allow", Principal = { Service = "ec2.amazonaws.com" } }]
  })
}

resource "aws_iam_role_policy_attachment" "ecs_node_role_policy" {
  role       = aws_iam_role.ecs_node_role.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonEC2ContainerServiceforEC2Role"
}

resource "aws_iam_instance_profile" "ecs_node" {
  name = "filestorage-ecs-node-profile-tf"
  role = aws_iam_role.ecs_node_role.name
}

# B. Task Execution Role (Allows ECS to pull images from ECR)
resource "aws_iam_role" "ecs_execution_role" {
  name = "filestorage-ecs-execution-role-tf"
  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{ Action = "sts:AssumeRole", Effect = "Allow", Principal = { Service = "ecs-tasks.amazonaws.com" } }]
  })
}

resource "aws_iam_role_policy_attachment" "ecs_execution_role_policy" {
  role       = aws_iam_role.ecs_execution_role.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy"
}

# C. Task Role (Allows your FastAPI Python code to access your S3 File Storage bucket!)
resource "aws_iam_role" "ecs_task_role" {
  name = "filestorage-ecs-task-role-tf"
  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{ Action = "sts:AssumeRole", Effect = "Allow", Principal = { Service = "ecs-tasks.amazonaws.com" } }]
  })
}

resource "aws_iam_role_policy" "s3_access" {
  name = "filestorage-s3-access-tf"
  role = aws_iam_role.ecs_task_role.id
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Action = ["s3:PutObject", "s3:GetObject", "s3:DeleteObject", "s3:ListBucket"]
      Effect = "Allow"
      Resource = ["arn:aws:s3:::cloud-filestorage-9080", "arn:aws:s3:::cloud-filestorage-9080/*"]
    }]
  })
}

# 3. EC2 Instance for ECS (Free Tier)
# Terraform asks AWS for the latest ECS-Optimized Linux Image ID
data "aws_ssm_parameter" "ecs_ami" {
  name = "/aws/service/ecs/optimized-ami/amazon-linux-2023/recommended/image_id"
}

resource "aws_instance" "ecs_node" {
  ami                    = data.aws_ssm_parameter.ecs_ami.value
  instance_type          = "t3.micro"
  subnet_id              = aws_subnet.public_1.id
  vpc_security_group_ids = [aws_security_group.ecs.id]
  iam_instance_profile   = aws_iam_instance_profile.ecs_node.name

  # This bash script runs once when the server boots up to connect it to our Cluster
  user_data = <<-EOF
              #!/bin/bash
              echo ECS_CLUSTER=${aws_ecs_cluster.main.name} >> /etc/ecs/ecs.config
              EOF

  tags = { Name = "filestorage-ecs-node" }
}

# 4. ECS Task Definition (The Blueprint)
resource "aws_ecs_task_definition" "backend" {
  family                   = "filestorage-backend-tf"
  network_mode             = "bridge"
  requires_compatibilities = ["EC2"]
  cpu                      = "256"
  memory                   = "512"
  execution_role_arn       = aws_iam_role.ecs_execution_role.arn
  task_role_arn            = aws_iam_role.ecs_task_role.arn

  container_definitions = jsonencode([{
    name      = "filestorage"
    image     = "${aws_ecr_repository.backend.repository_url}:latest"
    essential = true
    memory    = 512
    portMappings = [{
      containerPort = 8000
      hostPort      = 8000
      protocol      = "tcp"
    }]
    environment = [
      { name = "DATABASE_URL", value = "postgresql://${aws_db_instance.database.username}:${random_password.db_password.result}@${aws_db_instance.database.endpoint}/${aws_db_instance.database.db_name}" },
      { name = "S3_BUCKET_NAME", value = "cloud-filestorage-9080" },
      { name = "JWT_SECRET_KEY", value = "temp_secret_we_will_fix_in_step_18" },
      { name = "FRONTEND_URL", value = "http://filestorage-frontend-9080.s3-website.ap-south-1.amazonaws.com" }
    ]
  }])
}

# 5. ECS Service (The Manager)
resource "aws_ecs_service" "backend" {
  name            = "filestorage-backend-service-tf"
  cluster         = aws_ecs_cluster.main.id
  task_definition = aws_ecs_task_definition.backend.arn
  desired_count                      = 1
  launch_type                        = "EC2"
  deployment_minimum_healthy_percent = 0
  deployment_maximum_percent         = 200
}
