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

function formatHomeAway(home: number | string | undefined) {
  if (home === undefined || home === null || home === "") {
    return null;
  }

  const num = Number(home);

  if (Number.isNaN(num)) {
    return String(home);
  }

  return num === 1 ? "Home" : "Away";
}

function getInitials(name: string) {
  return name
    .split(" ")
    .map((part) => part.charAt(0))
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export default async function Home() {
  const prediction = await getPrediction();

  if (!prediction) {
    return (
      <main className="min-h-screen bg-neutral-950 text-neutral-100 flex items-center justify-center p-6">
        <section className="w-full max-w-md rounded-2xl bg-neutral-900 border border-neutral-800 p-8 shadow-2xl">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-red-500" />
            <p className="text-xs font-semibold uppercase tracking-widest text-neutral-500">
              NBA Player Points Model
            </p>
          </div>

          <h1 className="mt-3 text-2xl font-bold tracking-tight text-balance">
            SGA Points Predictor
          </h1>

          <div className="mt-6 rounded-xl border border-red-500/20 bg-red-500/5 p-4">
            <p className="text-sm font-medium text-red-400">
              Could not load prediction from Supabase.
            </p>
            <p className="mt-2 text-sm leading-relaxed text-neutral-500">
              The API route works, so check the homepage fetch URL or redeploy
              after updating environment variables.
            </p>
          </div>

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
  const homeAway = formatHomeAway(prediction.home);

  // Compute the predicted point's position within the confidence range for the bar marker.
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
    markerPercent = Math.min(
      100,
      Math.max(0, ((predNum - lowerNum) / (upperNum - lowerNum)) * 100)
    );
  }

  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-100 px-4 py-10 sm:px-6 sm:py-16">
      <div className="mx-auto w-full max-w-3xl">
        {/* Header */}
        <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-amber-400/20 bg-amber-400/10 text-lg font-bold text-amber-400">
              {getInitials(playerName)}
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-neutral-500">
                NBA Player Points Model
              </p>
              <h1 className="mt-1 text-2xl font-bold tracking-tight text-balance sm:text-3xl">
                {playerName}
              </h1>
            </div>
          </div>

          <span className="inline-flex w-fit items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1.5 text-xs font-semibold text-emerald-400">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
            </span>
            Live Prediction
          </span>
        </header>

        {/* Hero: predicted points */}
        <section className="mt-8 overflow-hidden rounded-3xl border border-neutral-800 bg-gradient-to-b from-neutral-900 to-neutral-900/40 shadow-2xl">
          <div className="flex flex-col items-center gap-6 p-8 sm:flex-row sm:items-end sm:justify-between sm:p-10">
            <div className="text-center sm:text-left">
              <p className="text-sm font-medium text-neutral-400">
                Predicted Points
              </p>
              <p className="mt-2 text-7xl font-bold leading-none tracking-tighter text-white sm:text-8xl">
                {predictedPoints}
              </p>
              <p className="mt-3 text-sm text-neutral-500">
                {opponent !== "N/A" ? (
                  <>
                    vs{" "}
                    <span className="font-semibold text-neutral-300">
                      {opponent}
                    </span>
                    {homeAway ? ` · ${homeAway}` : ""}
                  </>
                ) : (
                  "Next matchup"
                )}
              </p>
            </div>

            {/* Confidence range visual */}
            <div className="w-full max-w-xs">
              <div className="mb-2 flex items-center justify-between text-xs font-medium text-neutral-500">
                <span>P10</span>
                <span className="uppercase tracking-widest">
                  Confidence Range
                </span>
                <span>P90</span>
              </div>

              <div className="relative h-3 w-full rounded-full bg-neutral-800">
                <div className="absolute inset-y-0 left-0 right-0 rounded-full bg-gradient-to-r from-amber-500/30 via-amber-400/50 to-amber-500/30" />
                {markerPercent !== null && (
                  <div
                    className="absolute top-1/2 h-5 w-5 -translate-x-1/2 -translate-y-1/2 rounded-full border-4 border-neutral-950 bg-amber-400 shadow-lg"
                    style={{ left: `${markerPercent}%` }}
                    aria-hidden="true"
                  />
                )}
              </div>

              <div className="mt-2 flex items-center justify-between text-sm font-semibold text-neutral-200">
                <span>{lowerRange}</span>
                <span>{upperRange}</span>
              </div>
            </div>
          </div>
        </section>

        {/* Model inputs */}
        <section className="mt-8">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-neutral-500">
            Model Inputs
          </h2>
          <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
            <StatCard label="Opponent" value={opponent} />
            <StatCard label="Rest Days" value={String(restDays)} />
            <StatCard label="Location" value={homeAway ?? "N/A"} />
          </div>
        </section>

        {/* Model details */}
        <section className="mt-8">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-neutral-500">
            Model Details
          </h2>
          <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
            <StatCard label="Model" value={modelName} />
            <StatCard label="Lower Range (P10)" value={lowerRange} />
            <StatCard label="Upper Range (P90)" value={upperRange} />
          </div>
        </section>

        {/* Footer */}
        <footer className="mt-8 flex flex-col items-start justify-between gap-4 border-t border-neutral-800 pt-6 sm:flex-row sm:items-center">
          <p className="text-sm text-neutral-500">
            Last updated:{" "}
            <span className="font-medium text-neutral-300">{updatedAt}</span>
          </p>

          <RefreshButton />
        </footer>
      </div>
    </main>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="group rounded-2xl border border-neutral-800 bg-neutral-900 p-4 transition-colors hover:border-neutral-700 hover:bg-neutral-800/60">
      <p className="text-xs font-medium uppercase tracking-wide text-neutral-500">
        {label}
      </p>
      <p className="mt-1.5 text-lg font-semibold text-neutral-100">{value}</p>
    </div>
  );
}
