# CodeSnap

A full stack code snippet sharing platform where developers save, organize and share code snippets publicly or privately.

## Live Demo
> Deployment coming soon

## Built With
- **Frontend** — React, React Router, Highlight.js
- **Backend** — Node.js, Express.js
- **Database** — PostgreSQL with Prisma ORM
- **Auth** — JWT tokens with bcrypt

## Features
- Save code snippets with syntax highlighting for 10+ languages
- Public and private snippets
- Shareable public links — share any snippet with anyone
- Search snippets by title or description
- Filter by programming language
- Pagination for large collections
- Full CRUD — create, edit, delete snippets

## Installation

```bash
git clone https://github.com/rajrathore0107/CodeSnap.git
cd CodeSnap

# Backend
cd server
npm install
npm run dev

# Frontend (new terminal)
cd client
npm install
npm start
```

## Project Structure
```
CodeSnap/
├── client/           # React frontend
│   └── src/
│       ├── pages/    # Login, Register, Dashboard, Explore, ShareView
│       └── api.js    # Axios API helper
└── server/           # Node.js backend
    ├── routes/       # auth.js, snippets.js
    ├── middleware/   # JWT auth
    └── prisma/       # Schema and migrations
```