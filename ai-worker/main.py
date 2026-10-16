"""
Studia AI & Document Worker
Provides PDF outline extraction, text parsing, and contextual AI study assistance.
"""
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional

app = FastAPI(title="Studia AI & Document Processing Service", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ExtractOutlineRequest(BaseModel):
    file_path: str
    project_id: int

class StudyUnitProposal(BaseModel):
    title: str
    page_start: Optional[int] = None
    page_end: Optional[int] = None
    estimated_minutes: int
    difficulty: str = "medium"

class ExtractOutlineResponse(BaseModel):
    units: List[StudyUnitProposal]
    total_estimated_minutes: int

class ContextualAIRequest(BaseModel):
    action: str # "explain", "simplify", "define", "translate", "summarize", "quiz"
    selected_text: str
    surrounding_context: Optional[str] = None
    target_language: Optional[str] = "Arabic"

class ContextualAIResponse(BaseModel):
    action: str
    result: str

@app.get("/health")
def health_check():
    return {"status": "ok", "service": "studia-ai-worker"}

@app.post("/api/documents/extract-structure", response_model=ExtractOutlineResponse)
def extract_structure(request: ExtractOutlineRequest):
    # Provisional implementation / stub
    return ExtractOutlineResponse(
        units=[
            StudyUnitProposal(title="Introduction & Overview", page_start=1, page_end=10, estimated_minutes=25),
            StudyUnitProposal(title="Core Concepts & Definitions", page_start=11, page_end=25, estimated_minutes=35),
            StudyUnitProposal(title="Application & Exercises", page_start=26, page_end=40, estimated_minutes=30),
        ],
        total_estimated_minutes=90
    )

@app.post("/api/ai/contextual-assist", response_model=ContextualAIResponse)
def contextual_assist(request: ContextualAIRequest):
    # Provisional stub
    return ContextualAIResponse(
        action=request.action,
        result=f"Processed '{request.action}' on selected text: {request.selected_text[:100]}..."
    )
