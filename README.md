# Cloud File Storage Platform (Phase 1)

A modern, full-stack web application for securely storing, managing, and sharing files in the cloud. Built with FastAPI (Python), PostgreSQL, AWS S3, and React (TypeScript).

## Features
- **User Authentication:** Secure JWT-based registration and login system.
- **S3 Integration:** Direct file uploads and temporary pre-signed URL downloads for maximum security and performance.
- **PostgreSQL Metadata:** Fast file indexing, metadata tracking (size, type, upload date), and user ownership filtering.
- **Modern UI:** Sleek React frontend powered by Vite, Tailwind CSS v4, and Lucide Icons.

---

## 🏗️ Architecture

- **Frontend:** React + TypeScript + Vite + Tailwind CSS v4
- **Backend:** FastAPI (Python) + SQLAlchemy
- **Database:** PostgreSQL (for users and file metadata)
- **Blob Storage:** AWS S3 (for the actual file bytes)

---

## 🚀 Getting Started

### 1. Prerequisites
- Python 3.10+
- Node.js 18+
- PostgreSQL server running locally
- AWS Account with an S3 Bucket and IAM User credentials

### 2. Backend Setup
```bash
cd backend

# Create and activate a virtual environment
python -m venv venv
source venv/bin/activate  # On Windows use: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Configure environment variables
# Copy .env.example to .env and fill in your PostgreSQL and AWS S3 credentials
cp .env.example .env

# Start the FastAPI server
uvicorn app.main:app --reload --port 8000
```
*The backend API will be running at `http://localhost:8000`. Swagger UI documentation is available at `http://localhost:8000/docs`.*

### 3. Frontend Setup
```bash
# Open a new terminal and go to the frontend directory
cd frontend

# Install Node modules
npm install

# Start the Vite development server
npm run dev
```
*The React application will be running at `http://localhost:5173` (or the port specified by Vite).*

---

## 📁 Project Structure

```text
FileStorageSystem/
├── backend/                  # FastAPI Application
│   ├── app/
│   │   ├── models/           # SQLAlchemy Database Models (User, File)
│   │   ├── routers/          # API Endpoints (Auth, Files)
│   │   ├── schemas/          # Pydantic Validation Schemas
│   │   ├── services/         # Business Logic (S3, Auth, Hash)
│   │   ├── config.py         # Environment variables & Settings
│   │   ├── database.py       # PostgreSQL connection setup
│   │   ├── dependencies.py   # FastAPI Dependencies (e.g. JWT Auth)
│   │   └── main.py           # Application Entrypoint & Error Handlers
│   ├── requirements.txt
│   └── .env.example          # Template for backend environment variables
└── frontend/                 # React Application
    ├── src/
    │   ├── api/              # Axios API clients for Auth and Files
    │   ├── pages/            # React Routes (Login, Register, Dashboard)
    │   ├── App.tsx           # React Router Setup
    │   ├── index.css         # Tailwind CSS entry
    │   └── main.tsx          # React DOM entry
    ├── package.json
    └── vite.config.ts        # Vite configuration (incl. Tailwind plugin)
```
