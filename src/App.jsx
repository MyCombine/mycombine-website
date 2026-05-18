import {
  Activity,
  ArrowRight,
  Bolt,
  CalendarDays,
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
import React, { useState } from "react";

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

function App() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (event) => {
    event.preventDefault();
    setSubmitted(true);
    setEmail("");
  };

  return (
    <main className="site-shell">
      <section className="hero" aria-labelledby="hero-title">
        <div className="nav">
          <a className="brand" href="https://mycombineapp.com" aria-label="My Combine home">
            <span className="app-icon" aria-hidden="true">
              MC
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
            <h1 id="hero-title">Test. Compete. Improve.</h1>
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

          <div className="hero-visual" aria-label="My Combine performance preview">
            <div className="score-card">
              <div>
                <span>Official Test Day</span>
                <strong>Locked</strong>
              </div>
              <Medal size={24} aria-hidden="true" />
            </div>
            <div className="phone-shell">
              <div className="phone-top" />
              <div className="phone-screen">
                <div className="metric-row">
                  <span>40 yd</span>
                  <strong>4.72</strong>
                </div>
                <div className="metric-row">
                  <span>5-10-5</span>
                  <strong>4.28</strong>
                </div>
                <div className="metric-row">
                  <span>Broad</span>
                  <strong>9'8"</strong>
                </div>
                <div className="progress-line">
                  <span />
                </div>
                <p>PR trend</p>
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
              required
            />
            <button className="button button-primary" type="submit">
              Join Waitlist
            </button>
          </div>
          {submitted && <p className="success-message">You're on the list.</p>}
        </form>
      </section>

      <footer className="footer">
        <div>
          <strong>My Combine</strong>
          <span>mycombineapp.com</span>
        </div>
        <nav aria-label="Social links">
          <a href="https://instagram.com/mycombineapp">Instagram: @mycombineapp</a>
          <a href="https://tiktok.com/@mycombineapp">TikTok: @mycombineapp</a>
        </nav>
        <p>© 2026 My Combine. All rights reserved.</p>
      </footer>
    </main>
  );
}

export default App;
