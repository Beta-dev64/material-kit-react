import Image from 'next/image';
import Link from 'next/link';

const features = [
  {
    number: '01',
    title: 'One trusted receivables view',
    description:
      'See open balances, aging, disputes, and unallocated cash from records your team can trace back to the source.',
  },
  {
    number: '02',
    title: 'A clearer next action',
    description:
      'Give collectors a focused queue for overdue accounts, broken promises, and the work that needs attention today.',
  },
  {
    number: '03',
    title: 'Cash applied with care',
    description:
      'Keep receipts unverified until a person confirms them, then allocate funds against the right invoices.',
  },
];

function ArrowIcon() {
  return (
    <svg aria-hidden="true" fill="none" viewBox="0 0 20 20">
      <path
        d="M3.5 10h12m-5-5 5 5-5 5"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.6"
      />
    </svg>
  );
}

function HeroLedgerCard() {
  return (
    <div
      aria-label="Illustration of a receivables dashboard"
      className="landing-ledger-card"
      role="img"
    >
      <div className="ledger-card-top">
        <div>
          <span className="ledger-kicker">RECEIVABLES SNAPSHOT</span>
          <strong>Cash, in context.</strong>
        </div>
        <span className="ledger-live">
          <i /> LEDGER PREVIEW
        </span>
      </div>
      <div className="ledger-value-row">
        <div>
          <span className="ledger-label">Open receivables</span>
          <strong className="ledger-total">₦24,860,500</strong>
          <span className="ledger-change">Across 128 open invoices</span>
        </div>
        <span className="ledger-trend">+8.4%</span>
      </div>
      <div className="ledger-chart">
        <div className="ledger-chart-guides">
          <i />
          <i />
          <i />
        </div>
        <svg aria-hidden="true" preserveAspectRatio="none" viewBox="0 0 470 112">
          <defs>
            <linearGradient id="ledger-fill" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0" stopColor="#62b8a1" stopOpacity=".24" />
              <stop offset="1" stopColor="#62b8a1" stopOpacity="0" />
            </linearGradient>
          </defs>
          <path
            d="M0 82 C28 77 34 50 68 58 S112 75 146 49 S191 62 223 43 S270 52 304 35 S350 57 384 29 S434 36 470 12 V112 H0Z"
            fill="url(#ledger-fill)"
          />
          <path
            d="M0 82 C28 77 34 50 68 58 S112 75 146 49 S191 62 223 43 S270 52 304 35 S350 57 384 29 S434 36 470 12"
            fill="none"
            stroke="#64baa3"
            strokeLinecap="round"
            strokeWidth="3"
          />
        </svg>
      </div>
      <div className="ledger-chart-labels">
        <span>01 JUN</span>
        <span>08 JUN</span>
        <span>15 JUN</span>
        <span>22 JUN</span>
        <span>30 JUN</span>
      </div>
      <div className="ledger-card-footer">
        <div>
          <span className="ledger-dot ledger-dot-teal" />
          <span>Current</span>
          <strong>₦16.2m</strong>
        </div>
        <div>
          <span className="ledger-dot ledger-dot-gold" />
          <span>Past due</span>
          <strong>₦8.6m</strong>
        </div>
      </div>
      <div className="ledger-queue-float">
        <span className="queue-float-icon">↗</span>
        <span>
          <small>COLLECTOR QUEUE</small>
          <strong>12 accounts need a follow-up</strong>
        </span>
        <ArrowIcon />
      </div>
    </div>
  );
}

export function LandingPage() {
  return (
    <main className="landing-page">
      <header className="landing-header">
        <Link aria-label="Kredia home" className="landing-brand" href="/">
          <Image alt="" height={38} priority src="/branding/kredia-logo.png" width={38} />
          <span>Kredia</span>
        </Link>
        <nav aria-label="Main navigation" className="landing-nav">
          <a href="#platform">Platform</a>
          <a href="#how-it-works">How it works</a>
          <a href="#principles">Our approach</a>
        </nav>
        <div className="landing-actions">
          <Link className="landing-signin" href="/auth/sign-in">
            Sign in
          </Link>
          <Link className="button button-primary landing-header-cta" href="/auth/sign-up">
            Get started <ArrowIcon />
          </Link>
        </div>
      </header>

      <section aria-labelledby="landing-title" className="landing-hero">
        <div className="landing-hero-copy">
          <span className="landing-eyebrow">
            <i /> RECEIVABLES, IN RHYTHM
          </span>
          <h1 id="landing-title">
            Know what&apos;s owed.
            <br />
            <em>Know what to do next.</em>
          </h1>
          <p className="landing-subtitle">
            A calmer way to run collections. Bring receivables, payment activity, and follow-up work
            into one clear, accountable workspace.
          </p>
          <div className="landing-hero-actions">
            <Link className="button button-primary landing-primary-cta" href="/auth/sign-up">
              Create your workspace <ArrowIcon />
            </Link>
            <a className="landing-secondary-cta" href="#platform">
              Explore Kredia <span aria-hidden="true">↓</span>
            </a>
          </div>
          <div className="landing-trust-note">
            <span aria-hidden="true" className="trust-check">
              ✓
            </span>
            <span>
              Built for finance teams that value control, clarity, and a clean audit trail.
            </span>
          </div>
        </div>
        <div className="landing-hero-visual">
          <div className="visual-orbit visual-orbit-one" />
          <div className="visual-orbit visual-orbit-two" />
          <HeroLedgerCard />
          <span aria-hidden="true" className="hero-caption">
            A clearer view of every naira in motion.
          </span>
        </div>
      </section>

      <section
        aria-label="Kredia product principles"
        className="landing-proof-strip"
        id="principles"
      >
        <span>OPERATIONAL CONTROL, NOT ANOTHER GENERAL LEDGER</span>
        <div>
          <strong>01</strong> Integer-safe balances
        </div>
        <div>
          <strong>02</strong> Human-confirmed cash
        </div>
        <div>
          <strong>03</strong> Traceable changes
        </div>
      </section>

      <section aria-labelledby="platform-title" className="landing-section" id="platform">
        <div className="landing-section-heading">
          <span className="landing-eyebrow">THE WORK, IN ONE PLACE</span>
          <h2 id="platform-title">
            From open invoice
            <br />
            to clear next step.
          </h2>
          <p>
            Keep the receivables picture grounded in the records behind it, with people in control
            of every financial change.
          </p>
        </div>
        <div className="landing-feature-grid">
          {features.map((feature) => (
            <article className="landing-feature" key={feature.number}>
              <span className="feature-number">{feature.number}</span>
              <div className="feature-mark" aria-hidden="true">
                {feature.number === '01' ? '◫' : feature.number === '02' ? '↗' : '↔'}
              </div>
              <h3>{feature.title}</h3>
              <p>{feature.description}</p>
              <a href="#how-it-works">
                Learn more <ArrowIcon />
              </a>
            </article>
          ))}
        </div>
      </section>

      <section aria-labelledby="workflow-title" className="landing-workflow" id="how-it-works">
        <div className="workflow-copy">
          <span className="landing-eyebrow landing-eyebrow-light">A CONTROLLED FLOW</span>
          <h2 id="workflow-title">
            Every movement
            <br />
            has a reason.
          </h2>
          <p>
            Kredia sits alongside your accounting system as an operational subledger. Reconcile what
            you import, review what needs a decision, and keep the official book of record where it
            belongs.
          </p>
          <Link href="/auth/sign-up">
            See your receivables clearly <ArrowIcon />
          </Link>
        </div>
        <div className="workflow-steps">
          <div className="workflow-step">
            <span>01</span>
            <div>
              <strong>Bring in the picture</strong>
              <p>Import customers and open invoices with a declared cutoff.</p>
            </div>
            <i>↓</i>
          </div>
          <div className="workflow-step">
            <span>02</span>
            <div>
              <strong>Reconcile with confidence</strong>
              <p>Compare the imported ledger against your control total.</p>
            </div>
            <i>↓</i>
          </div>
          <div className="workflow-step">
            <span>03</span>
            <div>
              <strong>Move work forward</strong>
              <p>Prioritize follow-ups and review cash before it changes balances.</p>
            </div>
            <i>✓</i>
          </div>
        </div>
      </section>

      <section aria-label="Start with Kredia" className="landing-final-cta">
        <div>
          <span className="landing-eyebrow">MAKE THE NEXT STEP CLEAR</span>
          <h2>Receivables deserve a better rhythm.</h2>
        </div>
        <Link className="button button-primary landing-primary-cta" href="/auth/sign-up">
          Start with Kredia <ArrowIcon />
        </Link>
      </section>
      <footer className="landing-footer">
        <Link aria-label="Kredia home" className="landing-brand" href="/">
          <Image alt="" height={30} src="/branding/kredia-logo.png" width={30} />
          <span>Kredia</span>
        </Link>
        <span>Receivables, in rhythm.</span>
        <div>
          <Link href="/auth/sign-in">Sign in</Link>
          <Link href="/auth/sign-up">Create account</Link>
        </div>
      </footer>
    </main>
  );
}
