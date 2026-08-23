from app import create_app
from flask_cors import CORS

app = create_app()

# CORS configuration for Vercel frontend
CORS(
    app,
    resources={
        r"/*": {
            "origins": ["https://grievance-hruf.vercel.app"]
        }
    },
    methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=["Content-Type", "Authorization"],
    supports_credentials=False
)

if __name__ == "__main__":
    app.run(
        host="0.0.0.0",
        port=5000,
        debug=False
    )
