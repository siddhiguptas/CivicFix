"""
Vercel entry point for Civic Connect API
This file is specifically for Vercel deployment
"""

from app.main import app

# Export the FastAPI app for Vercel
handler = app
