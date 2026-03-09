import { Link, useLocation } from "react-router-dom";

interface Props {
  logout: () => void;
}

export default function Sidebar({ logout }: Props) {
  const location = useLocation();

  const navItem = (path: string, label: string) => {
    const active = location.pathname === path;

    return (
      <Link
        to={path}
        className={`block px-4 py-2 rounded-lg transition ${
          active
            ? "bg-indigo-600 text-white"
            : "text-gray-400 hover:bg-gray-800 hover:text-white"
        }`}
      >
        {label}
      </Link>
    );
  };

  return (
    <div className="w-60 bg-card border-r border-border p-6 flex flex-col justify-between">
      <div>
        <h2 className="text-xl font-bold mb-8">MagicLink Admin</h2>

        <div className="flex flex-col gap-3">
          {navItem("/", "Dashboard")}
          {navItem("/users", "Users")}
          {navItem("/token-logs", "Token Logs")}
          {navItem("/activity", "Admin Logs")}
        </div>
      </div>

      <button
        onClick={logout}
        className="mt-10 bg-red-500/20 text-red-400 py-2 rounded-lg hover:bg-red-500/30 transition"
      >
        Logout
      </button>
    </div>
  );
}