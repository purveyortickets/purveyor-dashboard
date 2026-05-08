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
  const [mobileOpen, setMobileOpen] = useState(false);

  const menu = [
    { name: "Dashboard", icon: "🏠", path: "/" },
    { name: "Users", icon: "👥", path: "/users" },
    { name: "Checkouts", icon: "✅", path: "/checkouts" },
    { name: "Token Logs", icon: "🎟", path: "/logs" },
    { name: "Admin Logs", icon: "📜", path: "/activity" }
  ];

  const handleNavigate = (path: string) => {
    if (location.pathname === path) {
      setMobileOpen(false);
      return;
    }
    setIsTransitioning(true);
    setPendingPath(path);
    setMobileOpen(false);
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

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  return (
    <div className="flex h-screen bg-gray-950 text-white overflow-hidden">

      {/* MOBILE OVERLAY */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* SIDEBAR */}
      <div className={`
        fixed lg:static inset-y-0 left-0 z-50
        w-64 bg-gradient-to-b from-gray-900 to-gray-950 border-r border-gray-800
        flex flex-col h-screen
        transition-transform duration-300 ease-in-out
        ${mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
      `}>

        {/* LOGO */}
        <div className="p-6 pb-2">
          <div className="text-xl font-bold">
            Purveyor Tickets
          </div>
        </div>

        {/* NAV */}
        <nav className="flex-1 px-4 py-4 space-y-2 overflow-y-auto">
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
                <span className="text-lg">{item.icon}</span>
                <span>{item.name}</span>
              </button>
            );
          })}
        </nav>

        {/* LOGOUT - pinned to bottom */}
        <div className="p-4 border-t border-gray-800">
          <button
            onClick={logout}
            className="w-full bg-red-500/20 hover:bg-red-500/40 transition-all duration-200 rounded-lg p-3 text-red-400"
          >
            Logout
          </button>
        </div>

      </div>

      {/* MAIN CONTENT */}
      <div className="flex-1 flex flex-col min-w-0">

        {/* MOBILE HEADER */}
        <div className="lg:hidden flex items-center gap-3 p-4 border-b border-gray-800 bg-gray-900">
          <button
            onClick={() => setMobileOpen(true)}
            className="text-2xl"
          >
            ☰
          </button>
          <span className="font-bold">Purveyor Tickets</span>
        </div>

        {/* SCROLLABLE CONTENT */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
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

    </div>
  );
}