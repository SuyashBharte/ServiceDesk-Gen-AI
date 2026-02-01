# 🌌 ServiceDesk Gen-AI  
### 🤖 AI-Powered IT Service Management & Request Automation Platform

ServiceDesk Gen-AI is an **enterprise-grade IT Service Management (ITSM) and Service Request Management platform** designed to automate issue intake, streamline ticket workflows, and deliver actionable operational insights.  
The system features a **modern dark-themed dashboard**, **role-based access**, and **Generative AI-powered ticket classification** using **Google Gemini**.

---

## 🚀 Key Capabilities

### 🤖 Generative AI-Driven Ticket Intake
- **AI Chatbot Interface** powered by Google Gemini  
- Users can describe issues in natural language (e.g., *“The AC in lab 3 is not cooling”*)
- Automatically detects:
  - Ticket category  
  - Priority & severity  
  - Creates tickets without manual form filling
- **Context-aware conversations** for improved accuracy and user experience

---

### 🎫 Intelligent Ticket Lifecycle Management
- **Smart Assignment Engine**
  - Automatically assigns tickets to staff with the **lowest active workload** in the relevant category
- **Complete Audit Trail**
  - Logs every action (status change, reassignment, remarks, priority updates)
  - Transparent activity timeline for compliance and traceability
- **SLA Automation & Intelligence**
  - Critical: 2 hours  
  - High: 4 hours  
  - Medium: 24 hours  
  - Low: 48 hours  
- Automatic SLA breach detection and escalation

---

### 📊 Real-Time Analytics & Admin Dashboard
- Live visibility into:
  - Active vs resolved tickets
  - Category-wise request distribution
  - Staff workload and efficiency
- **KPI Monitoring**
  - SLA compliance rate
  - Resolution time trends
  - Open ticket volume
- Interactive charts built using **Recharts**

---

### 🛡️ Enterprise-Grade Security
- **JWT-based authentication** for secure API access
- **Role-Based Access Control (RBAC)**
  - User – Raise and track tickets
  - Staff – Manage and resolve assigned tickets
  - Admin – Full system control and analytics
- **Google OAuth 2.0** for seamless and secure login
- Protected backend routes and secure API layer

---

## 🧩 System Roles

| Role | Capabilities |
|----|-------------|
| 👤 User | Raise tickets, track status, view history |
| 🧑‍💼 Staff | Manage assigned tickets, update status, add remarks |
| 🛠️ Admin | User management, SLA rules, analytics, audit logs |

---

## 🛠️ Technology Stack

### Frontend 🎨
- React  
- React Router    
- Recharts  
- Lucide Icons  

### Backend ⚙️
- Node.js  
- Express.js  
- RESTful APIs  

### Database 🗄️
- MongoDB  
- Mongoose ODM  

### AI Engine 🧠
- Google Generative AI (Gemini 1.5 Flash)

### Authentication & Security 🔐
- JWT  
- Passport.js  
- Google OAuth 2.0  

---

## 📦 Getting Started

### 1️⃣ Prerequisites
- Node.js v16+  
- MongoDB Atlas or Local MongoDB  
- Google Gemini API Key  
- Google OAuth Credentials  

---

### 2️⃣ Installation

Clone the repository and install dependencies:

```bash
# Backend setup
cd server
npm install

# Frontend setup
cd ../client
npm install
