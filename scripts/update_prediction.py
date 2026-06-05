import os
from datetime import datetime, timezone
from supabase import create_client

def main():
    print("Starting Supabase test...")

    supabase_url = os.environ["SUPABASE_URL"]
    supabase_key = os.environ["SUPABASE_SERVICE_ROLE_KEY"]

    supabase = create_client(supabase_url, supabase_key)

    row = {
        "id": "sga_next_game",
        "player_id": "1628983",
        "player_name": "Shai Gilgeous-Alexander",
        "opponent": "LAL",
        "home": 1,
        "rest_days": 2,
        "predicted_points": 31.8,
        "lower_10": 25.4,
        "upper_90": 38.6,
        "last_game_date_used": "2026-01-01",
        "model_name": "Test Row",
        "updated_at": datetime.now(timezone.utc).isoformat()
    }

    response = supabase.table("player_predictions").upsert(row).execute()

    print("Supabase response:")
    print(response)
    print("Done.")

if __name__ == "__main__":
    main()