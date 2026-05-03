import { Link, Navigate } from "react-router-dom";
import BrandMark from "../components/BrandMark";
import PageFooter from "../components/PageFooter";
import { useAuth } from "../context/AuthContext";

export default function HomePage() {
  const { auth } = useAuth();
  if (auth?.token) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="home-shell">
      <header className="home-topbar">
        <div className="brand-line">
          <BrandMark />
          <div>
            <strong>Petrol Bunk Calculator</strong>
            <span>Professional day-wise fuel operations platform</span>
          </div>
        </div>
        <nav className="home-nav">
          <Link className="ghost-button" to="/about">
            About
          </Link>
          <Link className="ghost-button" to="/login">
            Login
          </Link>
          <Link className="primary-button" to="/register">
            Get started
          </Link>
        </nav>
      </header>

      <section className="hero-band">
        <div className="hero-copy">
          <span className="pill dark-pill">Built for petrol bunks</span>
          <h1>Daily nozzle tracking that feels clear, fast, and trustworthy.</h1>
          <p>
            Secure accounts, pie-chart insights, calendar-based history, fuel-wise tracking, and share-ready
            summaries for your team and friends.
          </p>
          <div className="hero-actions">
            <Link className="primary-button" to="/register">
              Create account
            </Link>
            <Link className="ghost-button" to="/login">
              Sign in
            </Link>
          </div>
        </div>
        <div className="hero-showcase">
          <div className="showcase-card">
            <span>Monthly performance</span>
            <strong>Fuel-wise tracking</strong>
            <small>Petrol, Diesel, daily sheets, secure user records</small>
          </div>
          <div className="showcase-grid">
            <article>
              <span>Calendar tracker</span>
              <strong>Day-wise</strong>
            </article>
            <article>
              <span>Share options</span>
              <strong>WhatsApp + Email</strong>
            </article>
            <article>
              <span>Accounts</span>
              <strong>Private user data</strong>
            </article>
            <article>
              <span>Deployment</span>
              <strong>Render ready</strong>
            </article>
          </div>
        </div>
      </section>

      <section className="feature-strip">
        <article className="feature-card">
          <h2>Industry-standard structure</h2>
          <p>React frontend, Node.js API, PostgreSQL persistence, environment-based configuration, and clean routing.</p>
        </article>
        <article className="feature-card">
          <h2>Per-user separation</h2>
          <p>Every record is tied to the logged-in user, so one user cannot see another user’s petrol bunk calculations.</p>
        </article>
        <article className="feature-card">
          <h2>Professional sharing</h2>
          <p>Quick links for WhatsApp and email, plus structured summaries that are easy to understand on mobile.</p>
        </article>
      </section>

      <section className="share-home">
        <h2>Share the product</h2>
        <p>Invite your friend to try the platform with quick share actions from the homepage.</p>
        <div className="share-actions">
          <a
            className="primary-button"
            href="https://wa.me/?text=Try%20this%20Petrol%20Bunk%20Calculator%20platform%20for%20daily%20fuel%20tracking."
            rel="noreferrer"
            target="_blank"
          >
            WhatsApp
          </a>
          <a
            className="ghost-button"
            href="mailto:?subject=Petrol Bunk Calculator&body=Try this Petrol Bunk Calculator platform for daily fuel tracking."
          >
            Email
          </a>
        </div>
      </section>

      <PageFooter />
    </div>
  );
}
