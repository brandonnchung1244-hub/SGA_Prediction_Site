import os
import sys
from datetime import datetime, timezone

from supabase import create_client

# Lets this script import from the project root /lib folder
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from lib.player_model import predict_next_player_game


def main():
    print("Starting real model update...")

    supabase_url = os.environ["SUPABASE_URL"]
    supabase_key = os.environ["SUPABASE_SERVICE_ROLE_KEY"]

    supabase = create_client(supabase_url, supabase_key)

    print("Running SGA prediction model...")

    result = predict_next_player_game(
        player_id=1628983,
        player_name="Shai Gilgeous-Alexander",
        seasons=["2023-24", "2024-25", "2025-26"],
        opponent="LAL",
        home=1,
        rest_days=2
    )

    print("Model completed.")

    row = {
        "id": "sga_next_game",
        **result,
        "updated_at": datetime.now(timezone.utc).isoformat()
    }

    response = supabase.table("player_predictions").upsert(row).execute()

    print("Supabase upsert response:")
    print(response)

    print("Updated prediction:")
    print(row)


if __name__ == "__main__":
    main()