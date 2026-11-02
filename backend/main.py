from fastapi import FastAPI, HTTPException
from pydantic import BaseModel

from agent import run_agent

app = FastAPI()


class ChatMessage(BaseModel):
    role: str
    content: str


class ChatRequest(BaseModel):
    message: str
    history: list[ChatMessage] = []


@app.post("/api/chat")
def chat(req: ChatRequest):
    try:
        reply = run_agent(req.message, [m.model_dump() for m in req.history])
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    return {"reply": reply}
