type Prediction = {
  id: string;
  player_id?: string;
  player_name?: string;
  opponent?: string;
  home?: number | string;
  rest_days?: number | string;
  predicted_points?: number | string;
  lower_10?: number | string;
  upper_90?: number | string;
  last_game_date_used?: string;
  model_name?: string;
  updated_at?: string;
};

async function getPrediction(): Promise<Prediction | null> {
  const baseUrl =
    process.env.NEXT_PUBLIC_SITE_URL ||
    (process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : "http://localhost:3000");

  try {
    const res = await fetch(`${baseUrl}/api/get-prediction`, {
      cache: "no-store",
    });

    if (!res.ok) {
      console.error("Failed to fetch prediction:", res.status);
      return null;
    }

    const data = await res.json();

    if (data?.error) {
      console.error("Prediction API returned error:", data.error);
      return null;
    }

    return data;
  } catch (error) {
    console.error("Prediction fetch error:", error);
    return null;
  }
}

function formatNumber(value: number | string | undefined, decimals = 1) {
  const num = Number(value);

  if (Number.isNaN(num)) {
    return "N/A";
  }

  return num.toFixed(decimals);
}

function formatModelName(modelName: string | undefined) {
  if (!modelName) {
    return "N/A";
  }

  if (modelName === "RandomForestRegressor") {
    return "Random Forest";
  }

  return modelName;
}

function formatDate(value: string | undefined) {
  if (!value) {
    return "N/A";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString();
}

export default async function Home() {
  const prediction = await getPrediction();

  if (!prediction) {
    return (
      <main className="min-h-screen bg-neutral-950 text-white flex items-center justify-center p-6">
        <section className="w-full max-w-xl rounded-2xl bg-neutral-900 border border-neutral-800 p-6 shadow-xl">
          <p className="text-sm text-neutral-400">NBA Player Points Model</p>

          <h1 className="text-3xl font-bold mt-2">SGA Points Predictor</h1>

          <p className="mt-6 text-red-400">
            Could not load prediction from Supabase.
          </p>

          <p className="mt-2 text-sm text-neutral-500">
            The API route works, so check the homepage fetch URL or redeploy
            after updating environment variables.
          </p>
        </section>
      </main>
    );
  }

  const playerName = prediction.player_name || "Shai Gilgeous-Alexander";
  const predictedPoints = formatNumber(prediction.predicted_points);
  const lowerRange = formatNumber(prediction.lower_10);
  const upperRange = formatNumber(prediction.upper_90);
  const opponent = prediction.opponent || "N/A";
  const restDays = prediction.rest_days ?? "N/A";
  const modelName = formatModelName(prediction.model_name);
  const updatedAt = formatDate(prediction.updated_at);

  return (
    <main className="min-h-screen bg-neutral-950 text-white flex items-center justify-center p-6">
      <section className="w-full max-w-xl rounded-2xl bg-neutral-900 border border-neutral-800 p-6 shadow-xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm text-neutral-400">NBA Player Points Model</p>

            <h1 className="text-3xl font-bold mt-2">
              {playerName} Points Predictor
            </h1>
          </div>

          <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-400 border border-emerald-500/20">
            Live
          </span>
        </div>

        <div className="mt-8">
          <p className="text-neutral-400">Predicted Points</p>
          <p className="text-6xl font-bold tracking-tight">
            {predictedPoints}
          </p>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-4">
          <div className="rounded-xl bg-neutral-800 p-4">
            <p className="text-neutral-400 text-sm">Range</p>
            <p className="text-xl font-semibold">
              {lowerRange}–{upperRange}
            </p>
          </div>

          <div className="rounded-xl bg-neutral-800 p-4">
            <p className="text-neutral-400 text-sm">Opponent</p>
            <p className="text-xl font-semibold">{opponent}</p>
          </div>

          <div className="rounded-xl bg-neutral-800 p-4">
            <p className="text-neutral-400 text-sm">Rest Days</p>
            <p className="text-xl font-semibold">{restDays}</p>
          </div>

          <div className="rounded-xl bg-neutral-800 p-4">
            <p className="text-neutral-400 text-sm">Model</p>
            <p className="text-xl font-semibold">{modelName}</p>
          </div>
        </div>

        <p className="mt-6 text-sm text-neutral-500">
          Last updated: {updatedAt}
        </p>
      </section>
    </main>
  );
}