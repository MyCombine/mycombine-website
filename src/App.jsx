import {
  Activity,
  ArrowRight,
  Bolt,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Dumbbell,
  Flame,
  Home,
  Instagram,
  Medal,
  ShieldCheck,
  Timer,
  TrendingUp,
  Trophy,
  User,
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

          <div className="hero-visual" aria-label="My Combine Speed Workout app preview">
            <div className="hero-device">
              <div className="hero-device-glass">
                <div className="hero-app-screen">
                  <div className="speed-back">
                    <ChevronLeft size={19} aria-hidden="true" />
                    <span>Back</span>
                  </div>

                  <div className="speed-brand-title">My Combine</div>

                  <section className="speed-workout-card" aria-label="Speed Workout preview">
                    <header className="speed-workout-header">
                      <h3>Speed Workout</h3>
                      <p>3 drills - 30 min</p>
                    </header>

                    <div className="speed-session">
                      <h4>Session Focus</h4>
                      <p>Straight-line acceleration and top-end sprint work</p>
                      <span>Adjusted for: Beginner</span>
                    </div>

                    <button className="surface-control" type="button">
                      <span>Surface: Grass / Turf</span>
                      <strong>Change</strong>
                    </button>

                    <button className="edit-workout-control" type="button">Edit Workout</button>

                    <div className="workout-lineup">
                      <h4>Workout Lineup</h4>
                      <div className="lineup-row">
                        <div>
                          <strong>1. 10-Yard Sprint</strong>
                          <span>6 reps - Timer or gates · 10 yd</span>
                        </div>
                        <ChevronRight size={21} aria-hidden="true" />
                      </div>
                      <div className="lineup-row">
                        <div>
                          <strong>2. 20-Yard Sprint</strong>
                          <span>5 reps - Timer or gates · 20 yd</span>
                        </div>
                        <ChevronRight size={21} aria-hidden="true" />
                      </div>
                      <div className="lineup-row">
                        <div>
                          <strong>3. 40-Yard Dash</strong>
                          <span>3 reps - Timer or gates · 40 yd</span>
                        </div>
                        <ChevronRight size={21} aria-hidden="true" />
                      </div>
                    </div>

                    <button className="start-workout-button" type="button">Start Workout</button>
                  </section>

                  <nav className="hero-app-nav" aria-label="My Combine app preview navigation">
                    <span>
                      <Home size={17} aria-hidden="true" />
                      Home
                    </span>
                    <span className="active">
                      <Dumbbell size={18} aria-hidden="true" />
                      Workout
                    </span>
                    <span>
                      <Trophy size={17} aria-hidden="true" />
                      Results
                    </span>
                    <span>
                      <User size={17} aria-hidden="true" />
                      Me
                    </span>
                  </nav>
                </div>
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
          <div className="device-frame" aria-label="My Combine app home screen preview">
            <div className="device-side-button left" aria-hidden="true" />
            <div className="device-side-button right" aria-hidden="true" />
            <div className="device-glass">
              <div className="dynamic-island" aria-hidden="true" />
              <div className="app-dashboard">
                <div className="app-status">
                  <span>9:41</span>
                  <span>5G 100%</span>
                </div>

                <header className="app-home-header">
                  <div>
                    <p>Good morning, Jalen</p>
                    <h3>My Combine</h3>
                  </div>
                  <div className="athlete-avatar" aria-hidden="true">
                    JS
                  </div>
                </header>

                <section className="runner-score-card" aria-label="Runner Score 86">
                  <div>
                    <span>Runner Score</span>
                    <strong>86</strong>
                    <p>Elite acceleration trend</p>
                  </div>
                  <div className="score-ring" aria-hidden="true">
                    86
                  </div>
                </section>

                <div className="stat-grid" aria-label="Personal records">
                  <div>
                    <span>40 Yard</span>
                    <strong>4.91</strong>
                    <small>PR</small>
                  </div>
                  <div>
                    <span>Shuttle</span>
                    <strong>4.32</strong>
                    <small>PR</small>
                  </div>
                  <div>
                    <span>Vertical</span>
                    <strong>31"</strong>
                    <small>PR</small>
                  </div>
                </div>

                <section className="workout-card">
                  <div className="card-title-row">
                    <div>
                      <span>Today</span>
                      <h4>Acceleration Build</h4>
                    </div>
                    <ChevronRight size={18} aria-hidden="true" />
                  </div>
                  <div className="workout-meta">
                    <span>
                      <Timer size={14} aria-hidden="true" />
                      34 min
                    </span>
                    <span>
                      <Flame size={14} aria-hidden="true" />
                      5 day streak
                    </span>
                  </div>
                  <p>Last workout completed yesterday</p>
                </section>

                <section className="history-panel">
                  <div className="card-title-row">
                    <h4>Recent drill history</h4>
                    <span>View all</span>
                  </div>
                  <div className="drill-row">
                    <div>
                      <strong>Flying 10</strong>
                      <span>Turf · 3 reps</span>
                    </div>
                    <b>1.12s</b>
                  </div>
                  <div className="drill-row">
                    <div>
                      <strong>Pro Shuttle</strong>
                      <span>Track · 2 reps</span>
                    </div>
                    <b>4.32s</b>
                  </div>
                </section>

                <section className="test-day-card">
                  <div>
                    <span>Upcoming Official Test Day</span>
                    <strong>Saturday · 9:00 AM</strong>
                  </div>
                  <Medal size={22} aria-hidden="true" />
                </section>

                <nav className="app-tabbar" aria-label="App preview navigation">
                  <span className="active">
                    <Home size={17} aria-hidden="true" />
                    Home
                  </span>
                  <span>
                    <Dumbbell size={17} aria-hidden="true" />
                    Train
                  </span>
                  <span>
                    <Trophy size={17} aria-hidden="true" />
                    PRs
                  </span>
                  <span>
                    <User size={17} aria-hidden="true" />
                    Profile
                  </span>
                </nav>
              </div>
            </div>
          </div>

          <aside className="showcase-panel" aria-label="App preview highlights">
            <span className="status-badge">Home screen preview</span>
            <h3>Training data that feels official.</h3>
            <p>
              A clean dashboard for workout readiness, verified testing, PR history, and athlete
              progress at a glance.
            </p>
            <div className="showcase-metrics">
              <div>
                <Activity size={18} aria-hidden="true" />
                <span>86 Runner Score</span>
              </div>
              <div>
                <CalendarDays size={18} aria-hidden="true" />
                <span>Official Test Day ready</span>
              </div>
              <div>
                <TrendingUp size={18} aria-hidden="true" />
                <span>PRs tracked over time</span>
              </div>
            </div>
          </aside>
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
