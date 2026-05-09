import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import { AuthProvider, useAuth } from "./lib/auth";
import Home from "./pages/Home";
import PostJob from "./pages/PostJob";

function Navbar() {
  const { user, signInWithGoogle, logout } = useAuth();

  return (
    <nav className="flex items-center justify-between px-4 sm:px-8 py-4 bg-white border-b border-slate-200 shrink-0 sticky top-0 z-50">
      <Link to="/" className="flex items-center gap-2">
        <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
          <div className="w-4 h-4 border-2 border-white rotate-45"></div>
        </div>
        <span className="text-xl font-bold text-slate-900 tracking-tight">TaskMatch</span>
      </Link>
      <div className="flex items-center gap-4 sm:gap-8">
        <Link to="/" className="text-sm font-medium text-slate-600 hover:text-indigo-600 transition-colors hidden sm:block">
          Browse Jobs
        </Link>
        <Link to="/post" className="text-sm font-medium text-slate-600 hover:text-indigo-600 transition-colors hidden sm:block">
          Post a Job
        </Link>
        <div className="flex items-center gap-3 pl-4 sm:pl-8 border-l border-slate-200">
          {user ? (
            <>
              <span className="text-sm font-medium text-slate-600 hidden sm:inline-block">
                {user.email}
              </span>
              <button onClick={logout} className="px-4 py-2 bg-slate-100 text-slate-700 text-sm font-semibold rounded-full shadow-sm hover:bg-slate-200 transition-all">
                Log out
              </button>
            </>
          ) : (
            <>
              <button className="text-sm font-medium text-slate-600" onClick={signInWithGoogle}>Login</button>
              <button 
                onClick={signInWithGoogle} 
                className="px-4 py-2 bg-indigo-600 text-white text-sm font-semibold rounded-full shadow-sm hover:bg-indigo-700 transition-all">
                Sign Up
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen w-full bg-slate-50 font-sans flex flex-col overflow-x-hidden">
          <Navbar />
          <main className="flex flex-1 flex-col">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/post" element={<PostJob />} />
            </Routes>
          </main>
          <footer className="px-8 py-4 bg-white border-t border-slate-200 shrink-0 mt-auto">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-2">
              <p className="text-[11px] font-medium text-slate-400">
                © {new Date().getFullYear()} TaskMatch Marketplace. Locally driven.
              </p>
              <div className="flex gap-6">
                <a href="#" className="text-[11px] font-bold text-slate-500 hover:text-indigo-600">Terms</a>
                <a href="#" className="text-[11px] font-bold text-slate-500 hover:text-indigo-600">Privacy</a>
                <a href="#" className="text-[11px] font-bold text-slate-500 hover:text-indigo-600">Support</a>
              </div>
            </div>
          </footer>
        </div>
      </Router>
    </AuthProvider>
  );
}
