import {
  ArrowRight,
  Bolt,
  Clock3,
  Dumbbell,
  Instagram,
  ShieldCheck,
  TrendingUp,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import { privacyDocument, termsDocument } from "./legalContent.js";
import {
  hasSessionWaitlistSubmission,
  isValidWaitlistEmail,
  submitWaitlistEmail,
} from "./waitlist.js";

const features = [
  {
    icon: ShieldCheck,
    title: "Official Test Day",
    body: "Benchmark your speed, agility, and explosiveness with a locked performance test.",
  },
  {
    icon: Dumbbell,
    title: "Daily Training",
    body: "Follow structured workouts built to improve your athletic performance.",
  },
  {
    icon: TrendingUp,
    title: "Track PRs",
    body: "Save drill history, reps, surfaces, and personal records over time.",
  },
  {
    icon: Bolt,
    title: "Future Hardware Ready",
    body: "Built for manual timing now, with laser gate support planned.",
  },
];

const productPoints = [
  "Track sprint, agility, and explosive drills",
  "Complete daily workouts",
  "Save PRs and drill history",
  "Prepare for Official Test Day",
  "Compare progress over time",
];

const appScreenshots = [
  {
    src: "/app-screens/img-8723-active-workout.png?v=8723",
    title: "Active Workout",
    label: "Field workout",
    body: "Surface, drill setup, rep progress, timing controls, and live sprint guidance.",
  },
  {
    src: "/app-screens/img-8724-training-feedback.png?v=8724",
    title: "Training Feedback",
    label: "Progress tracking",
    body: "Rep timing, goal comparison, session bests, and official PR context.",
  },
  {
    src: "/app-screens/img-8725-stat-card.png?v=8725",
    title: "Official Stat Card",
    label: "Benchmarking",
    body: "Runner Score, athletic breakdowns, official PRs, archetype, and share-ready results.",
  },
];

const homeMeta = {
  title: "My Combine | Test. Compete. Improve.",
  description:
    "My Combine is a sports performance testing app for speed, agility, explosiveness, and official athlete benchmarking.",
};

function usePageMeta(title, description) {
  useEffect(() => {
    document.title = title;

    let metaDescription = document.querySelector('meta[name="description"]');

    if (!metaDescription) {
      metaDescription = document.createElement("meta");
      metaDescription.setAttribute("name", "description");
      document.head.appendChild(metaDescription);
    }

    metaDescription.setAttribute("content", description);
  }, [title, description]);
}

function parseLegalMarkdown(markdown) {
  const blocks = [];
  let listItems = [];

  const flushList = () => {
    if (listItems.length > 0) {
      blocks.push({ type: "list", items: listItems });
      listItems = [];
    }
  };

  markdown.split("\n").forEach((line) => {
    const trimmed = line.trim();

    if (!trimmed) {
      flushList();
      return;
    }

    if (trimmed.startsWith("### ")) {
      flushList();
      blocks.push({ type: "heading", level: 3, text: trimmed.slice(4) });
      return;
    }

    if (trimmed.startsWith("## ")) {
      flushList();
      blocks.push({ type: "heading", level: 2, text: trimmed.slice(3) });
      return;
    }

    if (trimmed.startsWith("# ")) {
      flushList();
      blocks.push({ type: "heading", level: 1, text: trimmed.slice(2) });
      return;
    }

    if (trimmed.startsWith("- ")) {
      listItems.push(trimmed.slice(2));
      return;
    }

    flushList();
    blocks.push({ type: "paragraph", text: trimmed });
  });

  flushList();
  return blocks;
}

function renderLegalBlocks(markdown) {
  return parseLegalMarkdown(markdown).map((block, index) => {
    if (block.type === "heading" && block.level === 1) {
      return null;
    }

    if (block.type === "heading" && block.level === 2) {
      return <h2 key={`heading-${index}`}>{block.text}</h2>;
    }

    if (block.type === "heading" && block.level === 3) {
      return <h3 key={`heading-${index}`}>{block.text}</h3>;
    }

    if (block.type === "list") {
      return (
        <ul key={`list-${index}`}>
          {block.items.map((item, itemIndex) => (
            <li key={`${item}-${itemIndex}`}>{item}</li>
          ))}
        </ul>
      );
    }

    return <p key={`paragraph-${index}`}>{block.text}</p>;
  });
}

function LegalHeader() {
  return (
    <header className="nav legal-nav">
      <a className="brand" href="/" aria-label="My Combine home">
        <span className="app-icon" aria-hidden="true">
          <img src="/mc-runner-logo.png" alt="" />
        </span>
        <span>
          <strong>My Combine</strong>
          <small>TEST. COMPETE. IMPROVE.</small>
        </span>
      </a>
      <a className="social-pill" href="/">
        Back to home
      </a>
    </header>
  );
}

function SiteFooter() {
  return (
    <footer className="footer">
      <div>
        <strong>My Combine</strong>
        <span>mycombineapp.com</span>
      </div>
      <nav className="footer-social" aria-label="Social links">
        <a href="https://instagram.com/mycombineapp">Instagram: @mycombineapp</a>
        <a href="https://tiktok.com/@mycombineapp">TikTok: @mycombineapp</a>
      </nav>
      <nav className="footer-links" aria-label="Legal and contact links">
        <a href="/terms">Terms of Service</a>
        <a href="/privacy">Privacy Policy</a>
        <a href="mailto:team@mycombineapp.com">Contact</a>
      </nav>
      <p>© 2026 My Combine. All rights reserved.</p>
    </footer>
  );
}

function LegalPage({ legalDocument }) {
  usePageMeta(legalDocument.seoTitle, legalDocument.description);

  return (
    <main className="site-shell legal-shell">
      <LegalHeader />
      <article className="legal-page" aria-labelledby="legal-title">
        <span className="status-badge legal-eyebrow">Legal</span>
        <h1 id="legal-title">{legalDocument.title}</h1>
        <p className="legal-summary">{legalDocument.description}</p>
        <p className="legal-effective">Effective Date: {legalDocument.effectiveDate}</p>
        <div className="legal-content">{renderLegalBlocks(legalDocument.body)}</div>
        {legalDocument.pdfHref && (
          <div className="legal-download">
            <a href={legalDocument.pdfHref}>{legalDocument.pdfLabel}</a>
          </div>
        )}
      </article>
      <SiteFooter />
    </main>
  );
}

function LandingPage() {
  usePageMeta(homeMeta.title, homeMeta.description);

  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(() => hasSessionWaitlistSubmission());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();
    setErrorMessage("");

    if (submitted || hasSessionWaitlistSubmission()) {
      setSubmitted(true);
      setEmail("");
      return;
    }

    if (!isValidWaitlistEmail(email)) {
      setErrorMessage("Enter a valid email address.");
      return;
    }

    setIsSubmitting(true);

    try {
      await submitWaitlistEmail(email);
      setSubmitted(true);
      setEmail("");
    } catch (error) {
      setErrorMessage(error.message || "Waitlist submission failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="site-shell">
      <section className="hero" aria-labelledby="hero-title">
        <div className="nav">
          <a className="brand" href="https://mycombineapp.com" aria-label="My Combine home">
            <span className="app-icon" aria-hidden="true">
              <img src="/mc-runner-logo.png" alt="" />
            </span>
            <span>
              <strong>My Combine</strong>
              <small>TEST. COMPETE. IMPROVE.</small>
            </span>
          </a>
          <a className="social-pill" href="https://instagram.com/mycombineapp">
            <Instagram size={16} aria-hidden="true" />
            @mycombineapp
          </a>
        </div>

        <div className="hero-grid">
          <div className="hero-copy">
            <span className="status-badge">
              <Clock3 size={15} aria-hidden="true" />
              Coming Soon
            </span>
            <p className="kicker">Your combine in your pocket.</p>
            <h1 className="hero-title" id="hero-title">
              <span>Test.</span>
              <span>Compete.</span>
              <span>Improve.</span>
            </h1>
            <p className="hero-text">
              Portable speed and agility testing built for athletes who want measurable progress.
              Test speed, agility, and explosiveness. Track progress. Prepare for Official Test Day.
            </p>
            <div className="hero-actions" aria-label="Primary actions">
              <a className="button button-primary" href="#waitlist">
                Join the Waitlist
                <ArrowRight size={18} aria-hidden="true" />
              </a>
              <a className="button button-secondary" href="https://instagram.com/mycombineapp">
                <Instagram size={18} aria-hidden="true" />
                Follow @mycombineapp
              </a>
            </div>
          </div>

          <div className="hero-visual" aria-label="My Combine home dashboard app preview">
            <div className="hero-device">
              <div className="hero-device-glass">
                <img
                  className="app-screenshot"
                  src="/app-screens/img-8722-home-dashboard.png?v=8722"
                  alt="My Combine home dashboard showing Runner Score 55, Speed, Agility, Explosiveness, and Today's Workout."
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section product-section" aria-labelledby="product-title">
        <div className="section-heading">
          <span>Performance tracking</span>
          <h2 id="product-title">Built for measurable athletic progress.</h2>
        </div>
        <div className="product-copy">
          <p>
            My Combine helps athletes test, train, and track speed, agility, and explosiveness
            through structured workouts, drill history, PR tracking, and Official Test Day scoring.
          </p>
          <ul>
            {productPoints.map((point) => (
              <li key={point}>{point}</li>
            ))}
          </ul>
        </div>
      </section>

      <section className="section feature-section" aria-label="My Combine features">
        {features.map(({ icon: Icon, title, body }) => (
          <article className="feature-card" key={title}>
            <div className="feature-icon">
              <Icon size={22} aria-hidden="true" />
            </div>
            <h3>{title}</h3>
            <p>{body}</p>
          </article>
        ))}
      </section>

      <section className="section visual-section" aria-labelledby="visual-title">
        <div className="section-heading">
          <span>Field ready</span>
          <h2 id="visual-title">Built for the field, track, turf, or training facility.</h2>
        </div>
        <div className="app-showcase">
          {appScreenshots.map((screen) => (
            <article className="showcase-screen-card" key={screen.title}>
              <div className="device-frame" aria-label={`${screen.title} app screenshot`}>
                <div className="device-glass">
                  <img className="app-screenshot" src={screen.src} alt={`${screen.title}: ${screen.body}`} />
                </div>
              </div>
              <div className="showcase-screen-copy">
                <span>{screen.label}</span>
                <h3>{screen.title}</h3>
                <p>{screen.body}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="section waitlist-section" id="waitlist" aria-labelledby="waitlist-title">
        <div>
          <span className="status-badge">Get early access</span>
          <h2 id="waitlist-title">Be first on the field.</h2>
          <p>Join the launch list for My Combine updates and early access.</p>
        </div>
        <form className="waitlist-form" onSubmit={handleSubmit}>
          <label htmlFor="email">Get early access</label>
          <div className="input-row">
            <input
              id="email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="Enter your email"
              disabled={isSubmitting || submitted}
              required
            />
            <button className="button button-primary" type="submit" disabled={isSubmitting || submitted}>
              {isSubmitting ? "Joining..." : submitted ? "Joined" : "Join Waitlist"}
            </button>
          </div>
          <div className="waitlist-message" aria-live="polite">
            {submitted && (
              <p className="success-message">
                You're on the list. We'll let you know when My Combine launches.
              </p>
            )}
            {errorMessage && <p className="error-message">{errorMessage}</p>}
          </div>
        </form>
      </section>

      <SiteFooter />
    </main>
  );
}

function App() {
  const normalizedPath = window.location.pathname.replace(/\/+$/, "") || "/";

  if (normalizedPath === "/terms") {
    return <LegalPage legalDocument={termsDocument} />;
  }

  if (normalizedPath === "/privacy") {
    return <LegalPage legalDocument={privacyDocument} />;
  }

  return <LandingPage />;
}

export default App;
