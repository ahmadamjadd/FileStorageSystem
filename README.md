# Cloud File Storage Platform

A modern, full-stack web application for securely storing, managing, and sharing files in the cloud. Built with FastAPI (Python), PostgreSQL, AWS S3, and React (TypeScript).

## Features
- **User Authentication:** Secure JWT-based registration and login system.
- **S3 Integration:** Direct file uploads and temporary pre-signed URL downloads for maximum security and performance.
- **PostgreSQL Metadata:** Fast file indexing, metadata tracking (size, type, upload date), and user ownership filtering.
- **Modern UI:** Sleek React frontend powered by Vite, Tailwind CSS v4, and Lucide Icons.
- **Cloud Native Deployment:** Fully containerized backend deployed on AWS ECS.

---

## Architecture

- **Frontend:** React + TypeScript + Vite + Tailwind CSS v4
- **Backend:** FastAPI (Python) + SQLAlchemy
- **Database:** Amazon RDS (PostgreSQL)
- **Blob Storage:** Amazon S3 (for the actual file bytes)
- **Container Registry:** Amazon ECR
- **Compute:** Amazon ECS (Elastic Container Service) with EC2 Launch Type
- **Frontend Hosting:** Amazon S3 Static Website Hosting

---

