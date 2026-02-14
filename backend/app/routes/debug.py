from fastapi import APIRouter
import os
import sys

router = APIRouter()

@router.get("/debug")
async def debug_system():
    """Run system diagnostics to find the cause of 500 errors"""
    report = {
        "python_version": sys.version,
        "platform": sys.platform,
        "env_vars": {
            "VERCEL": os.environ.get("VERCEL"),
            "DATABASE_URL_SET": bool(os.environ.get("DATABASE_URL")),
            "COHERE_API_KEY_SET": bool(os.environ.get("COHERE_API_KEY")),
            "SUPABASE_URL_SET": bool(os.environ.get("SUPABASE_URL")),
        },
        "imports": {},
        "filesystem": {},
        "database": "Not Checked"
    }

    # 1. Check Imports
    for lib in ["numpy", "pypdf", "docx", "asyncpg", "sqlalchemy", "cohere", "jwt", "cryptography"]:
        try:
            __import__(lib)
            report["imports"][lib] = "OK"
        except ImportError as e:
            report["imports"][lib] = f"FAILED: {str(e)}"
        except Exception as e:
            report["imports"][lib] = f"ERROR: {str(e)}"

    # 2. Check Filesystem (Write to /tmp)
    try:
        test_file = "/tmp/test_write.txt"
        with open(test_file, "w") as f:
            f.write("test")
        os.remove(test_file)
        report["filesystem"]["write_tmp"] = "OK"
    except Exception as e:
        report["filesystem"]["write_tmp"] = f"FAILED: {str(e)}"

    # 3. Check Database Connection
    try:
        from app.database.db import get_db
        from sqlalchemy import text
        async for session in get_db():
            await session.execute(text("SELECT 1"))
            report["database"] = "OK"
            break
    except Exception as e:
        report["database"] = f"FAILED: {str(e)}"

    return report
