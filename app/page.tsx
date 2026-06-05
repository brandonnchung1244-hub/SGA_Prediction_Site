async function getPrediction() {
  const res = await fetch(`${process.env.VERCEL_URL ? "https://" + process.env.VERCEL_URL : "http://localhost:3000"}/api/get-prediction`, {
    cache: "no-store",
  });

  return res.json();
}

export default async function Home() {
  const prediction = await getPrediction();

  return (
    <main className="min-h-screen bg-neutral-950 text-white flex items-center justify-center p-6">
      <section className="w-full max-w-xl rounded-2xl bg-neutral-900 border border-neutral-800 p-6 shadow-xl">
        <p className="text-sm text-neutral-400">NBA Player Points Model</p>

        <h1 className="text-3xl font-bold mt-2">
          {prediction.player_name} Points Predictor
        </h1>

        <div className="mt-8">
          <p className="text-neutral-400">Predicted Points</p>
          <p className="text-6xl font-bold">
            {prediction.predicted_points?.toFixed(1)}
          </p>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-4">
          <div className="rounded-xl bg-neutral-800 p-4">
            <p className="text-neutral-400 text-sm">Range</p>
            <p className="text-xl font-semibold">
              {prediction.lower_10?.toFixed(1)}–{prediction.upper_90?.toFixed(1)}
            </p>
          </div>

          <div className="rounded-xl bg-neutral-800 p-4">
            <p className="text-neutral-400 text-sm">Opponent</p>
            <p className="text-xl font-semibold">{prediction.opponent}</p>
          </div>

          <div className="rounded-xl bg-neutral-800 p-4">
            <p className="text-neutral-400 text-sm">Rest Days</p>
            <p className="text-xl font-semibold">{prediction.rest_days}</p>
          </div>

          <div className="rounded-xl bg-neutral-800 p-4">
            <p className="text-neutral-400 text-sm">Model</p>
            <p className="text-xl font-semibold">{prediction.model_name}</p>
          </div>
        </div>

        <p className="mt-6 text-sm text-neutral-500">
          Last updated: {prediction.updated_at}
        </p>
      </section>
    </main>
  );
}