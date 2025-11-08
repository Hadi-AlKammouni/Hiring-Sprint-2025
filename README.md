# 🚗 AI-Powered Vehicle Condition Assessment — Hiring Sprint

> **⏱️ Duration:** 48 hours
> **🎯 Purpose:** Build a working prototype that automates vehicle condition inspections for rental businesses (cars, scooters, boats, equipment).
> **👥 Format:** Solo or team participation.

---

## 🧭 Table of Contents

1. [Overview](#-overview)
2. [Deliverables & Checklist](#-deliverables--checklist)
3. [Judging Criteria](#-judging-criteria)
4. [Technical Requirements](#-technical-requirements)
5. [Repository Guidelines](#-repository-guidelines)
6. [Deployment Requirements](#-deployment-requirements)
7. [API Specification](#-api-specification)
8. [AI / LLM Resources](#-ai--llm-resources)
9. [Frontend Recommendations](#-frontend-recommendations)
10. [Testing & Bonus Points](#-testing--bonus-points)
11. [Security & Privacy](#-security--privacy)
12. [Submission Instructions](#-submission-instructions)
13. [FAQ & Tips](#-faq--tips)

---

## 🧩 Overview

Challenge developers to design and implement an **AI-powered vehicle condition assessment** feature.
The system should enable customers to capture photos at **pick-up and return**, automatically detect damages, and display reports.

**Accepted formats:** web app 🌐, mobile app 📱, or chatbot 🤖.
Use of pretrained AI/ML models or APIs is **allowed** ✅.

### 🧱 Tech Choice Clarification

* Choose **one frontend**: either **Web** 🌐 *or* **Mobile** 📱.
* You may use **any backend language or framework** (Node.js, Python, Go, etc.).
* No persistent storage is required — you can simulate uploads and results in memory.

**Goal:**

* Capture/upload vehicle images
* Detect & compare damages between pick-up and return
* Estimate severity & cost 💰
* Display results in a simple dashboard
* Provide REST or GraphQL APIs for integration

---

## 📦 Deliverables & Checklist

| Deliverable                 | Description                                          |
| --------------------------- | ---------------------------------------------------- |
| 🌐 **Deployed Service URL** | Publicly accessible link or Docker run instructions  |
| 💻 **GitHub Repo**          | All code, infra configs, and setup steps             |
| 📘 **Documentation**        | README, API docs (OpenAPI/GraphQL), AI model notes   |
| 🎥 **Video Walkthrough**    | 2–5 minute demo showing capture → detection → report |
| 🔑 **Demo Credentials**     | Username/password or tokens (in `.env.example`)      |

**Submission checklist:**

* [ ] Deployed URL
* [ ] GitHub repo (link)
* [ ] Architecture diagram
* [ ] API docs
* [ ] Model integration notes
* [ ] Walkthrough video
* [ ] Test plan / sample tests

---

## 🏁 Judging Criteria (100 pts)

| Criteria                 | Points | Description                                    |
| ------------------------ | ------ | ---------------------------------------------- |
| ⚙️ Functionality         | 40     | End-to-end working prototype                   |
| 🧠 AI Accuracy           | 20     | Detects and highlights new damages             |
| 🎨 UX & Design           | 15     | Clean, intuitive, aligned with rental workflow |
| 🧩 Engineering Quality   | 10     | Structure, docs, and reproducibility           |
| 🔌 Integration Readiness | 5      | API clarity and documentation                  |
| 💡 Innovation & Extras   | 10     | Bonus features or creative additions           |

**Tiebreakers:** demo clarity, documentation quality, deployment reliability.

---

## ⚙️ Technical Requirements

* **Timeframe:** 48 hours ⏰
* **Frontend:** choose **Web** 🌐 or **Mobile** 📱 (not both).
* **Backend:** any language (Node.js, Python, Go, Java, etc.) — focus on simplicity.
* **Photo Capture:** browser/mobile camera APIs (no external SDKs).
* **AI Models:** pretrained or API-based (YOLO, Detectron, Vision APIs).
* **Damage Comparison:** side-by-side or overlay visual diff 🆚.
* **Reporting:** JSON + UI (severity, estimated cost).
* **Storage:** ❌ Not required — simulate uploads and comparisons in-memory.
* **Privacy:** no real customer data, mask sensitive info.

---

## 📁 Repository Guidelines

```
/ (root)
├── README.md
├── /docs
│   ├── architecture.md
│   ├── api-schema.yaml
├── /backend
├── /frontend
├── /models
├── /infra
├── /tests
├── .env.example
├── Dockerfile
└── docker-compose.yml
```

Include:

* `CONTRIBUTING.md` (team guide)
* `LICENSE` (MIT recommended)
* CI/CD pipeline (GitHub Actions optional)

---

## ☁️ Deployment Requirements

### 🌐 Web App

* Deploy via **Cloud Run**, **Render**, **Vercel**, or **Netlify**.
* Include `Dockerfile` & `.env.example`.
* Must be publicly accessible or runnable via Docker.

### 📱 Mobile App

Participants can build mobile apps using **React Native (Expo)**, **Flutter**, or **Native Android**.

#### **Option 1 — React Native (Expo)** 🥇

> ⚡ Recommended for solo developers — no native setup required.

**How to deploy:**

```bash
npx create-expo-app ai-vehicle-inspection
npx expo publish
```

**Shareable link example:**

```
https://expo.dev/@yourusername/ai-vehicle-inspection
```

Judges can open via **Expo Go** on iOS/Android instantly.
Include this link in your submission.

#### **Option 2 — Flutter**

> Build and share a lightweight web or APK build.

```bash
flutter build apk --debug
flutter build web
```

Then host:

* APK on Google Drive / GitHub Releases
* Web build on Vercel, Netlify, or Firebase Hosting

Include both the **download link** and **install instructions**.

#### **Option 3 — Native Android**

> For Kotlin/Java developers.

```bash
./gradlew assembleDebug
```

Upload `app-debug.apk` and share a public download link.

#### 🧭 Mobile Deployment Summary

| Framework               | How to Deploy          | Judge Access                  |
| ----------------------- | ---------------------- | ----------------------------- |
| **Expo (React Native)** | Publish via Expo Cloud | QR code / link via Expo Go    |
| **Flutter**             | Build web or APK       | Direct download or hosted web |
| **Native Android**      | Debug APK build        | Manual install                |

---

### 🤖 Chatbot UI

* Host a minimal web chat interface that accepts image uploads.
* Display damage detection summaries.
* Can use **Next.js + LangChain + Vision API** or similar stack.

📘 Include setup steps in `docs/deployment.md`.

---

## 🔗 API Specification (Suggested)

| Method | Endpoint                      | Description                                   |
| ------ | ----------------------------- | --------------------------------------------- |
| `POST` | `/api/inspections`            | Create new inspection (upload pick-up images) |
| `POST` | `/api/inspections/:id/return` | Upload return images & trigger comparison     |
| `GET`  | `/api/inspections/:id`        | Retrieve inspection results (JSON + UI)       |
| `GET`  | `/api/inspections`            | List all inspections for a vehicle            |

💡 **Tip:** Include Swagger/OpenAPI docs or GraphQL schema + curl samples.

---

## 🧠 AI / LLM Resources

**Cloud APIs:**
☁️ Google Cloud Vision
🔍 Azure Computer Vision
🧩 AWS Rekognition

**Hosted APIs:**
🤖 OpenAI Vision / GPT-4V
🧬 Hugging Face / Replicate (YOLO, DETR, SAM)

**Open Source Models:**
🦾 YOLOv8 / YOLOv7
🧩 Detectron2 / Mask R-CNN
🖼️ Segment Anything (SAM)
🎯 Grounding DINO

**LLM Integration Ideas:**

* Convert model output → human-readable summary.
* Example: *“Detected new scratch on front bumper; estimated repair cost: $80.”*

---

## 💅 Frontend Recommendations

**Frontend Choice:**
You must pick **either Web 🌐 or Mobile 📱** as your primary interface.

**Core Flow:** Vehicle info → photo capture → AI detection → damage report

**UX Tips:**

* Side-by-side comparison with highlight overlays 🔍
* Manual correction (false positives/negatives)
* Exportable PDF/JSON reports 📄
* Mobile-first design if targeting phone users 📱

**Stacks:**

* Web: **React (Next.js/Vite) + Tailwind CSS**
* Mobile: **React Native (Expo)** or **Flutter**
* Chatbot: **React + Chat UI + Image Upload**

---

## 🧪 Testing & Bonus Points

| Bonus Area                 | Points |
| -------------------------- | ------ |
| ✅ Automated tests          | +20    |
| 🔁 CI/CD pipeline          | +10    |
| 📊 Model evaluation        | +10    |
| 📶 Offline capture/sync    | +10    |
| 🧩 Explainability features | +10    |

Include instructions to run tests (`npm test`, `pytest tests/`, etc.).

---

## 🔒 Security & Privacy

* Mask/blur license plates & personal data 🕵️‍♂️
* Store minimal image data 🔐
* Use `.env` for all API keys 🔑
* Add a `DELETE` API for cleanup ♻️

---

## 🚀 Submission Instructions

1. Finalize repo → PR to `main` branch.
2. Tag release: `v1-hackathon` 🏷️
3. Include deployed URL + walkthrough video in release notes.
4. Submit via the official sprint form before the deadline.

⏰ **Deadline:** exactly 48 hours after kickoff.
Late submissions will not be accepted (unless due to verified platform issues).

---

## 💬 FAQ & Tips

**Q:** Can we use stock/synthetic images?
**A:** ✅ Yes, label them clearly.

**Q:** Is custom training required?
**A:** ❌ No — use pretrained or hosted models.

**Q:** Do we need to set up storage?
**A:** ❌ No persistent storage required; simulate uploads and responses in memory.

**Q:** How do we estimate cost?
**A:** 💰 Use a simple rule-based or LLM-mapped function.

**Tip:** Spend your first 6–8 hours setting up architecture and AI integration, then focus on MVP delivery.

---

## 🧮 Example Cost Function

```js
const COST_BY_SEVERITY = {
  minor: 50,
  moderate: 150,
  severe: 450
};

function estimateCost(detections) {
  return detections.reduce(
    (sum, d) => sum + COST_BY_SEVERITY[d.severity || 'moderate'],
    0
  );
}
```

---

> 🏁 **Good luck!** Build smart, fast, and ethically. Let your prototype redefine rental inspections 🚀
