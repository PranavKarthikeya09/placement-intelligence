import logging
from typing import Optional
from supabase import create_client, Client
from app.core.config import settings

logger = logging.getLogger("radix.supabase")

_supabase_client: Optional[Client] = None


def get_supabase_client() -> Optional[Client]:
    """
    Returns an initialized Supabase Client if configured, or None if credentials are missing.
    """
    global _supabase_client
    if _supabase_client is not None:
        return _supabase_client

    url = settings.get_supabase_url()
    key = settings.get_supabase_key()

    if not url or not key or "placeholder" in url:
        logger.debug("Supabase credentials not configured or placeholder. Using fallback storage.")
        return None

    try:
        _supabase_client = create_client(url, key)
        logger.info("Supabase client initialized successfully at %s", url)
        return _supabase_client
    except Exception as e:
        logger.warning("Failed to initialize Supabase client: %s. Using fallback storage.", e)
        return None

