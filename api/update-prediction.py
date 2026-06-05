import os
import json
from datetime import datetime, timezone
from http.server import BaseHTTPRequestHandler

from supabase import create_client
from lib.player_model import predict_next_player_game


class handler(BaseHTTPRequestHandler):
    def do_GET(self):
        try:
            supabase_url = os.environ["SUPABASE_URL"]
            supabase_key = os.environ["SUPABASE_SERVICE_ROLE_KEY"]
            supabase = create_client(supabase_url, supabase_key)

            result = predict_next_player_game(
                player_id=1628983,
                player_name="Shai Gilgeous-Alexander",
                seasons=["2023-24", "2024-25", "2025-26"],
                opponent="LAL",
                home=1,
                rest_days=2
            )

            row = {
                "id": "sga_next_game",
                **result,
                "updated_at": datetime.now(timezone.utc).isoformat()
            }

            supabase.table("player_predictions").upsert(row).execute()

            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self.end_headers()
            self.wfile.write(json.dumps({
                "success": True,
                "prediction": row
            }).encode())

        except Exception as e:
            self.send_response(500)
            self.send_header("Content-Type", "application/json")
            self.end_headers()
            self.wfile.write(json.dumps({
                "success": False,
                "error": str(e)
            }).encode())