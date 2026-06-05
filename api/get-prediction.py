import os
import json
from http.server import BaseHTTPRequestHandler

from supabase import create_client


class handler(BaseHTTPRequestHandler):
    def do_GET(self):
        try:
            supabase_url = os.environ["SUPABASE_URL"]
            supabase_key = os.environ["SUPABASE_SERVICE_ROLE_KEY"]
            supabase = create_client(supabase_url, supabase_key)

            response = (
                supabase
                .table("player_predictions")
                .select("*")
                .eq("id", "sga_next_game")
                .single()
                .execute()
            )

            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self.end_headers()
            self.wfile.write(json.dumps(response.data).encode())

        except Exception as e:
            self.send_response(500)
            self.send_header("Content-Type", "application/json")
            self.end_headers()
            self.wfile.write(json.dumps({
                "success": False,
                "error": str(e)
            }).encode())