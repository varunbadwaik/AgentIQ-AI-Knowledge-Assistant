"""
Authentication middleware using Supabase API token verification.
Verifies tokens by calling Supabase's auth endpoint directly.
No JWT secret needed — uses the service role key instead.
"""

import os
import json
import urllib.request
from fastapi import HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

security = HTTPBearer()

SUPABASE_URL = os.environ.get("SUPABASE_URL", "")
SUPABASE_SERVICE_KEY = os.environ.get("SUPABASE_SERVICE_KEY", "")


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
) -> str:
    """
    Verify token with Supabase API and return user_id.
    Use as a FastAPI dependency: user_id: str = Depends(get_current_user)
    """
    token = credentials.credentials
    
    # Check for local dev bypass
    if os.environ.get("MOCK_AUTH") == "true":
        return "mock-user-id"

    if not SUPABASE_URL or not SUPABASE_SERVICE_KEY:
        raise HTTPException(
            status_code=500,
            detail="Auth not configured. Set SUPABASE_URL and SUPABASE_SERVICE_KEY."
        )

    try:
        req = urllib.request.Request(
            f"{SUPABASE_URL}/auth/v1/user",
            headers={
                "Authorization": f"Bearer {token}",
                "apikey": SUPABASE_SERVICE_KEY,
            },
        )
        with urllib.request.urlopen(req, timeout=5) as response:
            user_data = json.loads(response.read().decode())
            user_id = user_data.get("id")
            if not user_id:
                raise HTTPException(status_code=401, detail="Invalid user token")
            return user_id
    except urllib.error.HTTPError as e:
        if e.code == 401:
            raise HTTPException(status_code=401, detail="Token expired or invalid. Please sign in again.")
        raise HTTPException(status_code=401, detail=f"Auth verification failed: {e.code}")
    except Exception as e:
        raise HTTPException(status_code=401, detail=f"Auth error: {str(e)}")
