from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi import Request

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
async def root(request: Request):
    body = await request.json()
    inputValue = body.get("task")
    print(f"Received task: {inputValue}")  # This will show in your server terminal

    return {"task": inputValue}

