# 🎯 Asknalyze - AI Interview Analysis Platform

Asknalyze is a full-stack web application that helps users track, analyze, and improve their interview performance using AI. Users can add questions from past interviews, upload Excel sheets, and receive detailed feedback and success predictions based on AI-powered analysis.

---

## 🚀 Features

- 🔐 User registration, login, and password reset
- 🧠 Add interview questions manually or via Excel file
- 📊 AI-generated insights: Did you answer well? How to improve?
- 🏢 Role- and company-based analytics dashboard
- 🧾 Job Description-based question analysis
- 📈 PDF and Email-based performance reports
- 🧰 Update user profile and preferences
- 📡 Microservice-based backend with scalability in mind

---

## 🧑‍💻 Tech Stack

### Frontend
- **React** (with Vite)
- **Tailwind CSS**
- **React Router**
- **Axios**

### Backend
- **Spring Boot** (Microservice architecture)
- **OpenAI API** for question feedback and analysis
- **MongoDB** (Flexible NoSQL DB for interviews & users)

---

## 📁 Folder Structure

```bash
asknalyze/
├── frontend/       # React + Tailwind
│   ├── components/
│   ├── pages/
│   └── services/
└── backend/        # Spring Boot Microservices
    ├── auth-service/
    ├── user-service/
    ├── interview-service/
    └── ai-analysis-service/
