type Prediction = {
  id: string;
  player_id: string;
  player_name: string;
  opponent: string;
  home: number;
  rest_days: number;
  predicted_points: number;
  lower_10: number;
  upper_90: number;
  last_game_date_used: string;
  model_name: string;
  updated_at: string;
};

async function getPrediction(): Promise<Prediction | null> {
  const baseUrl =
    process.env.NEXT_PUBLIC_SITE_URL ||
    "https://sga-prediction-site.vercel.app";

  const res = await fetch(`${baseUrl}/api/get-prediction`, {
    cache: "no-store",
  });

  if (!res.ok) {
    return null;
  }

  return res.json();
}

export default async function Home() {
  const prediction = await getPrediction();

  if (!prediction) {
    return (
      <main className="min-h-screen bg-neutral-950 text-white flex items-center justify-center p-6">
        <section className="w-full max-w-xl rounded-2xl bg-neutral-900 border border-neutral-800 p-6 shadow-xl">
          <h1 className="text-3xl font-bold">SGA Points Predictor</h1>
          <p className="mt-4 text-red-400">Could not load prediction.</p>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-neutral-950 text-white flex items-center justify-center p-6">
      <section className="w-full max-w-xl rounded-2xl bg-neutral-900 border border-neutral-800 p-6 shadow-xl">
        <p className="text-sm text-neutral-400">NBA Player Points Model</p>

        <h1 className="text-3xl font-bold mt-2">SGA Points Predictor</h1>

        <div className="mt-8">
          <p className="text-neutral-400">Predicted Points</p>
          <p className="text-6xl font-bold">
            {prediction.predicted_points}
          </p>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-4">
          <div className="rounded-xl bg-neutral-800 p-4">
            <p className="text-neutral-400 text-sm">Range</p>
            <p className="text-xl font-semibold">
              {prediction.lower_10}–{prediction.upper_90}
            </p>
          </div>

          <div className="rounded-xl bg-neutral-800 p-4">
            <p className="text-neutral-400 text-sm">Opponent</p>
            <p className="text-xl font-semibold">
              {prediction.opponent}
            </p>
          </div>

          <div className="rounded-xl bg-neutral-800 p-4">
            <p className="text-neutral-400 text-sm">Rest Days</p>
            <p className="text-xl font-semibold">
              {prediction.rest_days}
            </p>
          </div>

          <div className="rounded-xl bg-neutral-800 p-4">
            <p className="text-neutral-400 text-sm">Model</p>
            <p className="text-xl font-semibold">
              {prediction.model_name}
            </p>
          </div>
        </div>

        <p className="mt-6 text-xs text-neutral-500">
          Last updated: {new Date(prediction.updated_at).toLocaleString()}
        </p>
      </section>
    </main>
  );
}