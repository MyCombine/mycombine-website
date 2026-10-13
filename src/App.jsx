import {
  Activity,
  ArrowRight,
  ChartNoAxesCombined,
  Clock3,
  Dumbbell,
  Instagram,
  Mail,
  Pause,
  Play,
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
  hasRecordedMarketingRequest,
  isValidWaitlistEmail,
  MARKETING_PURPOSE_TEXT,
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

const runnerScorePreview = {
  src: "/app-screens/runner-score-iphone.png",
  alt: "My Combine Runner Score screen in an iPhone frame, showing a score of 65 and sprint, shuttle, and jump results.",
};

const performanceHubPreview = {
  src: "/app-screens/performance-hub-iphone.png",
  alt: "My Combine Performance Hub screen in an iPhone frame, showing tracked sprint results and drill scores.",
};

const officialTestDayPreview = {
  src: "/app-screens/official-test-day-iphone.png",
  alt: "My Combine Official Test Day screen in an iPhone frame, showing five included drills and test-day information.",
};

const founderSteps = [
  {
    number: "01",
    title: "Tell us you're interested",
    body: "Use the form below to join the My Combine waitlist and express interest in the planned Founder offer.",
  },
  {
    number: "02",
    title: "Interest only for now",
    body: "Founder approvals are not open yet. A waitlist signup is not an approval, reservation, or place in the planned group.",
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
    "Express interest in My Combine's planned Founding Athlete program. Joining the waitlist does not approve you or reserve a place.",
};

const productMeta = {
  title: "The Product | My Combine",
  description:
    "Preview My Combine Runner Score, Official Test Day, and Performance Hub screens. Features may change before launch.",
};

const remoteMeta = {
  title: "My Combine Remote | Coming Soon",
  description:
    "Meet the My Combine Remote, a planned app companion for a more hands-on timing experience. Coming soon.",
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
  purposeText = "Joining records your interest in My Combine. You can separately request email updates, subject to address verification.",
  newSignupMessage = "You're on the My Combine waitlist.",
  duplicateMessage = "You're already on the My Combine waitlist.",
}) {
  const [firstName, setFirstName] = useState("");
  const [email, setEmail] = useState("");
  const [marketingUpdates, setMarketingUpdates] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [marketingMessage, setMarketingMessage] = useState("");
  const [marketingWarning, setMarketingWarning] = useState("");
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
  const marketingId = `${formId}-marketing`;

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
        marketingUpdates,
      });

      setSuccessMessage(
        result.alreadyRegistered
          ? duplicateMessage
          : newSignupMessage,
      );
      if (marketingUpdates) {
        if (result.alreadyRegistered) {
          setMarketingWarning("Your email-update request was not recorded for this existing signup. Contact team@mycombineapp.com to ask about updates.");
        } else if (hasRecordedMarketingRequest(result)) {
          setMarketingMessage("Your email-update request was recorded and is pending address verification. You are not enrolled in updates yet.");
        } else {
          setMarketingWarning("You're on the waitlist, but your email-update request was not recorded. Contact team@mycombineapp.com if you want updates.");
        }
      }
      setSubmitted(true);
      setFirstName("");
      setEmail("");
      setMarketingUpdates(false);
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
      <label className="mc-marketing-choice" htmlFor={marketingId}>
        <input
          id={marketingId}
          name="marketingUpdates"
          type="checkbox"
          checked={marketingUpdates}
          onChange={(event) => setMarketingUpdates(event.target.checked)}
          disabled={isSubmitting || submitted}
        />
        <span>{MARKETING_PURPOSE_TEXT}</span>
      </label>
      <p className="mc-form-help" id={helpId}>
        {purposeText} We record your signup source and any campaign source in the link.
        Existing signups cannot change an email-update preference through this form.
        To stop updates or request removal, email{" "}
        <a href="mailto:team@mycombineapp.com">team@mycombineapp.com</a>.
        Read our <a href="/privacy">Privacy Policy</a>.
      </p>
      <button className="button button-primary mc-submit" type="submit" disabled={isSubmitting || submitted}>
        {isSubmitting ? "Joining..." : submitted ? "Joined" : buttonText}
        {!isSubmitting && !submitted && <ArrowRight size={18} aria-hidden="true" />}
      </button>
      <div className="waitlist-message mc-form-message">
        {isSubmitting && <p role="status">Joining the waitlist...</p>}
        {successMessage && <p className="success-message" role="status">{successMessage}</p>}
        {marketingMessage && <p className="success-message" role="status">{marketingMessage}</p>}
        {marketingWarning && <p className="error-message" role="alert">{marketingWarning}</p>}
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
        <a href="/remote" aria-current={current === "remote" ? "page" : undefined}>Remote</a>
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
          : "Join the My Combine interest list. Email updates are optional."}</p>
      </div>
      <WaitlistForm
        formId={founders ? "founder-interest-form" : "home-waitlist-form"}
        buttonText={founders ? "Express interest" : "Join the waitlist"}
        source={founders ? "Website - Founder Interest" : "Website"}
        purposeText={founders
          ? "For new signups, we'll record your Founder interest. This does not approve you or reserve a place. You can separately request email updates, subject to address verification."
          : undefined}
        newSignupMessage={founders
          ? "You're on the waitlist. Your Founding Athlete interest was recorded; this is not approval or a reserved place."
          : undefined}
        duplicateMessage={founders
          ? <>You're already on the waitlist. <a href="mailto:team@mycombineapp.com">Email the team</a> to express Founder interest.</>
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
        <a href="/remote">Remote</a>
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
        <a href="/THIRD_PARTY_NOTICES.txt">Third-party notices</a>
        <a href="mailto:team@mycombineapp.com">Contact</a>
      </nav>
      <p>© 2026 My Combine. All rights reserved.</p>
    </footer>
  );
}

function LegalPage({ legalDocument }) {
  usePageMeta(legalDocument.seoTitle, legalDocument.description, `/${legalDocument.slug}`);

  return (
    <div className="site-shell legal-shell">
      <LegalHeader />
      <main id="main-content">
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
      </main>
      <SiteFooter />
    </div>
  );
}

function ScreenPreview({ screen, className = "" }) {
  return (
    <div className={`mc-screen-preview ${className}`}>
      <img src={screen.src} alt={screen.alt} loading="lazy" />
    </div>
  );
}

function RemoteVideo() {
  const containerRef = useRef(null);
  const videoRef = useRef(null);
  const [inView, setInView] = useState(false);
  const [shouldLoad, setShouldLoad] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [manualPlay, setManualPlay] = useState(false);
  const [manualPause, setManualPause] = useState(false);
  const [videoError, setVideoError] = useState(false);
  const [pageVisible, setPageVisible] = useState(() => !document.hidden);
  const [reducedMotion, setReducedMotion] = useState(
    () => window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  );

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updateMotion = () => setReducedMotion(media.matches);
    media.addEventListener("change", updateMotion);
    return () => media.removeEventListener("change", updateMotion);
  }, []);

  useEffect(() => {
    const updateVisibility = () => setPageVisible(!document.hidden);
    document.addEventListener("visibilitychange", updateVisibility);
    return () => document.removeEventListener("visibilitychange", updateVisibility);
  }, []);

  useEffect(() => {
    const element = containerRef.current;
    if (!element) return undefined;
    if (!("IntersectionObserver" in window)) {
      setInView(true);
      setShouldLoad(true);
      return undefined;
    }

    const observer = new IntersectionObserver(([entry]) => {
      setInView(entry.isIntersecting);
      if (entry.isIntersecting) setShouldLoad(true);
    }, { rootMargin: "160px 0px", threshold: 0.01 });
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !shouldLoad || videoError) return undefined;
    const wantsPlayback = inView && pageVisible && (manualPlay || (!manualPause && !reducedMotion));
    if (!wantsPlayback) {
      video.pause();
      return undefined;
    }

    let active = true;
    video.play().then(() => {
      if (active) setPlaying(true);
    }).catch(() => {
      if (active) setPlaying(false);
    });
    return () => { active = false; };
  }, [inView, manualPause, manualPlay, pageVisible, reducedMotion, shouldLoad, videoError]);

  const togglePlayback = () => {
    if (playing) {
      setManualPause(true);
      setManualPlay(false);
      videoRef.current?.pause();
    } else {
      setShouldLoad(true);
      setManualPause(false);
      setManualPlay(true);
    }
  };

  return (
    <div className="mc-remote-video" ref={containerRef}>
      {videoError ? (
        <img
          className="mc-remote-video-fallback"
          src="/remote/remote-gentle-tilt-poster.png"
          alt="My Combine Remote: black handheld device with a green side button and indicator lights."
        />
      ) : (
        <video
          ref={videoRef}
          aria-label="My Combine Remote rotating gently on a black background"
          muted
          loop
          playsInline
          preload="none"
          poster="/remote/remote-gentle-tilt-poster.png"
          src={shouldLoad ? "/remote/remote-gentle-tilt-loop.mp4" : undefined}
          onError={() => setVideoError(true)}
          onPlay={() => setPlaying(true)}
          onPause={() => setPlaying(false)}
        >
          <a href="/remote/remote-gentle-tilt-loop.mp4">View the My Combine Remote video</a>
        </video>
      )}
      {!videoError && (
        <button
          className="mc-remote-video-control"
          type="button"
          onClick={togglePlayback}
          aria-label={playing ? "Pause Remote video" : "Play Remote video"}
          aria-pressed={playing}
        >
          {playing ? <Pause size={18} aria-hidden="true" /> : <Play size={18} aria-hidden="true" />}
          <span>{playing ? "Pause" : "Play"}</span>
        </button>
      )}
      {videoError && <p className="mc-remote-video-error">Video unavailable. The still image shows the Remote.</p>}
    </div>
  );
}

function LandingPage() {
  usePageMeta(homeMeta.title, homeMeta.description);

  return (
    <div className="site-shell mc-site">
      <MarketingHeader current="home" />
      <main id="main-content">
        <section className="mc-home-hero mc-container" aria-labelledby="home-title">
          <div className="mc-home-hero-copy">
            <span className="mc-eyebrow"><Clock3 size={16} aria-hidden="true" /> Coming soon</span>
            <h1 id="home-title" className="mc-home-title"><span>Test.</span><span>Compete.</span><span>Improve.</span></h1>
            <p className="mc-lede">Your combine, wherever you train. Test speed, agility, and explosiveness, then see how your work adds up over time.</p>
            <div className="mc-actions">
              <a className="button button-primary" href="#waitlist">Join the waitlist <ArrowRight size={18} aria-hidden="true" /></a>
              <a className="button button-secondary" href="/remote">See Remote <ArrowRight size={18} aria-hidden="true" /></a>
            </div>
            <p className="mc-hero-note">Structured sessions. Recorded results. A clearer view of progress.</p>
          </div>
          <div className="mc-home-phone">
            <img src={runnerScorePreview.src} alt={runnerScorePreview.alt} fetchPriority="high" />
          </div>
        </section>

        <section className="mc-remote-teaser" aria-labelledby="remote-teaser-title">
          <div className="mc-container mc-remote-teaser-inner">
            <div className="mc-remote-teaser-copy">
              <span className="mc-eyebrow">My Combine Remote / Coming Soon</span>
              <h2 id="remote-teaser-title">Less phone.<br />More rep.</h2>
              <p>We're developing an app-connected Remote for a more focused, hands-on timing experience.</p>
              <a className="button button-primary" href="/remote">See Remote <ArrowRight size={18} aria-hidden="true" /></a>
            </div>
            <img
              className="mc-remote-teaser-image"
              src="/remote/remote-web-poster.png"
              alt="My Combine Remote on a black background, with a green side button and indicator lights."
              loading="lazy"
              decoding="async"
            />
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

        <section className="mc-container mc-feature-section" aria-labelledby="home-features-title">
          <h2 className="visually-hidden" id="home-features-title">How My Combine helps athletes</h2>
          {productFeatures.map(({ icon: Icon, label, title, body }) => (
            <article className="mc-feature" key={label}>
              <div className="mc-feature-top"><span>{label}</span><Icon size={28} aria-hidden="true" /></div>
              <h3>{title}</h3>
              <p>{body}</p>
            </article>
          ))}
        </section>

        <section className="mc-container mc-home-product" aria-labelledby="home-product-title">
          <div className="mc-home-product-image"><ScreenPreview screen={performanceHubPreview} /></div>
          <div className="mc-home-product-copy">
            <span className="mc-eyebrow">Performance Hub</span>
            <h2 id="home-product-title">See your work in context.</h2>
            <p>Review tracked drills, official results, and scores in one place.</p>
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
      <main id="main-content">
        <section className="mc-container mc-page-hero mc-product-hero" aria-labelledby="product-title">
          <div>
            <span className="mc-eyebrow">The My Combine experience</span>
            <h1 id="product-title">Know where you stand.<br /><em>Know what to work on.</em></h1>
            <p className="mc-lede">A training companion for athletes who want their work and results in the same place.</p>
            <div className="mc-actions">
              <a className="button button-primary" href="/#waitlist">Join the waitlist <ArrowRight size={18} aria-hidden="true" /></a>
            </div>
          </div>
          <ScreenPreview screen={runnerScorePreview} className="mc-product-hero-screen" />
        </section>

        <section className="mc-container mc-product-sequence" aria-labelledby="sequence-title">
          <div className="mc-section-heading">
            <span className="mc-eyebrow">Inside the app</span>
            <h2 id="sequence-title">Test. Then review.</h2>
            <p>These supplied app screens show the current direction. Features may change before launch.</p>
          </div>
          <article className="mc-product-step">
            <div className="mc-product-step-copy">
              <span className="mc-eyebrow">Official Test Day</span>
              <h3>Know the test-day lineup.</h3>
              <p>See the included drills and assessment details before you begin.</p>
            </div>
            <ScreenPreview screen={officialTestDayPreview} />
          </article>
          <article className="mc-product-step">
            <div className="mc-product-step-copy">
              <span className="mc-eyebrow">Performance Hub</span>
              <h3>Review every mark.</h3>
              <p>Find tracked sprint results and drill scores together in one view.</p>
            </div>
            <ScreenPreview screen={performanceHubPreview} />
          </article>
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
          <h2 id="product-cta-title">Keep an eye on the launch.</h2>
          <p>Join the My Combine interest list. Choose separately whether to receive email updates.</p>
          <a className="button button-primary" href="/#waitlist">Join the waitlist <ArrowRight size={18} aria-hidden="true" /></a>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}

function RemotePage() {
  usePageMeta(remoteMeta.title, remoteMeta.description, "/remote");

  return (
    <div className="site-shell mc-site">
      <MarketingHeader current="remote" />
      <main id="main-content">
        <section className="mc-remote-hero" aria-labelledby="remote-title">
          <div className="mc-container mc-remote-hero-inner">
            <span className="mc-eyebrow">Coming Soon / In Development</span>
            <h1 id="remote-title">My Combine<br /><span>Remote.</span></h1>
            <p>Beyond the workout plan: a more focused, hands-on timing experience. We're developing a Remote to work with the My Combine app, so the phone can stay out of your hands during more of the rep.</p>
            <a className="button button-primary" href="#remote-preview">See Remote <ArrowRight size={18} aria-hidden="true" /></a>
          </div>
        </section>

        <div className="mc-remote-status" aria-label="Remote development status">
          <div className="mc-container">
            <span>01 / App companion</span>
            <span>02 / Remote-assisted timing</span>
            <span>03 / Coming soon</span>
          </div>
        </div>

        <section className="mc-container mc-remote-preview" id="remote-preview" aria-labelledby="remote-preview-title">
          <div className="mc-remote-preview-copy">
            <span className="mc-eyebrow">The next part of the training experience</span>
            <h2 id="remote-preview-title">Stay with<br />the attempt.</h2>
            <p>The intended workflow is simple: set up a session in the app, use a physical control during the effort, then review the result in My Combine. Fewer moments handling the phone. More attention on the work.</p>
            <p className="mc-remote-disclaimer">In development. Hardware, interaction, and app integration may change before release.</p>
          </div>
          <figure className="mc-remote-preview-media">
            <RemoteVideo />
            <figcaption>My Combine Remote / Motion preview</figcaption>
          </figure>
        </section>

        <section className="mc-remote-workflow" aria-labelledby="remote-workflow-title">
          <div className="mc-container">
            <div className="mc-remote-workflow-heading">
              <span className="mc-eyebrow">Planned experience</span>
              <h2 id="remote-workflow-title">Built around the rep.</h2>
              <p>The Remote is being developed as a companion to the app, not a standalone timing system.</p>
            </div>
            <div className="mc-remote-workflow-steps">
              <div><span>01</span><h3>Set up in the app</h3><p>Choose the drill and timing setup in My Combine.</p></div>
              <div><span>02</span><h3>Stay in position</h3><p>Use a tactile control instead of reaching for the phone mid-effort.</p></div>
              <div><span>03</span><h3>Review the effort</h3><p>Return to the app to review the result with your training.</p></div>
            </div>
          </div>
        </section>

        <section className="mc-container mc-remote-close" aria-labelledby="remote-close-title">
          <span className="mc-eyebrow">Coming Soon</span>
          <h2 id="remote-close-title">A new way to stay in the moment.</h2>
          <p>Availability and final specifications have not been announced. The My Combine app remains the center of the experience.</p>
          <a className="mc-text-link" href="/product">Explore the app <ArrowRight size={18} aria-hidden="true" /></a>
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
      <main id="main-content">
        <section className="mc-container mc-page-hero mc-founders-hero" aria-labelledby="founders-title">
          <div>
            <span className="mc-eyebrow"><UsersRound size={16} aria-hidden="true" /> Planned Founding Athlete offer</span>
            <h1 id="founders-title">For the athletes who show up early.</h1>
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
            <p>For the first release, we're collecting interest only. Any future Founder offer depends on confirmed pricing, benefits, and subscription terms; those details will be presented before anyone can decide whether to purchase.</p>
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
      <main id="main-content">
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
            <details><summary>Does the waitlist guarantee early access or a Founder place?</summary><p>No. It records interest only. Email updates require a separate choice, and Founder participation requires a separate approval and offer.</p></details>
            <details><summary>When will My Combine launch?</summary><p>We have not announced a launch date. You can opt in to email updates when joining the waitlist.</p></details>
            <details><summary>How do I manage or cancel a subscription purchased through Apple?</summary><p>If you purchased a subscription through the App Store, follow <a href="https://support.apple.com/en-us/118428">Apple's subscription instructions</a> to manage or cancel it. Joining the waitlist or expressing Founder interest is not a purchase or a subscription.</p></details>
            <details><summary>How do I request a refund for an App Store purchase?</summary><p>For a purchase billed by Apple, follow <a href="https://support.apple.com/en-us/118223">Apple's refund request instructions</a>. Apple reviews refund requests under its policies; submitting a request does not guarantee a refund.</p></details>
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

function RoutePage() {
  const normalizedPath = window.location.pathname.replace(/\/+$/, "") || "/";

  if (normalizedPath === "/product") {
    return <ProductPage />;
  }

  if (normalizedPath === "/remote") {
    return <RemotePage />;
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

function App() {
  return (
    <>
      <a className="skip-link" href="#main-content">Skip to main content</a>
      <RoutePage />
    </>
  );
}

export default App;
