import Link from 'next/link';
import Image from 'next/image';

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-8">
      <main className="flex flex-col items-center text-center max-w-4xl">
        <h1 className="text-5xl md:text-7xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600 mb-6">
          Adaptive Learning System
        </h1>
        <p className="text-xl md:text-2xl text-gray-300 mb-12 max-w-2xl">
          Master any subject with our AI-powered personalized learning platform that adapts to your pace and style.
        </p>

        <div className="flex gap-6 flex-wrap justify-center">
          <Link
            href="/login"
            className="px-8 py-3 bg-purple-600 hover:bg-purple-700 rounded-full font-bold text-lg transition shadow-lg hover:shadow-purple-500/20"
          >
            Get Started
          </Link>
          <Link
            href="/dashboard"
            className="px-8 py-3 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-full font-bold text-lg transition"
          >
            Dashboard
          </Link>
        </div>

        <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8 w-full">
          <div className="p-6 bg-gray-800/50 rounded-xl border border-gray-700">
            <div className="text-4xl mb-4">🧠</div>
            <h3 className="text-xl font-bold mb-2">AI Adaptive</h3>
            <p className="text-gray-400">Questions get harder as you improve, ensuring optimal learning curve.</p>
          </div>
          <div className="p-6 bg-gray-800/50 rounded-xl border border-gray-700">
            <div className="text-4xl mb-4">📊</div>
            <h3 className="text-xl font-bold mb-2">Smart Analytics</h3>
            <p className="text-gray-400">Track your mastery with detailed heatmaps and progress charts.</p>
          </div>
          <div className="p-6 bg-gray-800/50 rounded-xl border border-gray-700">
            <div className="text-4xl mb-4">🏆</div>
            <h3 className="text-xl font-bold mb-2">Gamified</h3>
            <p className="text-gray-400">Earn XP, badges, and compete on leaderboards while you learn.</p>
          </div>
        </div>
      </main>

      <footer className="mt-auto py-8 text-gray-500">
        <p>&copy; 2026 Adaptive Learning System</p>
      </footer>
    </div>
  );
}
