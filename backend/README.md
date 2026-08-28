# RADIX Talent Match Platform — Python FastAPI Backend

This is the shared Python/FastAPI backend foundation for the SVCE Placement Intelligence Hub & RADIX Talent Match Platform.

---

## 1. Prerequisites
- Python >= 3.10
- Node.js >= 18 (for the React frontend)

---

## 2. Setup & Installation

From the `backend/` directory:

```bash
# 1. Create a virtual environment (optional but recommended)
python -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate

# 2. Install dependencies
pip install -r requirements.txt

# 3. Configure environment variables (optional)
cp .env.example .env
```

---

## 3. Running the Backend

Start the development server with auto-reload:

```bash
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

The API will be available at:
- **API Base URL**: `http://127.0.0.1:8000`
- **Interactive OpenAPI Documentation (Swagger UI)**: `http://127.0.0.1:8000/docs`
- **Alternative Documentation (ReDoc)**: `http://127.0.0.1:8000/redoc`
- **Health Check**: `http://127.0.0.1:8000/health`

---

## 4. API Endpoints Foundation

| Method | Endpoint | Description | Status |
|---|---|---|---|
| `GET` | `/health` | Service health status check | Implemented (`{"status": "ok"}`) |
| `POST` | `/api/profile` | Candidate profile structure validation | Implemented (Validation without persistence) |
| `POST` | `/api/jd/analyze` | Job Description skill extraction | Scaffolding (`501 Not Implemented`) |
| `POST` | `/api/resume/parse` | Resume entity & skill extraction | Scaffolding (`501 Not Implemented`) |
| `POST` | `/api/talent-check` | Candidate-vs-Company benchmark gap analysis | Scaffolding (`501 Not Implemented`) |
| `POST` | `/api/skill-match` | Candidate-vs-JD match scoring | Scaffolding (`501 Not Implemented`) |

---

## 5. Running Tests

```bash
pytest
```
