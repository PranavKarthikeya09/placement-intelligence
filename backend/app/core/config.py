from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """
    Application Settings loaded from environment variables.
    """
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )

    BACKEND_HOST: str = "127.0.0.1"
    BACKEND_PORT: int = 8000
    FRONTEND_URL: str = "http://localhost:5173"

    # Supabase Configuration
    SUPABASE_URL: str = ""
    SUPABASE_KEY: str = ""
    SUPABASE_SERVICE_ROLE_KEY: str = ""
    SUPABASE_ANON_KEY: str = ""
    VITE_SUPABASE_URL: str = ""
    VITE_SUPABASE_PUBLISHABLE_KEY: str = ""
    VITE_SUPABASE_ANON_KEY: str = ""

    def get_supabase_url(self) -> str:
        url = self.SUPABASE_URL or self.VITE_SUPABASE_URL or ""
        # Strip trailing /rest/v1 or trailing slash if present
        return url.rstrip("/").removesuffix("/rest/v1").rstrip("/")

    def get_supabase_key(self) -> str:
        return (
            self.SUPABASE_SERVICE_ROLE_KEY
            or self.SUPABASE_KEY
            or self.SUPABASE_ANON_KEY
            or self.VITE_SUPABASE_PUBLISHABLE_KEY
            or self.VITE_SUPABASE_ANON_KEY
            or ""
        )


settings = Settings()
