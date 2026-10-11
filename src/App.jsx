import {
  Activity,
  ArrowRight,
  ChartNoAxesCombined,
  Clock3,
  Dumbbell,
  Instagram,
  Mail,
  Timer,
  UsersRound,
} from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
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

const productFeatures = [
  {
    icon: Timer,
    label: "01 / Test",
    title: "Put a number on the work.",
    body: "Record sprint, agility, and explosive efforts in one place.",
  },
  {
    icon: Dumbbell,
    label: "02 / Train",
    title: "Show up with a session.",
    body: "Follow a workout, see the drill lineup, and keep training purposeful.",
  },
  {
    icon: ChartNoAxesCombined,
    label: "03 / Review",
    title: "See what changed.",
    body: "Keep your results and personal records together as you progress.",
  },
];

const appScreenshots = [
  {
    src: "/app-screens/img-8723-active-workout.png?v=8723",
    title: "A workout you can take outside.",
    label: "01 / Train",
    body: "See your current drill, session progress, and setup before each effort.",
    alt: "My Combine active workout screen showing a 10-yard sprint drill and setup diagram.",
  },
  {
    src: "/app-screens/img-8724-training-feedback.png?v=8724",
    title: "Review the rep, then keep moving.",
    label: "02 / Measure",
    body: "Put a result beside your previous effort and your current goal.",
    alt: "My Combine training feedback screen comparing a sprint rep with a goal and session best.",
  },
  {
    src: "/app-screens/img-8725-stat-card.png?v=8725",
    title: "Bring your progress together.",
    label: "03 / Track",
    body: "See the performance picture alongside the marks behind it.",
    alt: "My Combine stat card preview with a Runner Score and sprint, agility, and jump marks.",
  },
];

const founderSteps = [
  {
    number: "01",
    title: "Tell us you're interested",
    body: "Use the form below to join the My Combine waitlist and express interest in the planned Founder offer.",
  },
  {
    number: "02",
    title: "We review interest",
    body: "A waitlist signup is not an approval, reservation, or place in the 200-person group.",
  },
  {
    number: "03",
    title: "Get the final details",
    body: "If an offer is made, its price, benefits, and subscription terms will be provided before any purchase.",
  },
];

const founderFaqs = [
  {
    question: "Does joining reserve one of the 200 places?",
    answer: "No. This form records interest only. Founder participation requires a separate approval and offer.",
  },
  {
    question: "What is the Founder price?",
    answer: "Final pricing has not been confirmed. Approved athletes will see the full price and terms before deciding whether to subscribe.",
  },
  {
    question: "How will approvals work?",
    answer: "The approval process is still being finalized. Waitlist order alone does not guarantee selection.",
  },
  {
    question: "Is joining the waitlist a purchase?",
    answer: "No. Joining the waitlist does not start a subscription or charge you.",
  },
  {
    question: "Can I leave the waitlist?",
    answer: "Yes. Email team@mycombineapp.com to request removal or ask about the information we hold.",
  },
  {
    question: "What if I'm already on the waitlist?",
    answer: "Email team@mycombineapp.com to express Founder interest. Sending the same email through this form does not update an existing waitlist entry.",
  },
];

const homeMeta = {
  title: "My Combine | Test. Compete. Improve.",
  description:
    "Test speed, agility, and explosiveness. Train with structure and track your progress with My Combine. Join the launch waitlist.",
};

const foundersMeta = {
  title: "Founding Athletes | My Combine",
  description:
    "Express interest in My Combine's planned Founding Athlete offer for up to 200 approved people. Joining the waitlist does not reserve a place.",
};

const productMeta = {
  title: "The Product | My Combine",
  description:
    "Explore the My Combine app experience through real workout, training feedback, and performance screens.",
};

const supportMeta = {
  title: "Support | My Combine",
  description:
    "Contact the My Combine team about the waitlist, your account, or the app. Find legal and safety information.",
};

function usePageMeta(title, description, path = "/") {
  useEffect(() => {
    document.title = title;
    const url = `https://www.mycombineapp.com${path === "/" ? "/" : path}`;
    const metadata = [
      ['meta[name="description"]', "name", "description", description],
      ['meta[property="og:title"]', "property", "og:title", title],
      ['meta[property="og:description"]', "property", "og:description", description],
      ['meta[property="og:url"]', "property", "og:url", url],
      ['meta[name="twitter:title"]', "name", "twitter:title", title],
      ['meta[name="twitter:description"]', "name", "twitter:description", description],
    ];

    metadata.forEach(([selector, attribute, name, content]) => {
      let element = document.querySelector(selector);
      if (!element) {
        element = document.createElement("meta");
        element.setAttribute(attribute, name);
        document.head.appendChild(element);
      }
      element.setAttribute("content", content);
    });

    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.setAttribute("rel", "canonical");
      document.head.appendChild(canonical);
    }
    canonical.setAttribute("href", url);
  }, [title, description, path]);
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
  source = "Website",
  duplicateMessage = "You're already on the My Combine waitlist.",
}) {
  const [firstName, setFirstName] = useState("");
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const emailRef = useRef(null);

  useEffect(() => {
    if (errorMessage && !isSubmitting) {
      emailRef.current?.focus();
    }
  }, [errorMessage, isSubmitting]);

  const firstNameId = `${formId}-first-name`;
  const emailId = `${formId}-email`;
  const companyId = `${formId}-company`;
  const helpId = `${formId}-help`;
  const errorId = `${formId}-error`;

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
        source,
        utmSource: getWaitlistUtmSource(),
        company: event.currentTarget.elements.company?.value || "",
      });

      setSuccessMessage(
        result.alreadyRegistered
          ? duplicateMessage
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
    <form className="waitlist-form mc-waitlist-form" onSubmit={handleSubmit} noValidate>
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
      <div className="mc-form-fields">
        <div className="mc-field">
          <label htmlFor={firstNameId}>First name <span>(optional)</span></label>
          <input
            id={firstNameId}
            name="firstName"
            type="text"
            value={firstName}
            onChange={(event) => setFirstName(event.target.value)}
            placeholder="Your first name"
            disabled={isSubmitting || submitted}
            maxLength={80}
            autoComplete="given-name"
          />
        </div>
        <div className="mc-field">
          <label htmlFor={emailId}>Email address <span>(required)</span></label>
          <input
            ref={emailRef}
            id={emailId}
            name="email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="you@example.com"
            disabled={isSubmitting || submitted}
            maxLength={254}
            autoComplete="email"
            aria-invalid={errorMessage === "Enter a valid email address."}
            aria-describedby={`${helpId}${errorMessage ? ` ${errorId}` : ""}`}
            required
          />
        </div>
      </div>
      <p className="mc-form-help" id={helpId}>
        We'll use your email for My Combine launch and early-access updates. Read our{" "}
        <a href="/privacy">Privacy Policy</a>.
      </p>
      <button className="button button-primary mc-submit" type="submit" disabled={isSubmitting || submitted}>
        {isSubmitting ? "Joining..." : submitted ? "Joined" : buttonText}
        {!isSubmitting && !submitted && <ArrowRight size={18} aria-hidden="true" />}
      </button>
      <div className="waitlist-message mc-form-message" aria-live="polite" aria-atomic="true">
        {successMessage && <p className="success-message" role="status">{successMessage}</p>}
        {errorMessage && <p className="error-message" id={errorId} role="alert">{errorMessage}</p>}
      </div>
    </form>
  );
}

function BrandLink() {
  return (
    <a className="brand mc-brand" href="/" aria-label="My Combine home">
      <span className="app-icon" aria-hidden="true">
        <img src="/mycombine-app-face.png" alt="" />
      </span>
      <span className="brand-mark" aria-hidden="true">
        <img className="brand-wordmark" src="/mycombine-primary-logo.png" alt="" />
      </span>
    </a>
  );
}

function MarketingHeader({ current, waitlistHref = "/#waitlist" }) {
  return (
    <header className="mc-header">
      <BrandLink />
      <nav className="mc-primary-nav" aria-label="Primary navigation">
        <a href="/product" aria-current={current === "product" ? "page" : undefined}>Product</a>
        <a href="/founders" aria-current={current === "founders" ? "page" : undefined}>Founding Athletes</a>
        <a href="/support" aria-current={current === "support" ? "page" : undefined}>Support</a>
      </nav>
      <a className="mc-header-cta" href={waitlistHref}>Join waitlist <ArrowRight size={16} aria-hidden="true" /></a>
    </header>
  );
}

function WaitlistSection({ founders = false }) {
  return (
    <section className="mc-waitlist-section" id={founders ? "founder-interest" : "waitlist"} aria-labelledby={founders ? "founder-interest-title" : "waitlist-title"}>
      <div className="mc-waitlist-copy">
        <span className="mc-eyebrow">{founders ? "Founding Athlete interest" : "Early access"}</span>
        <h2 id={founders ? "founder-interest-title" : "waitlist-title"}>{founders ? "Put your name in the conversation." : "Be there from the start."}</h2>
        <p>{founders
          ? "This is an expression of interest only. It does not approve you or reserve one of the planned 200 places."
          : "Get launch and early-access updates as My Combine gets ready for the field."}</p>
      </div>
      <WaitlistForm
        formId={founders ? "founder-interest-form" : "home-waitlist-form"}
        buttonText={founders ? "Join waitlist" : "Join the waitlist"}
        source={founders ? "Website - Founder Interest" : "Website"}
        duplicateMessage={founders
          ? "You're already on the waitlist. Email team@mycombineapp.com to record Founder interest."
          : "You're already on the My Combine waitlist."}
      />
    </section>
  );
}

function LegalHeader() {
  return (
    <header className="nav legal-nav">
      <BrandLink />
      <a className="social-pill" href="/">
        Back to home
      </a>
    </header>
  );
}

function SiteFooter() {
  return (
    <footer className="footer mc-footer">
      <div>
        <img className="footer-logo" src="/mycombine-primary-logo.png" alt="My Combine" />
        <span>mycombineapp.com</span>
      </div>
      <nav className="footer-site" aria-label="Site links">
        <a href="/">Home</a>
        <a href="/product">Product</a>
        <a href="/founders">Founding Athletes</a>
        <a href="/support">Support</a>
      </nav>
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
  usePageMeta(legalDocument.seoTitle, legalDocument.description, `/${legalDocument.slug}`);

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

function ScreenPreview({ screen, className = "" }) {
  return (
    <div className={`mc-screen-preview ${className}`}>
      <img src={screen.src} alt={screen.alt} loading="lazy" />
    </div>
  );
}

function LandingPage() {
  usePageMeta(homeMeta.title, homeMeta.description);

  return (
    <div className="site-shell mc-site">
      <MarketingHeader current="home" />
      <main>
        <section className="mc-home-hero mc-container" aria-labelledby="home-title">
          <div className="mc-home-hero-copy">
            <span className="mc-eyebrow"><Clock3 size={16} aria-hidden="true" /> Coming soon</span>
            <h1 id="home-title" className="mc-home-title"><span>Test.</span><span>Compete.</span><span>Improve.</span></h1>
            <p className="mc-lede">Your combine, wherever you train. Test speed, agility, and explosiveness, then see how your work adds up over time.</p>
            <div className="mc-actions">
              <a className="button button-primary" href="#waitlist">Join the waitlist <ArrowRight size={18} aria-hidden="true" /></a>
              <a className="button button-secondary" href="/product">Explore the product</a>
            </div>
            <p className="mc-hero-note">Structured sessions. Recorded results. A clearer view of progress.</p>
          </div>
          <div className="mc-home-phone" aria-label="My Combine app dashboard preview">
            <img src="/app-screens/img-8722-home-dashboard.png?v=8722" alt="My Combine home screen preview with Runner Score, performance categories, and a daily workout." />
          </div>
        </section>

        <section className="mc-measure-band" aria-labelledby="measure-title">
          <div className="mc-container mc-measure-inner">
            <div>
              <span className="mc-eyebrow">Built around the work</span>
              <h2 id="measure-title">Train with purpose. Measure the change.</h2>
            </div>
            <p>My Combine brings workouts, drill results, and performance history into one athletic training experience.</p>
          </div>
        </section>

        <section className="mc-container mc-feature-section" aria-label="How My Combine helps athletes">
          {productFeatures.map(({ icon: Icon, label, title, body }) => (
            <article className="mc-feature" key={label}>
              <div className="mc-feature-top"><span>{label}</span><Icon size={28} aria-hidden="true" /></div>
              <h3>{title}</h3>
              <p>{body}</p>
            </article>
          ))}
        </section>

        <section className="mc-container mc-home-product" aria-labelledby="home-product-title">
          <div className="mc-home-product-image"><ScreenPreview screen={appScreenshots[0]} /></div>
          <div className="mc-home-product-copy">
            <span className="mc-eyebrow">Inside the app</span>
            <h2 id="home-product-title">The session is right there with you.</h2>
            <p>See the drill, set up your space, and keep the next rep in focus.</p>
            <a className="mc-text-link" href="/product">See the app experience <ArrowRight size={18} aria-hidden="true" /></a>
          </div>
        </section>

        <section className="mc-container mc-founder-teaser" aria-labelledby="founder-teaser-title">
          <div className="mc-founder-teaser-number" aria-hidden="true">200<span>planned limit</span></div>
          <div>
            <span className="mc-eyebrow">Founding Athletes</span>
            <h2 id="founder-teaser-title">For the athletes here early.</h2>
            <p>We're collecting interest in a planned Founding Athlete offer for up to 200 approved people. Joining the waitlist is interest only; it does not reserve a place.</p>
            <a className="mc-text-link" href="/founders">Explore Founding Athletes <ArrowRight size={18} aria-hidden="true" /></a>
          </div>
        </section>

        <div className="mc-container"><WaitlistSection /></div>
      </main>
      <SiteFooter />
    </div>
  );
}

function ProductPage() {
  usePageMeta(productMeta.title, productMeta.description, "/product");

  return (
    <div className="site-shell mc-site">
      <MarketingHeader current="product" />
      <main>
        <section className="mc-container mc-page-hero mc-product-hero" aria-labelledby="product-title">
          <div>
            <span className="mc-eyebrow">The My Combine experience</span>
            <h1 id="product-title">Know where you stand.<br /><em>Know what to work on.</em></h1>
            <p className="mc-lede">A training companion for athletes who want their work and results in the same place.</p>
            <div className="mc-actions">
              <a className="button button-primary" href="/#waitlist">Join the waitlist <ArrowRight size={18} aria-hidden="true" /></a>
            </div>
          </div>
          <ScreenPreview screen={{ src: "/app-screens/img-8722-home-dashboard.png?v=8722", alt: "My Combine dashboard preview with Runner Score and a daily workout." }} className="mc-product-hero-screen" />
        </section>

        <section className="mc-container mc-product-sequence" aria-labelledby="sequence-title">
          <div className="mc-section-heading">
            <span className="mc-eyebrow">A clearer training loop</span>
            <h2 id="sequence-title">From session to result.</h2>
            <p>These screens show the current My Combine app experience. Details may change before launch.</p>
          </div>
          {appScreenshots.map((screen, index) => (
            <article className="mc-product-step" key={screen.label}>
              <div className="mc-product-step-copy">
                <span className="mc-eyebrow">{screen.label}</span>
                <h3>{screen.title}</h3>
                <p>{screen.body}</p>
                <span className="mc-step-count">0{index + 1} / 03</span>
              </div>
              <ScreenPreview screen={screen} />
            </article>
          ))}
        </section>

        <section className="mc-container mc-product-summary" aria-labelledby="product-summary-title">
          <div>
            <span className="mc-eyebrow">Your work, in context</span>
            <h2 id="product-summary-title">Make the next session count.</h2>
          </div>
          <ul>
            <li><Activity size={22} aria-hidden="true" /> Speed, agility, and explosive efforts</li>
            <li><Dumbbell size={22} aria-hidden="true" /> Structured workout sessions</li>
            <li><ChartNoAxesCombined size={22} aria-hidden="true" /> Results and personal records over time</li>
          </ul>
        </section>

        <section className="mc-container mc-simple-cta" aria-labelledby="product-cta-title">
          <h2 id="product-cta-title">Get the launch update.</h2>
          <p>Join the My Combine waitlist for news about early access.</p>
          <a className="button button-primary" href="/#waitlist">Join the waitlist <ArrowRight size={18} aria-hidden="true" /></a>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}

function FoundersPage() {
  usePageMeta(foundersMeta.title, foundersMeta.description, "/founders");

  return (
    <div className="site-shell mc-site">
      <MarketingHeader current="founders" waitlistHref="#founder-interest" />
      <main>
        <section className="mc-container mc-page-hero mc-founders-hero" aria-labelledby="founders-title">
          <div>
            <span className="mc-eyebrow"><UsersRound size={16} aria-hidden="true" /> Planned Founding Athlete offer</span>
            <h1 id="founders-title">A place for the athletes who show up early.</h1>
            <p className="mc-lede">We're gathering interest in a limited Founding Athlete offer for up to <strong>200 approved people</strong>.</p>
            <p className="mc-caveat">Joining the waitlist does not make you a Founder, approve you, or reserve a place.</p>
            <div className="mc-actions">
              <a className="button button-primary" href="#founder-interest">Express interest <ArrowRight size={18} aria-hidden="true" /></a>
              <a className="button button-secondary" href="#how-it-works">How it works</a>
            </div>
          </div>
          <div className="mc-founders-figure" aria-label="Planned limit of up to 200 approved people">
            <span>Up to</span>
            <strong>200</strong>
            <p>approved people<br />planned for the offer</p>
          </div>
        </section>

        <section className="mc-founder-principle" aria-labelledby="founder-principle-title">
          <div className="mc-container">
            <span className="mc-eyebrow">The current plan</span>
            <h2 id="founder-principle-title">Interest first. Details before any decision.</h2>
            <p>The intended offer is an annual Founder rate for approved athletes while an eligible subscription continues. Final pricing, benefits, and purchase terms still need confirmation and will be presented before any purchase.</p>
          </div>
        </section>

        <section className="mc-container mc-founder-process" id="how-it-works" aria-labelledby="founder-process-title">
          <div className="mc-section-heading">
            <span className="mc-eyebrow">How it works</span>
            <h2 id="founder-process-title">Three steps. No implied spot.</h2>
          </div>
          <div className="mc-process-grid">
            {founderSteps.map((step) => (
              <article key={step.number}>
                <span>{step.number}</span>
                <h3>{step.title}</h3>
                <p>{step.body}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="mc-container mc-founder-faq" aria-labelledby="founder-faq-title">
          <div className="mc-section-heading">
            <span className="mc-eyebrow">Good to know</span>
            <h2 id="founder-faq-title">Founding Athlete questions.</h2>
          </div>
          <div className="mc-faq-list">
            {founderFaqs.map((faq) => (
              <details key={faq.question}>
                <summary>{faq.question}</summary>
                <p>{faq.answer}</p>
              </details>
            ))}
          </div>
        </section>

        <div className="mc-container"><WaitlistSection founders /></div>
      </main>
      <SiteFooter />
    </div>
  );
}

function SupportPage() {
  usePageMeta(supportMeta.title, supportMeta.description, "/support");

  return (
    <div className="site-shell mc-site">
      <MarketingHeader current="support" />
      <main>
        <section className="mc-container mc-page-hero mc-support-hero" aria-labelledby="support-title">
          <div>
            <span className="mc-eyebrow"><Mail size={16} aria-hidden="true" /> My Combine support</span>
            <h1 id="support-title">Let's get you to the right place.</h1>
            <p className="mc-lede">Questions about the waitlist, the app, or your account? Reach the My Combine team directly.</p>
            <a className="button button-primary" href="mailto:team@mycombineapp.com">Email the team <ArrowRight size={18} aria-hidden="true" /></a>
          </div>
          <div className="mc-support-address">
            <span>Contact</span>
            <a href="mailto:team@mycombineapp.com">team@mycombineapp.com</a>
            <p>Please do not send passwords or payment details by email.</p>
          </div>
        </section>

        <section className="mc-container mc-support-topics" aria-labelledby="support-topics-title">
          <div className="mc-section-heading">
            <span className="mc-eyebrow">Common questions</span>
            <h2 id="support-topics-title">Start here.</h2>
          </div>
          <div className="mc-faq-list">
            <details><summary>How do I update or remove my waitlist information?</summary><p>Email <a href="mailto:team@mycombineapp.com">team@mycombineapp.com</a> with your request. Please use the email address you joined with if possible.</p></details>
            <details><summary>Does the waitlist guarantee early access or a Founder place?</summary><p>No. It records interest and lets us share launch and early-access updates. Founder participation requires a separate approval and offer.</p></details>
            <details><summary>When will My Combine launch?</summary><p>We have not announced a launch date. Join the waitlist for updates.</p></details>
            <details><summary>Where can I read the legal and safety information?</summary><p>Read the <a href="/terms">Terms of Service</a>, <a href="/privacy">Privacy Policy</a>, <a href="/assumption-of-risk">Assumption of Risk</a>, and <a href="/health-safety">Health & Safety Notice</a>.</p></details>
          </div>
        </section>

        <section className="mc-container mc-support-social" aria-labelledby="support-social-title">
          <div><span className="mc-eyebrow">Keep in touch</span><h2 id="support-social-title">Follow along.</h2></div>
          <div className="mc-social-actions">
            <a href="https://instagram.com/mycombineapp"><Instagram size={19} aria-hidden="true" /> Instagram @mycombineapp</a>
            <a href="https://tiktok.com/@mycombineapp">TikTok @mycombineapp <ArrowRight size={18} aria-hidden="true" /></a>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}

function App() {
  const normalizedPath = window.location.pathname.replace(/\/+$/, "") || "/";

  if (normalizedPath === "/product") {
    return <ProductPage />;
  }

  if (normalizedPath === "/founders") {
    return <FoundersPage />;
  }

  if (normalizedPath === "/support") {
    return <SupportPage />;
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
