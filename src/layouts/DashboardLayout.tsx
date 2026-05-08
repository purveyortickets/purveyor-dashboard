import { type ReactNode, useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

interface Props {
  children: ReactNode;
  logout: () => void;
}

export default function DashboardLayout({ children, logout }: Props) {

  const location = useLocation();
  const navigate = useNavigate();
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [pendingPath, setPendingPath] = useState<string | null>(null);

  const menu = [
    { name: "Dashboard", icon: "🏠", path: "/" },
    { name: "Users", icon: "👥", path: "/users" },
    { name: "Checkouts", icon: "✅", path: "/checkouts" },
    { name: "Token Logs", icon: "🎟", path: "/logs" },
    { name: "Admin Logs", icon: "📜", path: "/activity" }
  ];

  const handleNavigate = (path: string) => {
    if (location.pathname === path) return;
    setIsTransitioning(true);
    setPendingPath(path);
  };

  useEffect(() => {
    if (isTransitioning && pendingPath) {
      const timer = setTimeout(() => {
        navigate(pendingPath);
        setPendingPath(null);
        setTimeout(() => setIsTransitioning(false), 50);
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [isTransitioning, pendingPath, navigate]);

  return (
    <div className="flex min-h-screen bg-gray-950 text-white">

      {/* SIDEBAR */}
      <div className="w-64 bg-gradient-to-b from-gray-900 to-gray-950 border-r border-gray-800 p-6 flex flex-col">

        <div className="text-xl font-bold mb-10">
          Purveyor Tickets
        </div>

        <nav className="space-y-2 flex-1">
          {menu.map(item => {
            const active = location.pathname === item.path;

            return (
              <button
                key={item.name}
                onClick={() => handleNavigate(item.path)}
                className={`w-full flex items-center gap-3 p-3 rounded-lg transition-all duration-300 ease-in-out
                  ${active
                    ? "bg-indigo-600/20 border-l-4 border-indigo-500 text-white"
                    : "border-l-4 border-transparent text-gray-400 hover:bg-gray-800 hover:text-white hover:translate-x-1"
                  }
                `}
              >
                <span className="text-lg transition-transform duration-200">
                  {item.icon}
                </span>
                <span className="transition-colors duration-200">
                  {item.name}
                </span>
              </button>
            );
          })}
        </nav>

        <button
          onClick={logout}
          className="mt-6 bg-red-500/20 hover:bg-red-500/40 transition-all duration-200 rounded-lg p-3"
        >
          Logout
        </button>

      </div>

      {/* MAIN CONTENT */}
      <div className="flex-1 p-8 overflow-auto">
        <div
          className={`transition-all duration-300 ease-in-out ${
            isTransitioning
              ? "opacity-0 translate-y-3"
              : "opacity-100 translate-y-0"
          }`}
        >
          {children}
        </div>
      </div>

    </div>
  );
}