# websiteChangeAnalyzer

## Overview
websiteChangeAnalyzer is a full-stack application designed to monitor web pages for changes and notify users via email when a change is detected. It allows users to specify URLs to monitor and email addresses to notify, providing a user-friendly interface and automated monitoring.

---

## Features
- Monitor any web page for content changes
- Email notifications to specified recipients when changes are detected
- Web interface for managing monitored URLs and notification emails
- REST API backend for project management
- Dockerized for easy deployment

---

## Architecture
The project consists of three main components:

### 1. **Frontend** (`/frontend`)
- Built with React (Create React App)
- Provides a user interface to add, view, and manage monitored URLs and notification emails
- Communicates with the backend via REST API

### 2. **Backend** (`/backend`)
- Built with Node.js, Express, and MongoDB (Mongoose)
- Exposes API endpoints to manage monitoring projects (URLs and emails)
- Stores project data in MongoDB

### 3. **Monitor Service** (`/monitor`)
- Python script (`monitor.py`) that periodically checks specified URLs for changes
- Compares the current content hash to the last known hash
- Sends email notifications if a change is detected
- Stores the last hash in a file (`last_hash.txt`)
- Uses environment variables for configuration (URL, recipients, email credentials)

---

## How It Works
1. **User adds a URL and notification emails via the frontend.**
2. **Backend stores this information as a "project" in MongoDB.**
3. **Monitor service fetches the web page, computes a hash of its content, and compares it to the previous hash.**
4. **If a change is detected, an email is sent to the specified recipients, and the new hash is saved.**

---

## Setup & Deployment

### Prerequisites
- Docker & Docker Compose (recommended)
- Node.js & npm (for backend/frontend development)
- Python 3.10+ (for monitor service)

### Environment Variables
- The monitor service requires the following environment variables:
  - `URL_TO_USE`: The URL to monitor
  - `RECIPIENTS`: Comma-separated list of email addresses to notify
  - `SENDER_EMAIL`: The sender's email address (Gmail)
  - `SENDER_PASSWORD`: The sender's email password or app password

### Running with Docker Compose
1. Clone the repository
2. Configure environment variables as needed
3. Run:
   ```sh
   docker-compose up --build
   ```

### Running Manually
- **Frontend:**
  ```sh
  cd frontend
  npm install
  npm start
  ```
- **Backend:**
  ```sh
  cd backend
  npm install
  npm start
  ```
- **Monitor:**
  ```sh
  cd monitor
  pip install -r requirements.txt
  python monitor.py
  ```

---

## File Structure
- `/frontend` - React app for the user interface
- `/backend` - Express API and MongoDB models
- `/monitor` - Python script for monitoring and notification
- `docker-compose.yml` - Orchestrates all services

---

## Example API Endpoints (Backend)
- `GET /api/projects` - List all monitored projects
- `POST /api/projects` - Add a new project (URL + emails)

---

## Technologies Used
- React, Tailwind CSS (Frontend)
- Node.js, Express, MongoDB, Mongoose (Backend)
- Python, Requests, BeautifulSoup, SMTP (Monitor)
- Docker, Docker Compose

---

## License
MIT

---

## Author
[Your Name]

---

## Acknowledgements
- [Create React App](https://github.com/facebook/create-react-app)
- [BeautifulSoup](https://www.crummy.com/software/BeautifulSoup/)
- [Express](https://expressjs.com/)
- [Mongoose](https://mongoosejs.com/)
