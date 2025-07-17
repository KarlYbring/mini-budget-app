import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

export default function Login({ onLogin }: { onLogin: () => void }) {
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    try {
      const res = await axios.post(`${import.meta.env.VITE_API_URL}/user/login`, form);
      localStorage.setItem("token", res.data.token); // Lägg till denna rad!
      onLogin();
      navigate("/"); // Redirect till MiniBudget-sidan efter lyckad inloggning
    } catch (err: any) {
      setError("Inloggning misslyckades. Kontrollera dina uppgifter.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form className="auth-form" onSubmit={handleLogin}>
      <h2>Logga in</h2>
      <input name="email" type="email" placeholder="E-post" value={form.email} onChange={handleChange} required />
      <input name="password" type="password" placeholder="Lösenord" value={form.password} onChange={handleChange} required />
      <button type="submit" disabled={isLoading}>
        {isLoading ? "Vänta..." : "Logga in"}
      </button>
      {isLoading && (
        <div className="spinner">
          <div className="spinner-circle"></div>
          logging in
        </div>
      )}
      {error && <div style={{ color: "#ff4d4d", marginTop: 8 }}>{error}</div>}
      <div style={{ marginTop: 16, textAlign: "center" }}>
        <span>Har du inget konto? </span>
        <Link to="/register" style={{ color: "#0969da" }}>Skapa konto</Link>
      </div>
    </form>
  );
}