from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import os
from dotenv import load_dotenv
from google import genai
import json
import re
from typing import List, Optional

load_dotenv()

API_KEY = os.getenv("GEMINI_API_KEY")
if not API_KEY:
    raise ValueError("GEMINI_API_KEY not found in environment variables")

client = genai.Client(api_key=API_KEY)

app = FastAPI(title="AI Project Assistant API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class InputText(BaseModel):
    text: str

class Task(BaseModel):
    title: str
    priority: str

class AIResponse(BaseModel):
    tasks: List[Task]
    summary: str
    next_action: str

class ErrorResponse(BaseModel):
    error: str
    details: Optional[str] = None

def clean_json_output(output: str) -> str:
    """Clean and extract JSON from model response (object or array)"""
    # Remove ```json or ``` fences
    output = re.sub(r'```json\s*', '', output)
    output = re.sub(r'```\s*', '', output)
    
    # Match JSON object or array
    json_match = re.search(r'(\{.*\}|\[.*\])', output, re.DOTALL)
    if json_match:
        output = json_match.group()
    
    return output.strip()

@app.get("/")
async def root():
    return {
        "message": "AI Project Assistant API",
        "version": "1.0.0",
        "status": "running"
    }

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

@app.post("/generate")
async def generate_tasks(data: InputText):
    """
    Simple chat-style AI response.
    """
    if not data.text.strip():
        raise HTTPException(status_code=400, detail="Input text cannot be empty")
    
    prompt = f"""
    You are an AI assistant. Respond naturally to the following input:

    Input: {data.text}

    Reply as a normal conversational response. Do NOT return JSON or code, just plain text.
    """
    
    try:
        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=prompt
        )
        
        if not response or not response.text:
            raise HTTPException(status_code=500, detail="Empty response from AI model")
        
        answer = response.text.strip()
        
        return {"reply": answer}
    
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error in chat_response: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Error generating chat response: {str(e)}"
        )
    
@app.post("/generate-todo")
async def generate_todo_only(data: InputText):
    """Generate only tasks/todo items"""
    prompt = f"""
    Generate 3-5 tasks from this input: {data.text}
    
    Return ONLY JSON array:
    [
      {{"title": "Task 1", "priority": "High"}},
      {{"title": "Task 2", "priority": "Medium"}}
    ]
    """
    
    try:
        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=prompt
        )
        
        if not response or not response.text:
            raise HTTPException(status_code=500, detail="Empty response from AI model")
        
        output = clean_json_output(response.text)
        tasks = json.loads(output)
        
        if not isinstance(tasks, list):
            raise HTTPException(
                status_code=500,
                detail="AI response was not a valid tasks array"
            )
        
        # Validate each task
        valid_tasks = []
        for task in tasks:
            if isinstance(task, dict) and "title" in task and "priority" in task:
                if task["priority"] not in ["High", "Medium", "Low"]:
                    task["priority"] = "Medium"
                valid_tasks.append(task)
        
        if not valid_tasks:
            raise HTTPException(
                status_code=500,
                detail="No valid tasks generated from AI response"
            )
        
        return {"tasks": valid_tasks}
    
    except json.JSONDecodeError as e:
        print(f"JSON parse error in generate-todo: {e}")
        raise HTTPException(
            status_code=500,
            detail="Failed to parse AI response as JSON"
        )
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error in generate-todo: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Error generating tasks: {str(e)}"
        )

@app.post("/generate-summary")
async def generate_summary_only(data: InputText):
    """Generate only summary"""
    prompt = f"Generate a brief 1-2 sentence project summary for: {data.text}"
    
    try:
        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=prompt
        )
        
        if not response or not response.text:
            raise HTTPException(status_code=500, detail="Empty response from AI model")
        
        summary = response.text.strip()
        
        if not summary:
            raise HTTPException(
                status_code=500,
                detail="Generated summary was empty"
            )
        
        return {"summary": summary}
    
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error in generate-summary: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Error generating summary: {str(e)}"
        )

@app.post("/generate-action")
async def generate_action_only(data: InputText):
    """Generate only next action"""
    prompt = f"Suggest the single most important next action for: {data.text}"
    
    try:
        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=prompt
        )
        
        if not response or not response.text:
            raise HTTPException(status_code=500, detail="Empty response from AI model")
        
        action = response.text.strip()
        
        if not action:
            raise HTTPException(
                status_code=500,
                detail="Generated action was empty"
            )
        
        return {"next_action": action}
    
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error in generate-action: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Error generating action: {str(e)}"
        )