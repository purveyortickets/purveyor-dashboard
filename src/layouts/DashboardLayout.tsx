import type { ReactNode } from "react";
import { useLocation, useNavigate } from "react-router-dom";

interface Props {
  children: ReactNode;
  logout: () => void;
}

export default function DashboardLayout({ children, logout }: Props) {

  const location = useLocation();
  const navigate = useNavigate();

  const menu = [
    { name: "Dashboard", icon: "🏠", path: "/" },
    { name: "Users", icon: "👥", path: "/users" },
    { name: "Token Logs", icon: "🎟", path: "/logs" },
    { name: "Admin Logs", icon: "📜", path: "/activity" }
  ];

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
onClick={() => navigate(item.path)}
className={`w-full flex items-center gap-3 p-3 rounded-lg transition-all duration-200

${active
? "bg-indigo-600/20 border-l-4 border-indigo-500"
: "hover:bg-gray-800 hover:translate-x-1"
}
`}
>

<span className="text-lg">
{item.icon}
</span>

<span>
{item.name}
</span>

</button>

);

})}

</nav>

<button
onClick={logout}
className="mt-6 bg-red-500/20 hover:bg-red-500/40 transition rounded-lg p-3"
>
Logout
</button>

</div>

{/* MAIN */}

<div className="flex-1 p-8">

{children}

</div>

</div>

  );
}