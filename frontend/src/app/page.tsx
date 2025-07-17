export default function Home() {
  return (
    <main className="flex flex-col items-center justify-center min-h-screen p-8 bg-mamagaadi-blue text-mamagaadi-white">
      <h1 className="text-5xl font-extrabold mb-4 drop-shadow-lg">Mamagadhi</h1>
      <p className="text-lg text-mamagaadi-white/90 max-w-xl text-center mb-8">
        Welcome to Mamagadhi - Your trusted community ride pooling platform. Share rides, save money, and help the environment by reducing traffic and emissions. Join a growing community of commuters making smarter, greener travel choices every day.
      </p>
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-4xl mb-10">
        <div className="bg-white/10 rounded-xl p-6 flex flex-col items-center shadow-lg">
          <span className="text-3xl mb-2">🚗</span>
          <h2 className="text-xl font-bold mb-1">Easy Ride Pooling</h2>
          <p className="text-center text-mamagaadi-white/80">Find or offer rides with just a few clicks. Flexible options for daily commutes or one-time trips.</p>
        </div>
        <div className="bg-white/10 rounded-xl p-6 flex flex-col items-center shadow-lg">
          <span className="text-3xl mb-2">💸</span>
          <h2 className="text-xl font-bold mb-1">Save Money</h2>
          <p className="text-center text-mamagaadi-white/80">Split travel costs with fellow riders. Affordable, transparent, and cashless payments.</p>
        </div>
        <div className="bg-white/10 rounded-xl p-6 flex flex-col items-center shadow-lg">
          <span className="text-3xl mb-2">🌱</span>
          <h2 className="text-xl font-bold mb-1">Eco-Friendly</h2>
          <p className="text-center text-mamagaadi-white/80">Reduce your carbon footprint and help decongest city roads by sharing rides.</p>
        </div>
      </section>
      <a href="#" className="mt-4 px-8 py-3 rounded-full bg-white text-mamagaadi-blue font-bold text-lg shadow-md hover:bg-mamagaadi-white/90 transition">Get Started</a>
    </main>
  );
}
