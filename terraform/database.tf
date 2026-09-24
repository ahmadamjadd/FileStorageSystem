# 1. DB Subnet Group (Locks the database into the private subnets)
resource "aws_db_subnet_group" "private" {
  name       = "filestorage-db-subnet-group"
  subnet_ids = [aws_subnet.private_1.id, aws_subnet.private_2.id]

  tags = { Name = "filestorage-db-subnet-group" }
}

# 2. Secure Random Password Generator
resource "random_password" "db_password" {
  length  = 16
  special = false # We disable special characters to prevent URL parsing errors in SQLAlchemy
}

# 3. The PostgreSQL Database Instance
resource "aws_db_instance" "database" {
  identifier           = "filestorage-db-tf"
  engine               = "postgres"
  engine_version       = "18.3" # Matching your previous manual version
  instance_class       = "db.t3.micro" # Free tier eligible
  allocated_storage    = 20
  
  db_name              = "filestorage_db"
  username             = "filestorage_user"
  password             = random_password.db_password.result
  
  db_subnet_group_name   = aws_db_subnet_group.private.name
  vpc_security_group_ids = [aws_security_group.rds.id]
  
  skip_final_snapshot    = true  # Allows us to destroy it easily during this learning phase
  publicly_accessible    = false # Explicitly block internet access

  tags = { Name = "filestorage-db-tf" }
}
