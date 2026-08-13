import {
  ArrowRight,
  Bolt,
  CheckCircle2,
  Clock3,
  Dumbbell,
  Instagram,
  Medal,
  ShieldCheck,
  TrendingUp,
  UsersRound,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import {
  assumptionOfRiskDocument,
  healthSafetyDocument,
  privacyDocument,
  termsDocument,
} from "./legalContent.js";
import {
  getWaitlistUtmSource,
  isValidWaitlistEmail,
  submitWaitlistSignup,
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

const founderBenefits = [
  "Protected $39.99 annual rate while continuously subscribed",
  "Founding Athlete profile badge/status",
  "Optional Founder #001-#200 identity",
  "Opt-in Founders recognition",
  "Founder/Alumni community role while the community exists",
  "One-time remote preorder/priority opportunity",
];

const foundingSeasonItems = [
  "Founder updates",
  "Early previews / release candidates",
  "Group AMA / office-hour opportunities",
  "Product surveys",
  "Advisory product votes",
  "Targeted feedback opportunities",
  "Founder community access",
  "Recognition for useful feedback",
];

const founderSteps = [
  {
    number: "01",
    title: "Join the waitlist",
    body: "Get on the My Combine early-access list.",
  },
  {
    number: "02",
    title: "Watch for your invite",
    body: "Founding Athlete memberships will be opened in controlled groups as the production app is ready.",
  },
  {
    number: "03",
    title: "Claim a founding membership",
    body: "Eligible invited athletes can activate the $39.99/year Founding Athlete plan while spots remain.",
  },
  {
    number: "04",
    title: "Help shape what comes next",
    body: "Use My Combine, train, test, give feedback and participate in the Founding Season.",
  },
];

const founderFaqs = [
  {
    question: "How many Founding Athletes will there be?",
    answer: "Founding Athlete memberships will be limited to 200.",
  },
  {
    question: "How much does it cost?",
    answer: "$39.99/year.",
  },
  {
    question: "Is there a monthly Founder plan?",
    answer: "No. Founding Athlete pricing is annual-only.",
  },
  {
    question: "How does the protected rate work?",
    answer:
      "The $39.99 annual Founder rate remains protected while the subscription remains continuously active, subject to normal platform billing/grace/recovery behavior.",
  },
  {
    question: "What happens if I cancel?",
    answer:
      "Founder identity/status remains, but the protected subscription price ends and Pro access ends according to the subscription terms.",
  },
  {
    question: "Is Founder Pro different from normal Pro?",
    answer:
      "The core Pro product is the same. Founders receive the protected early-supporter price and Founder identity/community benefits rather than a permanently separate version of My Combine.",
  },
  {
    question: "Does joining the waitlist guarantee a Founder spot?",
    answer:
      "No. Founding Athlete memberships are limited to 200 and will be offered during the controlled Founding Season rollout.",
  },
  {
    question: "Do Founders control product decisions?",
    answer:
      "No. Founder feedback and votes are advisory, but Founding Athletes will have meaningful opportunities to help shape the early product.",
  },
];

const homeMeta = {
  title: "My Combine | Test. Compete. Improve.",
  description:
    "My Combine is a sports performance testing app for speed, agility, explosiveness, and official athlete benchmarking.",
};

const foundersMeta = {
  title: "My Combine Founding Athlete Program",
  description:
    "Join the My Combine Founders Waitlist. 200 Founding Athlete memberships will be available at $39.99/year with a protected early-supporter rate while continuously subscribed.",
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

function WaitlistForm({
  formId = "waitlist-form",
  buttonText = "Join Waitlist",
  joinedText = "Joined",
}) {
  const [firstName, setFirstName] = useState("");
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const firstNameId = `${formId}-first-name`;
  const emailId = `${formId}-email`;
  const companyId = `${formId}-company`;

  const handleSubmit = async (event) => {
    event.preventDefault();
    setErrorMessage("");

    if (submitted) {
      return;
    }

    if (!isValidWaitlistEmail(email)) {
      setErrorMessage("Enter a valid email address.");
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await submitWaitlistSignup({
        firstName,
        email,
        source: "Website",
        utmSource: getWaitlistUtmSource(),
        company: event.currentTarget.elements.company?.value || "",
      });

      setSuccessMessage(
        result.alreadyRegistered
          ? "You're already on the My Combine waitlist."
          : "You're on the list. We'll let you know when My Combine launches.",
      );
      setSubmitted(true);
      setFirstName("");
      setEmail("");
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error("Waitlist submission failed:", error);
      }

      setErrorMessage("We couldn't add you to the waitlist. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form className="waitlist-form" onSubmit={handleSubmit}>
      <label htmlFor={emailId}>Get early access</label>
      <div className="form-honeypot" aria-hidden="true">
        <label htmlFor={companyId}>Company</label>
        <input
          id={companyId}
          name="company"
          type="text"
          tabIndex="-1"
          autoComplete="off"
          disabled={isSubmitting || submitted}
        />
      </div>
      <div className="input-row waitlist-input-row">
        <input
          id={firstNameId}
          type="text"
          value={firstName}
          onChange={(event) => setFirstName(event.target.value)}
          placeholder="First name (optional)"
          aria-label="First name optional"
          disabled={isSubmitting || submitted}
          maxLength={80}
          autoComplete="given-name"
        />
        <input
          id={emailId}
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="Enter your email"
          disabled={isSubmitting || submitted}
          maxLength={254}
          autoComplete="email"
          required
        />
        <button className="button button-primary" type="submit" disabled={isSubmitting || submitted}>
          {isSubmitting ? "Joining..." : submitted ? joinedText : buttonText}
        </button>
      </div>
      <div className="waitlist-message" aria-live="polite">
        {successMessage && <p className="success-message">{successMessage}</p>}
        {errorMessage && <p className="error-message">{errorMessage}</p>}
      </div>
    </form>
  );
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
        <a href="/assumption-of-risk">Assumption of Risk</a>
        <a href="/health-safety">Health & Safety</a>
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
          <div className="nav-actions">
            <a className="nav-link" href="/founders">
              Founders
            </a>
            <a className="social-pill" href="https://instagram.com/mycombineapp">
              <Instagram size={16} aria-hidden="true" />
              @mycombineapp
            </a>
          </div>
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

      <section className="section founders-spotlight" aria-labelledby="founders-spotlight-title">
        <div className="founders-spotlight-copy">
          <span className="section-eyebrow">Founding Athlete Program</span>
          <h2 id="founders-spotlight-title">Be one of the first 200.</h2>
          <p>
            Founding Athletes get full My Combine Pro at a protected early-supporter rate while
            continuously subscribed, plus permanent Founder status and access to the Founding Season.
          </p>
          <div className="founders-spotlight-actions">
            <a className="button button-primary" href="/founders">
              Explore Founding Athletes
              <ArrowRight size={18} aria-hidden="true" />
            </a>
            <a className="button button-secondary" href="#waitlist">
              Join the Waitlist
            </a>
          </div>
        </div>
        <div className="founders-price-lock" aria-label="Founding Athlete pricing">
          <span>Founding Athlete</span>
          <strong>$39.99 / YEAR</strong>
          <p>Standard Pro: $59.99/year</p>
        </div>
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
        <WaitlistForm formId="home-waitlist" />
      </section>

      <SiteFooter />
    </main>
  );
}

function FoundersPage() {
  usePageMeta(foundersMeta.title, foundersMeta.description);

  return (
    <main className="site-shell founders-shell">
      <section className="founders-hero" aria-labelledby="founders-title">
        <div className="nav">
          <a className="brand" href="/" aria-label="My Combine home">
            <span className="app-icon" aria-hidden="true">
              <img src="/mc-runner-logo.png" alt="" />
            </span>
            <span>
              <strong>My Combine</strong>
              <small>TEST. COMPETE. IMPROVE.</small>
            </span>
          </a>
          <div className="nav-actions">
            <a className="nav-link" href="/">
              Home
            </a>
            <a className="social-pill nav-cta" href="#founders-waitlist">
              Join Waitlist
            </a>
          </div>
        </div>

        <div className="founders-hero-grid">
          <div className="founders-hero-copy">
            <span className="status-badge">Founding Athlete Program</span>
            <h1 className="founders-title" id="founders-title">
              The First 200.
            </h1>
            <p className="founders-lede">
              My Combine is opening its first 200 paid memberships to the athletes who are there
              from the beginning.
            </p>
            <div className="founder-rate-block">
              <span>My Combine Pro</span>
              <strong>$39.99 / YEAR</strong>
              <p>Founder rate protected while continuously subscribed.</p>
            </div>
            <div className="hero-actions founders-hero-actions" aria-label="Founding Athlete actions">
              <a className="button button-primary" href="#founders-waitlist">
                Join the Founders Waitlist
                <ArrowRight size={18} aria-hidden="true" />
              </a>
              <a className="button button-secondary" href="#founder-benefits">
                See What Founders Get
              </a>
            </div>
            <p className="founders-clarification">
              Joining the waitlist does not guarantee a Founding Athlete membership. Founding
              Athlete memberships will be limited to 200.
            </p>
          </div>

          <aside className="founding-class-card" aria-label="200 Founding Athletes">
            <span className="class-label">200</span>
            <h2>Founding Athletes</h2>
            <p>One founding group. Built with the athletes who were here first.</p>
            <div className="class-meta">
              <span>Annual-only</span>
              <span>Full Pro</span>
              <span>Founder identity</span>
            </div>
          </aside>
        </div>
      </section>

      <section className="section founders-comparison" aria-labelledby="comparison-title">
        <div className="section-heading">
          <span>Founder price vs Standard Pro</span>
          <h2 id="comparison-title">Same Pro. Early-supporter rate.</h2>
        </div>
        <div className="pricing-grid">
          <article className="pricing-card pricing-card-featured">
            <span className="pricing-eyebrow">Founding Athlete</span>
            <strong>$39.99/year</strong>
            <ul>
              <li>Annual-only</li>
              <li>Full My Combine Pro</li>
              <li>Founder rate protected while continuously subscribed</li>
              <li>Permanent Founder identity/status</li>
            </ul>
          </article>
          <article className="pricing-card">
            <span className="pricing-eyebrow">Standard Pro</span>
            <strong>$59.99/year</strong>
            <p>or $7.99/month</p>
            <ul>
              <li>Full My Combine Pro</li>
              <li>Normal standard pricing</li>
              <li>Same core product experience</li>
            </ul>
          </article>
        </div>
        <div className="comparison-note">
          <p>
            Same Pro. Founders keep the early-supporter rate while they remain continuously
            subscribed.
          </p>
          <span>$20 annual difference</span>
        </div>
      </section>

      <section className="section founder-benefits-section" id="founder-benefits" aria-labelledby="benefits-title">
        <div className="section-heading">
          <span>What Founders keep</span>
          <h2 id="benefits-title">Founding status doesn't disappear.</h2>
        </div>
        <div className="benefits-grid">
          {founderBenefits.map((benefit) => (
            <article className="benefit-card" key={benefit}>
              <CheckCircle2 size={20} aria-hidden="true" />
              <p>{benefit}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="section founding-season-section" aria-labelledby="season-title">
        <div className="season-intro">
          <span className="section-eyebrow">The Founding Season</span>
          <h2 id="season-title">6-8 weeks to help shape what comes next.</h2>
          <p>
            The first Founders will use the real production product, provide feedback, and help
            shape My Combine before broader launch.
          </p>
        </div>
        <div className="season-card">
          <div className="season-duration">
            <Medal size={26} aria-hidden="true" />
            <strong>6-8 weeks</strong>
            <span>Founding Season</span>
          </div>
          <ul className="season-list">
            {foundingSeasonItems.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
        <p className="season-note">
          Founder feedback helps shape My Combine. Final product decisions remain with My Combine.
        </p>
      </section>

      <section className="section how-it-works-section" aria-labelledby="how-it-works-title">
        <div className="section-heading">
          <span>How it works</span>
          <h2 id="how-it-works-title">From waitlist to Founding Season.</h2>
        </div>
        <div className="steps-grid">
          {founderSteps.map((step) => (
            <article className="step-card" key={step.number}>
              <span>{step.number}</span>
              <h3>{step.title}</h3>
              <p>{step.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="section founder-rules-section" aria-labelledby="rules-title">
        <div className="rules-card">
          <div className="rules-heading">
            <ShieldCheck size={28} aria-hidden="true" />
            <div>
              <span className="section-eyebrow">Price protection</span>
              <h2 id="rules-title">Protected while continuously subscribed.</h2>
            </div>
          </div>
          <div className="rules-grid">
            <p>Normal billing retry/grace periods do not immediately remove Founder pricing.</p>
            <p>Platform-supported short billing recovery should preserve the Founder rate.</p>
            <p>Voluntary cancellation ends the protected subscription price.</p>
            <p>A long lapse ends the protected price.</p>
            <p>Founder status/badge remains even if the subscription later ends.</p>
            <p>Pro access ends normally when the paid subscription ends.</p>
            <p>Founder membership/rate cannot be transferred, sold or gifted.</p>
          </div>
        </div>
      </section>

      <section className="section founder-faq-section" aria-labelledby="faq-title">
        <div className="section-heading">
          <span>FAQ</span>
          <h2 id="faq-title">Founding Athlete details.</h2>
        </div>
        <div className="faq-list">
          {founderFaqs.map((faq) => (
            <details key={faq.question}>
              <summary>{faq.question}</summary>
              <p>{faq.answer}</p>
            </details>
          ))}
        </div>
      </section>

      <section className="section waitlist-section founders-waitlist-section" id="founders-waitlist" aria-labelledby="founders-waitlist-title">
        <div>
          <span className="status-badge">
            <UsersRound size={15} aria-hidden="true" />
            Join the Founders Waitlist
          </span>
          <h2 id="founders-waitlist-title">Start with the athletes who were here first.</h2>
          <p>
            This uses the same My Combine waitlist. Joining preserves your early-access signup and
            does not automatically grant Founder status.
          </p>
        </div>
        <WaitlistForm formId="founders-waitlist-form" buttonText="Join Founders Waitlist" />
      </section>

      <SiteFooter />
    </main>
  );
}

function App() {
  const normalizedPath = window.location.pathname.replace(/\/+$/, "") || "/";

  if (normalizedPath === "/founders") {
    return <FoundersPage />;
  }

  if (normalizedPath === "/terms") {
    return <LegalPage legalDocument={termsDocument} />;
  }

  if (normalizedPath === "/privacy") {
    return <LegalPage legalDocument={privacyDocument} />;
  }

  if (normalizedPath === "/assumption-of-risk") {
    return <LegalPage legalDocument={assumptionOfRiskDocument} />;
  }

  if (normalizedPath === "/health-safety") {
    return <LegalPage legalDocument={healthSafetyDocument} />;
  }

  return <LandingPage />;
}

export default App;
