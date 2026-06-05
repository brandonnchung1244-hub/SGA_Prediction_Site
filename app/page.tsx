export default function Home() {
  return (
    <main className="min-h-screen bg-neutral-950 text-white flex items-center justify-center p-6">
      <section className="w-full max-w-xl rounded-2xl bg-neutral-900 border border-neutral-800 p-6 shadow-xl">
        <p className="text-sm text-neutral-400">NBA Player Points Model</p>

        <h1 className="text-3xl font-bold mt-2">
          SGA Points Predictor
        </h1>

        <div className="mt-8">
          <p className="text-neutral-400">Predicted Points</p>
          <p className="text-6xl font-bold">31.8</p>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-4">
          <div className="rounded-xl bg-neutral-800 p-4">
            <p className="text-neutral-400 text-sm">Range</p>
            <p className="text-xl font-semibold">25.4–38.6</p>
          </div>

          <div className="rounded-xl bg-neutral-800 p-4">
            <p className="text-neutral-400 text-sm">Opponent</p>
            <p className="text-xl font-semibold">LAL</p>
          </div>

          <div className="rounded-xl bg-neutral-800 p-4">
            <p className="text-neutral-400 text-sm">Rest Days</p>
            <p className="text-xl font-semibold">2</p>
          </div>

          <div className="rounded-xl bg-neutral-800 p-4">
            <p className="text-neutral-400 text-sm">Model</p>
            <p className="text-xl font-semibold">Random Forest</p>
          </div>
        </div>
      </section>
    </main>
  );
}