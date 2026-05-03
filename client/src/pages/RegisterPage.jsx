import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import BrandMark from "../components/BrandMark";
import PageFooter from "../components/PageFooter";
import { useAuth } from "../context/AuthContext";

export default function RegisterPage() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setLoading(true);
    setError("");
    try {
      await register(form);
      navigate("/dashboard");
    } catch (submitError) {
      setError(submitError.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-shell">
      <div className="auth-card">
        <div className="auth-copy">
          <div className="auth-brand">
            <BrandMark />
            <span className="pill">Industry Ready Build</span>
          </div>
          <h1>Create your account</h1>
          <p>Secure sign-up, fuel-wise dashboards, calendar-based tracking, and Render-friendly deployment flow.</p>
        </div>
        <form className="auth-form" onSubmit={handleSubmit}>
          <label>
            Full name
            <input
              type="text"
              value={form.name}
              onChange={(event) => setForm({ ...form, name: event.target.value })}
              required
            />
          </label>
          <label>
            Email
            <input
              type="email"
              value={form.email}
              onChange={(event) => setForm({ ...form, email: event.target.value })}
              required
            />
          </label>
          <label>
            Password
            <input
              type="password"
              minLength={6}
              value={form.password}
              onChange={(event) => setForm({ ...form, password: event.target.value })}
              required
            />
          </label>
          {error ? <p className="form-error">{error}</p> : null}
          <button className="primary-button" disabled={loading} type="submit">
            {loading ? "Creating..." : "Register"}
          </button>
          <p className="auth-alt">
            Already have an account? <Link to="/login">Login</Link>
          </p>
          <p className="auth-alt">
            <Link to="/">Back to home</Link>
          </p>
        </form>
      </div>
      <PageFooter />
    </div>
  );
}
