# Cloud File Storage Platform (Work in Progress)

A modern, full-stack cloud file storage platform (similar in concept to a small-scale Google Drive or Dropbox) built from the ground up to explore system design, architecture, and cloud engineering.

## Project Purpose & Philosophy

This project is not simply about building another CRUD application or learning how to write infrastructure scripts. It is a deliberate, deep dive into **System Design and Architecture**. 

While modern tools and LLMs make implementing software easier, getting the architecture and engineering decisions right requires a fundamental understanding of the system itself. This project serves as a practical application of studying engineering blogs, architecture discussions, and technical trade-offs.

The core focus is on the **reasoning** behind the system:
- **Architectural Boundaries:** Designing how different components (frontend, backend, databases, blob storage) interact.
- **Deep Authentication & Authorization:** Understanding exactly how JWT-based authentication works at a granular level.
- **Data Modeling Trade-offs:** Designing the strict relationship between relational metadata (PostgreSQL) and object storage (Amazon S3).
- **Security & Ownership:** Thinking through API boundaries, data ownership, and strict authorization rules.
- **Service Selection:** Evaluating different AWS services to understand not just *how* to use them, but *why* they fit a particular requirement.
- **DevOps as a Foundation:** Connecting architectural decisions directly with practical Cloud and DevOps practices, progressively introducing containerization, automated infrastructure, and CI/CD.
- **Evolutionary Architecture:** Designing the system so it can naturally evolve toward greater scalability, reliability, and maintainability.

The goal is to understand the system deeply enough to explain not only *what* was implemented, but exactly *why* the architecture looks the way it does.

---

## Current State & Evolution

This project is currently **being actively built** and is evolving through several deliberate phases:

- **Phase 1: Application Engineering (Complete)** - Core application logic, API boundaries, and database modeling.
- **Phase 2: Cloud Deployment (Complete)** - Containerization and manual AWS deployment.
- **Phase 3: DevOps Automation (In Progress)** - Replacing manual workflows with GitOps, isolated GitHub Actions CI/CD pipelines, IAM least-privilege, and Terraform.
- **Phase 4 & 5: Scalability & Reliability (Upcoming)** - Evolving the architecture to handle distributed load and failure scenarios.

*(Note: The sections below outline the current technical implementation, which will continue to evolve as the architecture scales.)*

