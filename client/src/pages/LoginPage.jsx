import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import BrandMark from "../components/BrandMark";
import PageFooter from "../components/PageFooter";
import { useAuth } from "../context/AuthContext";

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setLoading(true);
    setError("");
    try {
      await login(form);
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
            <span className="pill">Petrol Bunk Calculator</span>
          </div>
          <h1>Welcome back</h1>
          <p>Track daily nozzle sales, fuel performance, and share clean reports from one dashboard.</p>
        </div>
        <form className="auth-form" onSubmit={handleSubmit}>
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
              value={form.password}
              onChange={(event) => setForm({ ...form, password: event.target.value })}
              required
            />
          </label>
          {error ? <p className="form-error">{error}</p> : null}
          <button className="primary-button" disabled={loading} type="submit">
            {loading ? "Signing in..." : "Login"}
          </button>
          <p className="auth-alt">
            New here? <Link to="/register">Create account</Link>
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
