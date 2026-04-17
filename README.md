# CodeSnap

A full-stack code snippet sharing platform where developers save, organize, enhance, and share code snippets publicly or privately.

## Live Demo
- **Frontend:** Deployed on [Vercel](https://code-snap-theta.vercel.app)
- **Backend:** Deployed on [Render](https://codesnap-api-jgca.onrender.com)
- **Database:** Hosted on Railway

## Built With
- **Frontend** — React, React Router, Highlight.js
- **Backend** — Node.js, Express.js
- **Database** — PostgreSQL with Prisma ORM
- **Auth** — JWT tokens with bcrypt
- **AI Integration** — Google Gemini 2.5 Flash API
- **Deployment** — Vercel (Client), Render (Server)

## Features
- **AI Code Assistant:** Generate instant, beginner-friendly explanations and suggested improvements for any saved snippet.
- **Smart Syntax Highlighting:** Beautifully formatted code blocks for 10+ programming languages.
- **Public & Private Snippets:** Control the visibility of your code.
- **Shareable Links:** Generate public URLs to share specific snippets with anyone.
- **Search & Filter:** Find snippets quickly by title, description, or programming language.
- **Pagination:** Smooth navigation for large collections of code.
- **Full CRUD:** Create, read, update, and delete snippets effortlessly.

## Installation

```bash
git clone https://github.com/rajrathore0107/CodeSnap.git
cd CodeSnap

# Backend Setup
cd server
npm install

# Create a .env file in the server directory with:
# DATABASE_URL="your_postgresql_url"
# JWT_SECRET="your_jwt_secret"
# GEMINI_API_KEY="your_google_gemini_api_key"

npx prisma migrate dev
npm run dev

# Frontend Setup (in a new terminal)
cd client
npm install
npm start
