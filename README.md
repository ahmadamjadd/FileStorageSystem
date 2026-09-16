# Cloud File Storage Platform

A modern, full-stack web application for securely storing, managing, and sharing files in the cloud. Built with FastAPI (Python), PostgreSQL, AWS S3, and React (TypeScript).

## Features
- **User Authentication:** Secure JWT-based registration and login system.
- **S3 Integration:** Direct file uploads and temporary pre-signed URL downloads for maximum security and performance.
- **PostgreSQL Metadata:** Fast file indexing, metadata tracking (size, type, upload date), and user ownership filtering.
- **Modern UI:** Sleek React frontend powered by Vite, Tailwind CSS v4, and Lucide Icons.
- **Cloud Native Deployment:** Fully containerized backend deployed on AWS ECS.

---

## 🏗️ Architecture

- **Frontend:** React + TypeScript + Vite + Tailwind CSS v4
- **Backend:** FastAPI (Python) + SQLAlchemy
- **Database:** Amazon RDS (PostgreSQL)
- **Blob Storage:** Amazon S3 (for the actual file bytes)
- **Container Registry:** Amazon ECR
- **Compute:** Amazon ECS (Elastic Container Service) with EC2 Launch Type

---

## 🚀 Getting Started (Local Development)

### 1. Prerequisites
- Python 3.10+
- Node.js 18+
- Docker Desktop (for local database & backend testing)
- AWS Account with an S3 Bucket and IAM User credentials

### 2. Local Backend (Docker)
```bash
# Configure environment variables
# Copy .env.example to backend/.env and fill in your credentials
cd backend
cp .env.example .env

# Go back to the root directory and start the stack
cd ..
docker-compose up --build
```
*The backend API will be running at `http://localhost:8000`. Swagger UI documentation is available at `http://localhost:8000/docs`.*

### 3. Local Frontend
```bash
# Open a new terminal and go to the frontend directory
cd frontend

# Install Node modules
npm install

# Start the Vite development server
npm run dev
```
*The React application will be running at `http://localhost:5173`.*

---

## ☁️ AWS Deployment Guide

1. **Database:** Provision an Amazon RDS PostgreSQL instance in a public/private subnet and allow inbound traffic from your compute environment.
2. **Container Registry (ECR):**
   - Create a private ECR repository.
   - Build and push the Docker image:
     ```bash
     docker build -t filestorage-backend ./backend
     docker tag filestorage-backend:latest <AWS_ACCOUNT_ID>.dkr.ecr.<REGION>.amazonaws.com/filestorage-backend:latest
     docker push <AWS_ACCOUNT_ID>.dkr.ecr.<REGION>.amazonaws.com/filestorage-backend:latest
     ```
3. **Compute (ECS):**
   - Create an ECS Cluster using EC2 instances (`t3.micro` for Free Tier).
   - Create a Task Definition (bridge network mode) pulling the image from ECR. Map container port 8000 to host port 8000.
   - Supply the environment variables (`DATABASE_URL`, `JWT_SECRET_KEY`, `S3_BUCKET_NAME`).
   - Run the task as an ECS Service.
4. **Security Groups:**
   - Ensure the EC2 instance Security Group allows inbound TCP 8000 from the internet.
   - Ensure the RDS Security Group allows inbound TCP 5432 from the EC2 Instance's Security Group.

---

## 📁 Project Structure

```text
FileStorageSystem/
├── backend/                  # FastAPI Application
│   ├── app/                  # Source Code
│   ├── Dockerfile            # Container definition for the backend
│   ├── requirements.txt      # Python dependencies
│   └── .env.example          # Environment variables template
├── frontend/                 # React Application
│   ├── src/                  # React Source Code
│   ├── package.json          # Node dependencies
│   └── vite.config.ts        # Vite build configuration
└── docker-compose.yml        # Local development orchestrator
```
