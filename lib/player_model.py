import time
import numpy as np
import pandas as pd

from nba_api.stats.endpoints import playergamelog
from sklearn.ensemble import RandomForestRegressor


FEATURE_COLS = [
    "HOME", "Rest Days", "B2B Days",
    "avg_3_pts", "avg_5_pts", "avg_10_pts",
    "avg_3_mins", "avg_5_mins", "avg_10_mins",
    "avg_5_fga", "avg_5_fta", "avg_5_fg3a",
    "avg_5_ast", "avg_5_tov",
    "season_avg_points", "season_avg_minutes"
]

sga_player_id = 1628983

def get_updated_player_games(player_id, seasons):
    all_games = []

    for season in seasons:
        log = playergamelog.PlayerGameLog(
            player_id=player_id,
            season=season,
            season_type_all_star="Regular Season"
        )

        season_df = log.get_data_frames()[0]
        season_df["SEASON"] = season
        all_games.append(season_df)

        time.sleep(1)

    df = pd.concat(all_games, ignore_index=True)

    df["GAME_DATE"] = pd.to_datetime(df["GAME_DATE"])
    df = df.sort_values("GAME_DATE").reset_index(drop=True)

    df["HOME"] = df["MATCHUP"].str.contains(" vs.").astype(int)

    df["OPPONENT"] = (
        df["MATCHUP"]
        .str.replace("@", "vs.", regex=False)
        .str.split("vs.")
        .str[-1]
        .str.strip()
    )

    return df


def build_player_model_df(raw_df):
    df = raw_df[["GAME_DATE", "MATCHUP", "OPPONENT", "HOME", "MIN", "PTS", "FGA", "FTA", "FG3A", "AST", "TOV"]].copy()

    for window in [3, 5, 10]:
        df[f"avg_{window}_pts"] = (
            df["PTS"].shift(1).rolling(window, min_periods=1).mean()
        )

        df[f"avg_{window}_mins"] = (
            df["MIN"].shift(1).rolling(window, min_periods=1).mean()
        )

    for col in ["FGA", "FTA", "FG3A", "AST", "TOV"]:
        df[f"avg_5_{col.lower()}"] = (
            df[col].shift(1).rolling(5, min_periods=1).mean()
        )

    df["season_avg_points"] = df["PTS"].shift(1).expanding().mean()
    df["season_avg_minutes"] = df["MIN"].shift(1).expanding().mean()

    df = df.iloc[1:].reset_index(drop=True)

    df["Rest Days"] = df["GAME_DATE"].diff().dt.days - 1
    df["Rest Days"] = df["Rest Days"].fillna(3).clip(lower=0)
    df["B2B Days"] = (df["Rest Days"] == 0).astype(int)

    return df


def train_model(model_df):
    opponent_dummies = pd.get_dummies(model_df["OPPONENT"], prefix="OPP").astype(int)

    X_base = model_df[FEATURE_COLS]
    X = pd.concat([opponent_dummies, X_base], axis=1)
    Y = model_df["PTS"]

    model = RandomForestRegressor(
        n_estimators=500,
        max_depth=5,
        min_samples_leaf=5,
        max_features=0.7,
        random_state=42
    )

    model.fit(X, Y)

    return model, X.columns


def create_future_game_row(model_df, training_columns, opponent, home, rest_days):
    latest_games = model_df.sort_values("GAME_DATE").copy()

    future_game = pd.DataFrame([{
        "HOME": home,
        "Rest Days": rest_days,
        "B2B Days": int(rest_days == 0),

        "avg_3_pts": latest_games["PTS"].tail(3).mean(),
        "avg_5_pts": latest_games["PTS"].tail(5).mean(),
        "avg_10_pts": latest_games["PTS"].tail(10).mean(),

        "avg_3_mins": latest_games["MIN"].tail(3).mean(),
        "avg_5_mins": latest_games["MIN"].tail(5).mean(),
        "avg_10_mins": latest_games["MIN"].tail(10).mean(),

        "avg_5_fga": latest_games["FGA"].tail(5).mean(),
        "avg_5_fta": latest_games["FTA"].tail(5).mean(),
        "avg_5_fg3a": latest_games["FG3A"].tail(5).mean(),
        "avg_5_ast": latest_games["AST"].tail(5).mean(),
        "avg_5_tov": latest_games["TOV"].tail(5).mean(),

        "season_avg_points": latest_games["PTS"].mean(),
        "season_avg_minutes": latest_games["MIN"].mean()
    }])

    future_game[f"OPP_{opponent}"] = 1

    future_game = future_game.reindex(columns=training_columns, fill_value=0)

    return future_game


def predict_next_player_game(player_id, player_name, seasons, opponent, home, rest_days):
    raw_df = get_updated_player_games(player_id, seasons)
    model_df = build_player_model_df(raw_df)

    model, training_columns = train_model(model_df)

    future_game = create_future_game_row(
        model_df=model_df,
        training_columns=training_columns,
        opponent=opponent,
        home=home,
        rest_days=rest_days
    )

    predicted_points = float(model.predict(future_game)[0])

    tree_predictions = np.array([tree.predict(future_game.to_numpy())[0] for tree in model.estimators_])

    return {
        "player_id": str(player_id),
        "player_name": player_name,
        "opponent": opponent,
        "home": int(home),
        "rest_days": int(rest_days),
        "predicted_points": predicted_points,
        "lower_10": float(np.percentile(tree_predictions, 10)),
        "upper_90": float(np.percentile(tree_predictions, 90)),
        "last_game_date_used": str(model_df["GAME_DATE"].max().date()),
        "model_name": "RandomForestRegressor"
    }

result = predict_next_player_game(
    player_id=sga_player_id,
    player_name="Shai Gilgeous-Alexander",
    seasons=["2023-24", "2024-25", "2025-26"],
    opponent="LAL",
    home=1,
    rest_days=2
)

result