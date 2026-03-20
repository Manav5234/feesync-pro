<div align="center">

# 🎓 FeeSync Pro

### College Fee Management System for IIIT Sonepat

[![Live Demo](https://img.shields.io/badge/Live%20Demo-feesync--pro.vercel.app-brightgreen?style=for-the-badge)](https://feesync-pro.vercel.app)
[![Made with React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org)
[![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)](https://supabase.com)
[![Deployed on Vercel](https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://vercel.com)

</div>

---

## 📌 About

**FeeSync Pro** is a full-stack web application built for **IIIT Sonepat** to streamline the college fee receipt submission and verification process.

Students submit their fee receipts online → Admins verify them → Students get notified instantly. No paperwork. No confusion.

This is made by me completely with my skills and vibe coding .<br>
Note --> Dont assume that this is fully written by me but with my skills and AI.<br>
My Message --> My only purpose in this project is to learn new things,new extensions and how i can solve my real life problem and make its own solution. 

---

## ✨ Features

### 👨‍🎓 Student Portal
- 🔐 Login with Google OAuth or Email/Password (`@iiitsonepat.ac.in` only)
- 📝 Submit fee/scholarship applications with details
- 📁 Track all submitted applications & their status
- 🔔 Receive real-time notifications when verified/rejected

### 🛡️ Admin Portal
- 🔐 Secure admin-only login (manually whitelisted emails)
- 📊 Dashboard with total, pending, verified & rejected counts
- ✅ Verify or ❌ reject applications with remarks
- 📦 Bulk verify/reject multiple applications at once
- 📤 Export data to Excel roll-number wise
- 📢 Broadcast notifications to students

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React + Vite + TypeScript |
| Styling | Tailwind CSS + shadcn/ui |
| Backend | Supabase (PostgreSQL + Auth + RLS) |
| Deployment | Vercel |
| Auth | Google OAuth + Email/Password |

---

## 🗄️ Database Tables

- `profiles` — student/admin user profiles
- `applications` — fee/scholarship submissions
- `documents` — uploaded documents
- `notifications` — student notifications
- `admin_emails` — whitelisted admin emails
- `user_roles` — role management

---

## 🚀 Getting Started
```bash
# Clone the repo
git clone https://github.com/Manav5234/feesync-pro.git

# Navigate into the project
cd feesync-pro

# Install dependencies
npm install

# Start development server
npm run dev
```

### Environment Variables
Create a `.env` file:
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

---

## 👨‍💻 Developer

**Manav** — 1st Year CSE @ IIIT Sonepat

[![GitHub](https://img.shields.io/badge/GitHub-Manav5234-black?style=flat&logo=github)](https://github.com/Manav5234)

---

<div align="center">
Built with ❤️ for IIIT Sonepat
</div>
