import { useState } from "react";
import api from "../services/api";

interface Props {
  setToken: (token: string) => void;
}

export default function Login({ setToken }: Props) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async () => {
    try {
      const res = await api.post("/admin/login", {
        username,
        password,
      });

      if (res.data.success) {
        const token = res.data.data.token;
        localStorage.setItem("token", token);
        setToken(token);
      } else {
        setError(res.data.error || "Login failed");
      }
    } catch {
      setError("Invalid credentials");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="bg-card p-8 rounded-xl shadow-xl w-96 border border-border">
        <h2 className="text-2xl font-semibold mb-6 text-center">
          Admin Login
        </h2>

        {error && (
          <div className="mb-4 text-danger text-sm text-center">
            {error}
          </div>
        )}

        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="w-full mb-4 px-4 py-2 rounded-lg bg-gray-700 focus:outline-none"
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full mb-6 px-4 py-2 rounded-lg bg-gray-700 focus:outline-none"
        />

        <button
          onClick={handleLogin}
          className="w-full bg-primary py-2 rounded-lg hover:opacity-90 transition"
        >
          Login
        </button>
      </div>
    </div>
  );
}