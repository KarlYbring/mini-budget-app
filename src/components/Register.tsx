import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

export default function Register({ onRegister }: { onRegister: () => void }) {
  const [form, setForm] = useState({ firstName: "", lastName: "", email: "", password: "" });
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      await axios.post("https://localhost:7233/api/user/register", form);
      onRegister();
      navigate("/login"); // Redirect till login-sidan
    } catch (err: any) {
      setError("Registrering misslyckades. E-post kan redan vara registrerad.");
    }
  };

  return (
    <form className="auth-form" onSubmit={handleSubmit}>
      <h2>Skapa konto</h2>
      <input name="firstName" placeholder="Förnamn" value={form.firstName} onChange={handleChange} required />
      <input name="lastName" placeholder="Efternamn" value={form.lastName} onChange={handleChange} required />
      <input name="email" type="email" placeholder="E-post" value={form.email} onChange={handleChange} required />
      <input name="password" type="password" placeholder="Lösenord" value={form.password} onChange={handleChange} required />
      <button type="submit">Registrera</button>
      {error && <div style={{ color: "#ff4d4d", marginTop: 8 }}>{error}</div>}
      <div style={{ marginTop: 16, textAlign: "center" }}>
        <span>Har du redan ett konto? </span>
        <Link to="/login" style={{ color: "#0969da" }}>Logga in</Link>
      </div>
    </form>
  );
}