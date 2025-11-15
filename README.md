# 🚘 AI-Powered Vehicle Condition Assessment

### **Full Stack • Computer Vision • Angular • NestJS • YOLOv8 • Docker • FastAPI**

A complete end-to-end system that **automatically compares pre-rental and post-rental vehicle images**, detects damages using an AI vision model (YOLOv8), and generates a cost & severity assessment — all through a polished Angular web interface and fully Dockerized microservices.

> ✔️ **Live Demo Frontend:** https://vehicle-frontend-0l5h.onrender.com/  
> ✔️ **Live Backend Swagger:** https://vehicle-backend-fr92.onrender.com/api/docs  
> ✔️ **AI Service Health:** https://vehicle-ai-service-z8bl.onrender.com/health

---

## 📌 Table of Contents

- [🚘 AI-Powered Vehicle Condition Assessment](#-ai-powered-vehicle-condition-assessment)
    - [**Full Stack • Computer Vision • Angular • NestJS • YOLOv8 • Docker • FastAPI**](#full-stack--computer-vision--angular--nestjs--yolov8--docker--fastapi)
  - [📌 Table of Contents](#-table-of-contents)
  - [🎯 Problem Overview](#-problem-overview)
  - [🚀 Final Deliverable](#-final-deliverable)
  - [🧩 Features](#-features)
  - [📦 Folder Structure](#-folder-structure)
  - [⚙️ Installation (Local)](#️-installation-local)
    - [🔧 AI Service (FastAPI)](#-ai-service-fastapi)
    - [🔧 Backend (NestJS)](#-backend-nestjs)
    - [🔧 Frontend (Angular)](#-frontend-angular)
  - [🐳 Docker Setup](#-docker-setup)
    - [Run All Services Together](#run-all-services-together)
  - [🌐 Deployment (Render.com)](#-deployment-rendercom)
    - [🚀 AI Service](#-ai-service)
    - [🚀 Backend](#-backend)
    - [🚀 Frontend](#-frontend)
  - [🧪 Tests](#-tests)
    - [Frontend](#frontend)
    - [Backend](#backend)
    - [AI Service](#ai-service)
  - [📘 API Documentation](#-api-documentation)
  - [📄 Notes](#-notes)
  - [⏭️ Future Enhancements](#️-future-enhancements)
    - [🤖 AI Enhancements](#-ai-enhancements)
    - [🧪 Automation \& CI/CD](#-automation--cicd)
    - [🗂 Backend \& Data](#-backend--data)
    - [🖼 UX / UI](#-ux--ui)
  - [🏁 Final Words](#-final-words)
  - [🤝 Contributing](#-contributing)

---

## 🎯 Problem Overview

Rental companies usually capture two sets of images:

- **Pickup:** vehicle before renting
- **Return:** vehicle after returning

The goal is to automatically detect:

✔ New damages  
✔ Worsened damages  
✔ Severity level  
✔ Estimated cost  
✔ Damaged panels

This system performs a **fair, consistent, and automated assessment** using computer vision and a modular full-stack architecture.

---

## 🚀 Final Deliverable

A fully functional, deployed, production-ready damage assessment system:

✔️ **Angular Web Frontend** (Material + Signals + Overlays)  
✔️ **NestJS Backend API** (REST + Swagger)  
✔️ **FastAPI YOLOv8 AI Microservice** (Damage Detection)  
✔️ **Cloud Deployment** via Render (Free Tier)  
✔️ **Fully Dockerized Architecture**  
✔️ **Real-Time Image Overlays** with Bounding Boxes  
✔️ **Multiple Images Support**  
✔️ **Unit Tests** for all layers

---
---

## 🧩 Features

✔ Multi-image Upload (Pickup + Return)  
✔ YOLOv8 Damage Detection  
✔ Bounding Box Overlays on Images  
✔ Severity Score & Cost Estimation  
✔ New/Worsened Damage Comparison  
✔ Modern Responsive UI  
✔ Animated Cards & Chips (Angular Material)  
✔ REST API with Swagger  
✔ 3-tier Deployment (Frontend + Backend + AI)

---

## 📦 Folder Structure
```
root
│
├── frontend/           # Angular App
│   ├── src/
│   └── Dockerfile
│
├── backend/            # NestJS API
│   ├── src/
│   └── Dockerfile
│
└── ai-service/         # FastAPI YOLO Service
    ├── main.py
    ├── models/
    ├── Dockerfile
    └── requirements.txt
```

---

## ⚙️ Installation (Local)

Clone the repo:
```bash
git clone 
cd 
```

### 🔧 AI Service (FastAPI)
```bash
cd ai-service
pip install -r requirements.txt
uvicorn main:app --reload
```

### 🔧 Backend (NestJS)
```bash
cd backend
npm install
npm run start:dev
```

### 🔧 Frontend (Angular)
```bash
cd frontend
npm install
npm start
```

---

## 🐳 Docker Setup

### Run All Services Together
```bash
docker compose up --build
```

Services are available at:

| Service    | URL                                    |
|------------|----------------------------------------|
| Frontend   | http://localhost:4200                  |
| Backend    | http://localhost:3000/api/docs         |
| AI Service | http://localhost:8000/health           |

---

## 🌐 Deployment (Render.com)

Three separate Docker deployments:

### 🚀 AI Service
- **Root:** `ai-service`
- **Runtime:** Docker
- **PORT** handled dynamically
- **Health URL:** https://vehicle-ai-service-z8bl.onrender.com/health

### 🚀 Backend
- **Root:** `backend`
- **Docker runtime**
- **Environment Variables:**
```ini
  AI_BASE_URL=https://vehicle-ai-service-z8bl.onrender.com
  NODE_ENV=production
```
- **Swagger:** https://vehicle-backend-fr92.onrender.com/api/docs

### 🚀 Frontend
- **Root:** `frontend`
- **Served via** Docker + Nginx
- **Production API URL:**
```bash
  https://vehicle-backend-fr92.onrender.com/api
```
- **Live UI:** https://vehicle-frontend-0l5h.onrender.com/

---

## 🧪 Tests

### Frontend
- Karma & Jasmine
- UI behavior tests
- Component unit tests

### Backend
- Jest
- Service & controller unit tests

### AI Service
- FastAPI TestClient
- Health & inference smoke tests

---

## 📘 API Documentation

Swagger auto-generated:

- **Online:** https://vehicle-backend-fr92.onrender.com/api/docs
- **Local:** http://localhost:3000/api/docs

---

## 📄 Notes

This project demonstrates:

- Clean, modular architecture
- Full AI + Backend + Frontend integration
- Professional UX/UI
- Real object detection + overlays
- Docker-based microservices
- Cloud deployment (free tier)
- Proper code structure, comments, and best practices
- All work is done without any paid service

---

## ⏭️ Future Enhancements

### 🤖 AI Enhancements
- Fine-tune YOLO specifically on Lebanese vehicle damage sets
- Create `car_damage.pt` with custom labels
- Add panel segmentation model
- Multi-angle consistency checking
- More specialized dent/scratch/crack classification

### 🧪 Automation & CI/CD
- Playwright E2E testing
- GitHub Actions CI/CD
- Automatic deploy pipeline

### 🗂 Backend & Data
- Real database (PostgreSQL)
- Audit logs & historical reports
- Advanced decision engine (damage pricing model)

### 🖼 UX / UI
- PDF report export
- Interactive damage annotation
- Full before/after diff viewer
- Multi-language support

---

## 🏁 Final Words

This project is a complete end-to-end AI-powered vehicle inspection solution:

- Beautiful frontend
- Smart backend
- Real YOLOv8 detection
- Modern engineering practices
- Fully deployed & operational online

It represents a production-ready approach to automated car damage inspection, built with clean code, scalability, and practicality in mind.

---


## 🤝 Contributing

Contributions, issues, and feature requests are welcome!

---

⭐ **Star this repo if you find it useful!**