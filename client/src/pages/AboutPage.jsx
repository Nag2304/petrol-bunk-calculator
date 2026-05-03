import { Link } from "react-router-dom";
import BrandMark from "../components/BrandMark";
import PageFooter from "../components/PageFooter";

export default function AboutPage() {
  return (
    <div className="home-shell">
      <header className="home-topbar">
        <div className="brand-line">
          <BrandMark compact />
          <div>
            <strong>About the platform</strong>
            <span>Built for reliable petrol bunk operations</span>
          </div>
        </div>
        <nav className="home-nav">
          <Link className="ghost-button" to="/">
            Home
          </Link>
          <Link className="ghost-button" to="/login">
            Login
          </Link>
          <Link className="primary-button" to="/register">
            Register
          </Link>
        </nav>
      </header>

      <section className="about-panel">
        <article className="feature-card">
          <h1>Professional, user-friendly, and secure.</h1>
          <p>
            This application is designed so each staff member or owner can maintain separate daily nozzle records,
            review month-wise summaries, and share clean operational updates from any browser.
          </p>
        </article>
        <article className="feature-card">
          <h2>Privacy model</h2>
          <p>
            Each record is stored with a `user_id` in PostgreSQL, and every dashboard or day-sheet query is filtered
            by the authenticated user token. That means calculations stay private per account.
          </p>
        </article>
        <article className="feature-card">
          <h2>Deployment model</h2>
          <p>
            The app is configured to run locally during development and can also be built as a single Render web
            service for easy sharing.
          </p>
        </article>
      </section>

      <PageFooter />
    </div>
  );
}
