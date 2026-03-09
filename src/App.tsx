import { useState } from "react";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Users from "./pages/Users";
import Logs from "./pages/Logs";
import Activity from "./pages/Activity";

import { BrowserRouter, Routes, Route } from "react-router-dom";

export default function App() {

  const [token, setToken] = useState<string | null>(
    localStorage.getItem("token")
  );

  if (!token) {
    return <Login setToken={setToken} />;
  }

  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
  };

  return (

    <BrowserRouter>

      <Routes>

        <Route path="/" element={<Dashboard logout={logout} />} />

        <Route path="/users" element={<Users logout={logout} />} />

        <Route path="/logs" element={<Logs logout={logout} />} />

        <Route path="/activity" element={<Activity logout={logout} />} />

      </Routes>

    </BrowserRouter>

  );
}