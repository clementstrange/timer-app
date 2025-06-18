from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import create_engine, Column, Integer, String, DateTime
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from datetime import datetime
import sqlite3

# Database setup
SQLALCHEMY_DATABASE_URL = "sqlite:///./timer_app.db"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# Database model
class WorkSession(Base):
    __tablename__ = "work_sessions"
    
    task_id = Column(Integer, primary_key=True, index=True)
    task_name = Column(String, index=True)
    time_worked = Column(Integer)
    time_saved = Column(DateTime, default=datetime.utcnow)

# Create tables
Base.metadata.create_all(bind=engine)
app = FastAPI(title="Timer App API")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

print("FastAPI server starting with POST /task endpoint")


@app.post("/task")
async def save_task(request: Request):
    body = await request.json()
    task_name = body.get("task")
    time_worked = body.get("time")
    
    # Save to database
    db = SessionLocal()
    work_session = WorkSession(task_name=task_name, time_worked=time_worked)
    db.add(work_session)
    db.commit()
    db.close()
    
    print(f"Saved to DB: {task_name}, Time worked: {time_worked}")
    return {"task": task_name}

@app.get("/latest-session")
async def get_latest_session():
    db = SessionLocal()
    latest_session = db.query(WorkSession).order_by(WorkSession.task_id.desc()).limit(10).all()
    db.close()
    
    if latest_session:
        return [
            {
                "task_name": session.task_name,
                "time_worked": session.time_worked,
                "time_saved": session.time_saved
            }
            for session in latest_session
        ]
    else:
        return [{"task_name": None, "time_worked": 0, "time_saved": None}]