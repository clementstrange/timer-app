# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Architecture

This is a Pomodoro timer application with multiple frontend implementations and a shared FastAPI backend:

- **timer-supabase/**: Production React app with Supabase authentication and data persistence
- **localfront/**: Local-only React app using localStorage for task storage  
- **frontend/**: Legacy React app with Axios integration to FastAPI backend
- **backend/**: FastAPI server with SQLAlchemy ORM and PostgreSQL/SQLite support

The main production app (timer-supabase) implements:
- User authentication via Supabase
- Task management with CRUD operations
- Pomodoro timer with work/break cycles (25min work, 5min break)
- Data persistence in Supabase with guest-to-user migration
- Mobile-responsive design with desktop-centered layout

## Development Commands

### Frontend Development (timer-supabase - main app)
```bash
cd timer-supabase
npm start          # Run development server on localhost:3000
npm test           # Run test suite
npm run build      # Build for production
```

### Local Development (localfront - localStorage only)
```bash
cd localfront
npm start          # Run development server on localhost:3000
npm test           # Run test suite  
npm run build      # Build for production
```

### Backend Development (FastAPI)
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload  # Run server on localhost:8000
```

## Key Technical Details

- **Database**: The backend supports both SQLite (local) and PostgreSQL (production) via DATABASE_URL environment variable
- **CORS**: Configured for localhost:3000 and https://timer-app-q7nv.vercel.app
- **Authentication**: Supabase handles user auth with Row Level Security policies
- **State Management**: React useState/useRef for timer state, Supabase client for data operations
- **Responsive Design**: CSS-in-JS with mobile-first approach, desktop gets centered 600px frame

## Current Development Status

Based on DEVJOURNAL.md, recent focus areas:
- Task persistence and localStorage migration bugs
- Timer state management and session transitions
- Mobile responsiveness and desktop layout optimization
- Authentication flow improvements
- Memory leak prevention and cleanup logic

The app is production-ready and deployed, with ongoing refinements to user experience and data consistency.