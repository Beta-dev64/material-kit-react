import Link from 'next/link';
import Image from 'next/image';
import { PageMotion } from '@/app/components/page-motion';

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

function HeroPortrait() {
  return (
    <div className="hero-portrait-wrap">
      <div aria-hidden="true" className="hero-portrait-ring hero-portrait-ring-one" />
      <div aria-hidden="true" className="hero-portrait-ring hero-portrait-ring-two" />
      <div className="hero-portrait-frame">
        <Image
          alt="A Nigerian finance leader reviewing receivables with her team"
          className="hero-portrait-image"
          fill
          priority
          sizes="(max-width: 600px) 88vw, (max-width: 1024px) 72vw, 44vw"
          src="/images/kredia-hero-finance.png"
        />
        <span aria-hidden="true" className="hero-image-caption">
          PEOPLE FIRST. EVERY BALANCE ACCOUNTED FOR.
        </span>
      </div>
      <div className="hero-note-card">
        <span aria-hidden="true" className="hero-note-mark">
          ↗
        </span>
        <span>
          <small>THE NEXT RIGHT STEP</small>
          <strong>Start with the work that matters.</strong>
        </span>
      </div>
      <span aria-hidden="true" className="hero-caption">
        A human view of healthier receivables.
      </span>
    </div>
  );
}

export function LandingPage() {
  return (
    <main className="landing-page">
      <PageMotion />
      <header className="landing-header" data-reveal>
        <Link aria-label="Kredia home" className="landing-brand" href="/">
          <Image alt="" height={44} priority src="/branding/kredia-logo.png" width={155} />
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
        <div className="landing-hero-copy" data-reveal>
          <span className="landing-eyebrow">
            <i /> RECEIVABLES, IN RHYTHM
          </span>
          <h1 id="landing-title">
            Know what&apos;s owed.
            <br />
            <em>Move it forward.</em>
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
        <div className="landing-hero-visual" data-reveal>
          <HeroPortrait />
        </div>
      </section>

      <section
        aria-label="Kredia product principles"
        className="landing-proof-strip"
        data-reveal
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

      <section aria-labelledby="platform-title" className="landing-section" data-reveal id="platform">
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

      <section aria-labelledby="workflow-title" className="landing-workflow" data-reveal id="how-it-works">
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

      <section aria-label="Start with Kredia" className="landing-final-cta" data-reveal>
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
          <Image alt="" height={40} src="/branding/kredia-logo.png" width={140} />
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
