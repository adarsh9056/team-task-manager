import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <div className="flex items-center gap-6">
          <Link to="/dashboard" className="text-lg font-semibold text-blue-600">
            Team Task Manager
          </Link>
          <div className="flex items-center gap-3 text-sm">
            <Link to="/dashboard" className="text-slate-700 hover:text-blue-600">
              Dashboard
            </Link>
            <Link to="/projects" className="text-slate-700 hover:text-blue-600">
              Projects
            </Link>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="hidden text-sm text-slate-600 sm:inline">{user?.name || "User"}</span>
          <button
            onClick={handleLogout}
            className="bg-slate-900 text-white hover:bg-slate-700"
            type="button"
          >
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
