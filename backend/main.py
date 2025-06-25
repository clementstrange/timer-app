from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import create_engine, Column, Integer, String, DateTime
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from datetime import datetime

# ===== DATABASE SETUP =====
SQLALCHEMY_DATABASE_URL = "sqlite:///./timer_app.db"
engine = create_engine(
    SQLALCHEMY_DATABASE_URL, 
    connect_args={"check_same_thread": False}
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# ===== DATABASE MODEL =====
class WorkSession(Base):
    __tablename__ = "work_sessions"
    
    task_id = Column(Integer, primary_key=True, index=True)
    task_name = Column(String, index=True)
    time_worked = Column(Integer)
    time_saved = Column(DateTime, default=datetime.utcnow)

# Create tables
Base.metadata.create_all(bind=engine)

# ===== FASTAPI APP SETUP =====
app = FastAPI(title="Timer App API")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

print("FastAPI server starting with CRUD endpoints")

# ===== HELPER FUNCTIONS =====
def get_db():
    """Get database session"""
    db = SessionLocal()
    try:
        return db
    finally:
        pass  # We'll close manually in each endpoint

# ===== API ENDPOINTS =====

@app.post("/task")
async def create_task(request: Request):
    """Create a new task"""
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
async def get_latest_sessions():
    """Get the 10 most recent tasks"""
    db = SessionLocal()
    latest_sessions = db.query(WorkSession).order_by(
        WorkSession.task_id.desc()
    ).limit(10).all()
    db.close()
    
    if latest_sessions:
        return [
            {
                "task_name": session.task_name,
                "time_worked": session.time_worked,
                "task_id": session.task_id,
                "time_saved": session.time_saved
            }
            for session in latest_sessions
        ]
    else:
        return []


@app.delete("/task/{task_id}")
async def delete_task(task_id: int):
    """Delete a task by ID"""
    db = SessionLocal()
    
    # Find the task by ID
    task_to_delete = db.query(WorkSession).filter(
        WorkSession.task_id == task_id
    ).first()
    
    if task_to_delete:
        db.delete(task_to_delete)
        db.commit()
        db.close()
        return {"message": "Task deleted successfully"}
    else:
        db.close()
        return {"error": "Task not found"}


@app.put("/task/{task_id}")
async def update_task(task_id: int, request: Request):
    """Update a task by ID"""
    body = await request.json()
    task_name = body.get("task_name")
    time_worked = body.get("time_worked")
    
    db = SessionLocal()
    task_to_edit = db.query(WorkSession).filter(
        WorkSession.task_id == task_id
    ).first()
    
    if task_to_edit:
        task_to_edit.task_name = task_name
        task_to_edit.time_worked = time_worked
        db.commit()
        db.close()
        return {"message": "Task updated successfully"}
    else:
        db.close()
        return {"error": "Task not found"}