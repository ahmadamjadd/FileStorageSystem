# Cloud File Storage Platform

A modern, full-stack cloud file storage platform (similar in concept to Google Drive or Dropbox) built from the ground up to explore system design, cloud architecture, and DevOps engineering.

## Project Purpose & Philosophy

This project is not simply about building another CRUD application or learning how to write infrastructure scripts. It is a deliberate, deep dive into **System Design and Architecture**. 

While modern tools and LLMs make implementing software easier, getting the architecture and engineering decisions right requires a fundamental understanding of the system itself. This project serves as a practical application of studying engineering blogs, architecture discussions, and technical trade-offs.

The core focus is on the **reasoning** behind the system:
- **Architectural Boundaries:** Designing how different components (frontend, backend, databases, blob storage) interact.
- **Deep Authentication & Authorization:** Understanding exactly how JWT-based authentication works at a granular level.
- **Data Modeling Trade-offs:** Designing the strict relationship between relational metadata and object storage.
- **Security & Ownership:** Thinking through API boundaries, data ownership, and strict authorization rules.
- **Service Selection:** Evaluating different cloud services to understand not just *how* to use them, but *why* they fit a particular requirement.
- **DevOps as a Foundation:** Connecting architectural decisions directly with practical Cloud and DevOps practices.

---

## System Architecture & Evolutionary Engineering

This project was built deliberately across three major evolutionary phases. Instead of using frameworks to hide complexity, components were implemented from scratch to deeply understand the underlying engineering principles. The following sections detail the granular design choices made in each phase.

### Phase 1: Application Engineering, Data Modeling, & API Design
The foundational phase focused exclusively on the software architecture, defining strict API contracts, and engineering a highly decoupled data model.

**Deep Authentication & Stateless Security**
- **Custom JWT Implementation:** Built a fully custom JSON Web Token (JWT) authentication flow from scratch to deeply understand stateless session management.
- **Password Cryptography:** Implemented secure, salted password hashing using bcrypt before storing credentials in the database.
- **Granular API Authorization:** Engineered strict route-level authorization middleware. The system enforces tenant-isolation, mathematically guaranteeing that a user can only read, update, or delete records associated with their own `owner_id`.

**Hybrid Data Storage Architecture**
- **Relational Metadata (PostgreSQL):** Designed a normalized relational schema to handle highly structured, ACID-compliant transactions. The database is strictly responsible for managing user profiles, tracking file metadata (names, sizes, MIME types, timestamps), and enforcing foreign-key ownership constraints.
- **Object Storage (Amazon S3):** Selected blob storage to handle the actual binary file payloads. The database never stores raw files, preventing database bloat and performance degradation.
- **Pre-signed URL Broker Pattern:** Instead of piping large binary file uploads through the backend server (which would consume massive compute memory and bandwidth), the backend acts as a secure broker. It authenticates the user, generates a temporary, cryptographically signed AWS S3 URL, and instructs the client to upload/download the file directly to/from the S3 bucket.

**Frontend State & Interaction**
- **Single Page Application (SPA):** Engineered a responsive client interface to consume the RESTful APIs.
- **Stateless Token Management:** Handled the secure storage and transmission of JWT Bearer tokens in HTTP headers for every authenticated request.
- **Direct-to-Cloud Uploads:** Implemented the client-side logic to request pre-signed URLs from the API and execute `PUT` requests directly against the AWS S3 endpoint, resulting in lightning-fast, highly scalable file transfers.

### Phase 2: Cloud Deployment, Containerization, & Network Security
With the software architecture complete, this phase transitioned the application from a local development environment into a production-grade, distributed cloud environment.

**Immutable Infrastructure via Containerization**
- **Dockerization:** Wrote highly optimized, custom Dockerfiles for the backend services. 
- **Multi-stage Builds:** Utilized multi-stage container builds to compile dependencies in an isolated environment before copying them into a lean runtime image, drastically reducing the final container size and minimizing the security attack surface.
- **Environment Parity:** Abstracted all configuration (Database URLs, S3 Bucket names, Secret Keys) into environment variables injected at runtime, strictly adhering to Twelve-Factor App methodology.

**Compute & Managed Services**
- **Elastic Container Service (ECS):** Deployed the containerized backend onto Amazon ECS, transitioning from a monolithic local execution to a scalable, container-orchestrated runtime.
- **Managed Relational Database Service (RDS):** Migrated the local PostgreSQL database to Amazon RDS, offloading patch management, automated snapshot backups, and high-availability failover to the cloud provider.
- **Elastic Container Registry (ECR):** Established a private AWS ECR repository to securely store, version, and manage the Docker images.

**Cloud Networking & "ClickOps" Configuration**
- **VPC & Internet Gateways:** Manually constructed a Virtual Private Cloud (VPC) to serve as the logical network boundary for the application, attaching an Internet Gateway to allow external traffic.
- **Security Group Firewalls:** Configured stateful firewall rules (Security Groups) to strictly control ingress/egress traffic. Specifically, the RDS database Security Group was configured to reject all internet traffic, only accepting connections originating from the internal ECS Security Group.

### Phase 3: DevOps Automation, GitOps, & Infrastructure as Code (IaC)
The manual cloud configurations ("ClickOps") of Phase 2 were entirely eliminated. This phase introduced enterprise-grade DevOps practices, making the infrastructure perfectly reproducible, version-controlled, and fully automated.

**Infrastructure as Code (Terraform)**
- **Declarative State Management:** Translated the entire AWS ecosystem (Networking, Compute, Storage, IAM) into HashiCorp Configuration Language (HCL).
- **Zero-Downtime State Adoption:** Executed surgical `terraform import` commands to adopt existing stateful resources (like the S3 buckets containing user data) into the Terraform state file without destroying or recreating them.
- **Advanced Network Topologies:** Engineered a custom, multi-tier VPC architecture. The ECS compute nodes were placed in Public Subnets (to receive API traffic), while the RDS database was placed in strict Private Subnets with absolutely no routing to the public internet, creating an impenetrable network perimeter.
- **Dynamic Credential Generation:** Eliminated hardcoded database passwords by utilizing Terraform's `random_password` provider to dynamically generate, assign, and output database credentials securely.

**Secure CI/CD Pipelines (GitHub Actions)**
- **Application Pipeline (CI):** Built a workflow that automatically triggers on Pull Requests. It runs the automated test suite, builds the Docker image, tags it with the Git commit SHA for absolute traceability, pushes it to ECR, and triggers a rolling update in ECS.
- **Infrastructure Pipeline (CD):** Built a GitOps workflow where infrastructure changes are proposed via Pull Requests. GitHub Actions automatically runs `terraform plan` and posts the dry-run output to the PR for human review. Upon merging to the main branch, `terraform apply` is executed to safely mutate the cloud environment.
- **Remote State Locking:** Configured Terraform to store its state file remotely in a secure S3 bucket, utilizing a DynamoDB table for state-locking to prevent race conditions during concurrent CI/CD pipeline executions.

**OpenID Connect (OIDC) & Least Privilege Identity**
- **Eradication of Static Secrets:** Removed all long-lived AWS Access Keys (IAM Users) from GitHub Secrets.
- **Federated OIDC Authentication:** Established a cryptographic trust relationship between GitHub Actions and AWS via OpenID Connect. The CI/CD pipeline dynamically requests short-lived, temporary STS tokens for deployment, drastically improving security posture.
- **Granular IAM Roles:** Applied the Principle of Least Privilege across the architecture:
  - *Deploy Role:* Granted GitHub Actions only the exact permissions needed to upload images to ECR and update the ECS service.
  - *Task Execution Role:* Granted ECS the authority to pull images from ECR.
  - *Task Role:* Granted the running Python container the authority to execute `PutObject` and `GetObject` commands strictly against the specific S3 file-storage bucket, blocking access to all other AWS resources.
