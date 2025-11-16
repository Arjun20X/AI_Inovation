import { useNavigate } from "react-router-dom";
import { LogOut } from "lucide-react";

export default function Home() {
  const navigate = useNavigate();

  const handleRegister = () => {
    // Clear any stored login token from localStorage
    // localStorage.removeItem("authToken");
    // localStorage.removeItem("token");
    // localStorage.removeItem("user");

    // Navigate back to login page
    navigate("/register");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md text-center">
        <div className="bg-slate-800 rounded-2xl shadow-2xl p-12 border border-slate-700">
          {/* Welcome Message */}
          <h1 className="text-4xl font-bold text-white mb-4">
            Welcome to the Dashboard
          </h1>
          <p className="text-slate-400 text-lg mb-8">
            You are successfully logged in!
          </p>

          {/* Logout Button */}
          <button
            onClick={handleRegister}
            className="flex items-center justify-center gap-2 w-full px-6 py-3 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-lg transition-all active:scale-95"
          >
            <LogOut className="w-5 h-5" />
            Register
          </button>
        </div>
      </div>
    </div>
  );
}
