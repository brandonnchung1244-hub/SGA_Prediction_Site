import RefreshButton from "./components/RefreshButton";

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

function parseHomeAway(value: number | string | undefined) {
  if (value === undefined || value === null || value === "") {
    return null;
  }

  const num = Number(value);

  if (Number.isNaN(num)) {
    return null;
  }

  return num === 1 ? "Home" : "Away";
}

export default async function Home() {
  const prediction = await getPrediction();

  if (!prediction) {
    return (
      <main className="min-h-screen bg-neutral-950 text-neutral-100 flex items-center justify-center p-6">
        <section className="w-full max-w-md rounded-3xl bg-neutral-900 border border-neutral-800 p-8 shadow-2xl">
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-red-500" />
            <p className="text-xs font-semibold uppercase tracking-widest text-neutral-500">
              NBA Player Points Model
            </p>
          </div>

          <h1 className="mt-3 text-2xl font-bold text-balance">
            SGA Points Predictor
          </h1>

          <p className="mt-6 text-sm font-medium text-red-400">
            Could not load prediction from Supabase.
          </p>

          <p className="mt-2 text-sm leading-relaxed text-neutral-500">
            The API route works, so check the homepage fetch URL or redeploy
            after updating environment variables.
          </p>

          <div className="mt-6">
            <RefreshButton />
          </div>
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
  const homeAway = parseHomeAway(prediction.home);

  // Compute the marker position of the predicted value within the range bar.
  const lowerNum = Number(prediction.lower_10);
  const upperNum = Number(prediction.upper_90);
  const predNum = Number(prediction.predicted_points);

  let markerPercent: number | null = null;

  if (
    !Number.isNaN(lowerNum) &&
    !Number.isNaN(upperNum) &&
    !Number.isNaN(predNum) &&
    upperNum > lowerNum
  ) {
    const raw = ((predNum - lowerNum) / (upperNum - lowerNum)) * 100;
    markerPercent = Math.min(100, Math.max(0, raw));
  }

  const inputs = [
    { label: "Opponent", value: opponent, hint: "Next matchup" },
    { label: "Rest Days", value: String(restDays), hint: "Days since last game" },
    homeAway
      ? { label: "Venue", value: homeAway, hint: "Home or away" }
      : null,
  ].filter(Boolean) as { label: string; value: string; hint: string }[];

  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-100">
      <div className="mx-auto w-full max-w-3xl px-4 py-8 sm:px-6 sm:py-12">
        {/* Header */}
        <header className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-500/15 text-lg font-black text-orange-400 ring-1 ring-orange-500/25">
              SGA
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-neutral-500">
                NBA Player Points Model
              </p>
              <p className="text-sm font-medium text-neutral-300">
                Points Prediction Dashboard
              </p>
            </div>
          </div>

          <span className="inline-flex items-center gap-2 rounded-full border border-emerald-500/25 bg-emerald-500/10 px-3 py-1.5 text-xs font-semibold text-emerald-400">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
            </span>
            Live Prediction
          </span>
        </header>

        {/* Hero */}
        <section className="mt-6 overflow-hidden rounded-3xl border border-neutral-800 bg-gradient-to-b from-neutral-900 to-neutral-900/40 shadow-2xl">
          <div className="border-b border-neutral-800 px-6 py-5 sm:px-8">
            <p className="text-sm font-medium text-neutral-400">Predicted points for</p>
            <h1 className="mt-1 text-2xl font-bold tracking-tight text-balance sm:text-3xl">
              {playerName}
            </h1>
          </div>

          <div className="px-6 py-8 sm:px-8 sm:py-10">
            <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-neutral-500">
                  Projected Points
                </p>
                <div className="mt-2 flex items-baseline gap-2">
                  <span className="text-7xl font-black leading-none tracking-tighter text-orange-400 sm:text-8xl">
                    {predictedPoints}
                  </span>
                  <span className="text-lg font-semibold text-neutral-500">PTS</span>
                </div>
              </div>

              <div className="rounded-2xl border border-neutral-800 bg-neutral-950/60 px-5 py-4 text-center">
                <p className="text-xs font-semibold uppercase tracking-widest text-neutral-500">
                  vs
                </p>
                <p className="mt-1 text-xl font-bold text-neutral-100">{opponent}</p>
                {homeAway && (
                  <p className="mt-0.5 text-xs font-medium text-neutral-500">
                    {homeAway} game
                  </p>
                )}
              </div>
            </div>

            {/* Confidence range bar */}
            <div className="mt-8">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold uppercase tracking-widest text-neutral-500">
                  Confidence Range
                </p>
                <p className="text-xs font-medium text-neutral-400">
                  80% interval
                </p>
              </div>

              <div className="mt-3">
                <div className="relative h-3 w-full rounded-full bg-neutral-800">
                  <div className="absolute inset-y-0 left-0 right-0 rounded-full bg-gradient-to-r from-orange-500/30 via-orange-500/60 to-orange-500/30" />
                  {markerPercent !== null && (
                    <div
                      className="absolute top-1/2 h-5 w-5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-neutral-950 bg-orange-400 shadow-lg"
                      style={{ left: `${markerPercent}%` }}
                      aria-hidden="true"
                    />
                  )}
                </div>

                <div className="mt-3 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-neutral-500">Floor (P10)</p>
                    <p className="text-lg font-bold text-neutral-200">{lowerRange}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-medium text-neutral-500">Ceiling (P90)</p>
                    <p className="text-lg font-bold text-neutral-200">{upperRange}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Model inputs */}
        <section className="mt-6">
          <h2 className="px-1 text-sm font-semibold uppercase tracking-widest text-neutral-500">
            Model Inputs
          </h2>
          <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
            {inputs.map((item) => (
              <div
                key={item.label}
                className="rounded-2xl border border-neutral-800 bg-neutral-900 p-5 transition hover:border-neutral-700 hover:bg-neutral-900/70"
              >
                <p className="text-xs font-semibold uppercase tracking-widest text-neutral-500">
                  {item.label}
                </p>
                <p className="mt-2 text-2xl font-bold text-neutral-100">
                  {item.value}
                </p>
                <p className="mt-1 text-xs text-neutral-500">{item.hint}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Model details */}
        <section className="mt-6">
          <h2 className="px-1 text-sm font-semibold uppercase tracking-widest text-neutral-500">
            Model Details
          </h2>
          <div className="mt-3 rounded-2xl border border-neutral-800 bg-neutral-900 p-5">
            <dl className="divide-y divide-neutral-800">
              <div className="flex items-center justify-between py-3 first:pt-0">
                <dt className="text-sm font-medium text-neutral-400">Algorithm</dt>
                <dd className="text-sm font-semibold text-neutral-100">{modelName}</dd>
              </div>
              <div className="flex items-center justify-between py-3">
                <dt className="text-sm font-medium text-neutral-400">Prediction</dt>
                <dd className="text-sm font-semibold text-neutral-100">
                  {predictedPoints} PTS
                </dd>
              </div>
              <div className="flex items-center justify-between py-3 last:pb-0">
                <dt className="text-sm font-medium text-neutral-400">
                  Confidence interval
                </dt>
                <dd className="text-sm font-semibold text-neutral-100">
                  {lowerRange} – {upperRange}
                </dd>
              </div>
            </dl>
          </div>
        </section>

        {/* Footer */}
        <footer className="mt-6 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-neutral-800 bg-neutral-900/50 px-5 py-4">
          <p className="text-xs text-neutral-500">
            Last updated{" "}
            <span className="font-medium text-neutral-300">{updatedAt}</span>
          </p>
          <RefreshButton />
        </footer>
      </div>
    </main>
  );
}
