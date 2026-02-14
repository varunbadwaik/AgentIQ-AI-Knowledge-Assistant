import sys
import os
import json
import traceback

# Add backend directory to path so 'app' module can be found
sys.path.append(os.path.join(os.path.dirname(__file__), "..", "backend"))

_import_error = None

try:
    from app.main import app
except Exception as e:
    _import_error = {
        "error": "App failed to start",
        "detail": str(e),
        "traceback": traceback.format_exc(),
        "python_version": sys.version,
        "env_check": {
            "COHERE_API_KEY_SET": bool(os.environ.get("COHERE_API_KEY")),
            "DATABASE_URL_SET": bool(os.environ.get("DATABASE_URL")),
            "SUPABASE_URL_SET": bool(os.environ.get("SUPABASE_URL")),
            "SUPABASE_SERVICE_KEY_SET": bool(os.environ.get("SUPABASE_SERVICE_KEY")),
            "VERCEL": os.environ.get("VERCEL"),
        }
    }
    print(f"FATAL IMPORT ERROR:\n{_import_error['traceback']}")

    # Raw ASGI fallback — zero dependencies, always works
    async def app(scope, receive, send):
        if scope["type"] == "http":
            body = json.dumps(_import_error, indent=2).encode("utf-8")
            await send({
                "type": "http.response.start",
                "status": 200,
                "headers": [
                    [b"content-type", b"application/json"],
                    [b"content-length", str(len(body)).encode()],
                ],
            })
            await send({
                "type": "http.response.body",
                "body": body,
            })
