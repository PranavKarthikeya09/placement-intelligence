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
| `POST` | `/api/resume/parse` | Structured resume entity & skill extraction from raw text | Implemented (deterministic parsing and Pydantic validation) |
| `POST` | `/api/talent-check` | Candidate-vs-Company benchmark gap analysis | Scaffolding (`501 Not Implemented`) |
| `POST` | `/api/skill-match` | Candidate-vs-JD match scoring | Scaffolding (`501 Not Implemented`) |

---

## 5. Running Tests

```bash
pytest
```

## 6. Resume Parsing

`POST /api/resume/parse` accepts JSON with a required non-empty `raw_text` value and an optional `file_name` value:

```json
{
	"file_name": "resume.txt",
	"raw_text": "Aarav Sharma\nEmail: aarav@example.com\nSkills\nPython, SQL"
}
```

The response follows the shared `ResumeParseResult` contract. It includes validated candidate identity, education, experience, projects, certifications, and skills with normalized names, evidence, confidence, and one of the canonical RADIX category codes. Document upload extraction is not enabled; PDF/DOC/DOCX file names are accepted only as metadata when extracted text is supplied in `raw_text`.
