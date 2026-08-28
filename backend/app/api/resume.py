from fastapi import APIRouter, HTTPException, status

from app.models.resume import ResumeParseRequest, ResumeParseResult
from app.services.resume_parser import parse_resume_text, validate_resume_result

router = APIRouter(prefix="/api/resume", tags=["Resume Parsing"])


@router.post(
    "/parse",
    response_model=ResumeParseResult,
    status_code=status.HTTP_200_OK,
    summary="Parse Candidate Resume",
)
async def parse_resume(payload: ResumeParseRequest):
    """
    Parse a resume from raw text and return a validated RADIX resume result.
    """
    raw_text = (payload.raw_text or "").strip()
    file_name = (payload.file_name or "").strip()

    if file_name:
        file_extension = file_name.lower()[file_name.lower().rfind(".") :]
        if file_extension and file_extension not in {".pdf", ".doc", ".docx", ".txt"}:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Unsupported resume file type: {file_extension}. Supported types are PDF, DOC, DOCX, and TXT.",
            )

    if not raw_text:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Resume input is empty. Provide raw_text containing the resume content.",
        )

    try:
        parsed = parse_resume_text(raw_text)
        parsed.raw_file_name = file_name or None
        return validate_resume_result(parsed.model_dump())
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(exc),
        ) from exc
    except Exception as exc:  # pragma: no cover - defensive fallback
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Resume parsing failed while processing the extracted resume data.",
        ) from exc
