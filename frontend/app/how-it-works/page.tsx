'use client';

export default function HowItWorksPage() {
  const steps = [
    {
      number: '01',
      title: 'Check in',
      description:
        'Arrive at a restaurant, cafe, bar, or nightlife spot in Dubai. Open Pulse, find the venue, and tap check in. It takes under 10 seconds.',
    },
    {
      number: '02',
      title: 'Share the vibe',
      description:
        'Tell others how busy it is (dead, moderate, or packed), tag the atmosphere (chill, lively, loud, romantic), and optionally report whether the Burj Khalifa view is clear. Add a photo if you want.',
    },
    {
      number: '03',
      title: 'Discover spots',
      description:
        'Browse live check-ins from the last 2 hours. See exactly what is happening right now at venues near you — not last week\'s reviews, real signals from real people.',
    },
  ];

  const badges = [
    { label: 'Night Owl', desc: 'Check in after midnight 5 times' },
    { label: 'Explorer', desc: 'Visit 10 unique venues' },
    { label: 'First Timer', desc: 'Your first ever check-in' },
    { label: 'Streak Master', desc: 'Check in 7 days in a row' },
  ];

  return (
    <div style={{ background: '#FAFAFA', minHeight: '100vh', color: '#1A1714' }}>
      {/* Header */}
      <header
        style={{
          borderBottom: '1px solid #E2DDD8',
          background: '#FFFFFF',
        }}
      >
        <div
          style={{
            maxWidth: '672px',
            margin: '0 auto',
            padding: '0 24px',
            height: '56px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <a href="/" style={{ textDecoration: 'none', color: '#1A1714' }}>
            <span
              style={{
                fontFamily: "'Space Grotesk', sans-serif",
                fontStyle: 'italic',
                fontWeight: 700,
                fontSize: '20px',
              }}
            >
              Pulse
              <span style={{ color: '#C8FF00' }}>.</span>
            </span>
          </a>
          <a
            href="/"
            style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: '14px',
              color: '#6E6760',
              textDecoration: 'none',
            }}
          >
            ← Back
          </a>
        </div>
      </header>

      {/* Main content */}
      <main
        style={{
          maxWidth: '672px',
          margin: '0 auto',
          padding: '64px 24px 96px',
        }}
      >
        {/* Hero */}
        <div style={{ marginBottom: '56px' }}>
          <p
            style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: '13px',
              fontWeight: 600,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color: '#4E6200',
              background: '#F0FFB3',
              display: 'inline-block',
              padding: '4px 12px',
              borderRadius: '999px',
              marginBottom: '16px',
            }}
          >
            How it works
          </p>
          <h1
            style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontStyle: 'italic',
              fontWeight: 700,
              fontSize: '36px',
              lineHeight: 1.15,
              marginBottom: '16px',
            }}
          >
            Real-time vibes,
            <br />
            not stale reviews.
          </h1>
          <p
            style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: '17px',
              lineHeight: 1.7,
              color: '#6E6760',
            }}
          >
            Pulse is a live signal app for Dubai's nightlife and dining scene. Every check-in is a snapshot of right now — and it disappears in 2 hours.
          </p>
        </div>

        {/* Steps */}
        <div style={{ marginBottom: '56px' }}>
          {steps.map((step, i) => (
            <div
              key={step.number}
              style={{
                display: 'flex',
                gap: '24px',
                marginBottom: i < steps.length - 1 ? '32px' : 0,
              }}
            >
              <div
                style={{
                  flexShrink: 0,
                  width: '52px',
                  height: '52px',
                  borderRadius: '50%',
                  background: '#C8FF00',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontFamily: "'Space Grotesk', sans-serif",
                  fontWeight: 700,
                  fontSize: '15px',
                  color: '#4E6200',
                }}
              >
                {step.number}
              </div>
              <div style={{ paddingTop: '10px' }}>
                <h2
                  style={{
                    fontFamily: "'Space Grotesk', sans-serif",
                    fontStyle: 'italic',
                    fontWeight: 700,
                    fontSize: '20px',
                    marginBottom: '6px',
                  }}
                >
                  {step.title}
                </h2>
                <p
                  style={{
                    fontFamily: "'DM Sans', sans-serif",
                    fontSize: '15px',
                    lineHeight: 1.65,
                    color: '#6E6760',
                    margin: 0,
                  }}
                >
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div style={{ borderTop: '1px solid #E2DDD8', marginBottom: '56px' }} />

        {/* 2-hour expiry */}
        <div style={{ marginBottom: '56px' }}>
          <h2
            style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontStyle: 'italic',
              fontWeight: 700,
              fontSize: '26px',
              marginBottom: '16px',
            }}
          >
            Why check-ins expire in 2 hours
          </h2>
          <p
            style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: '15px',
              lineHeight: 1.7,
              color: '#6E6760',
              marginBottom: '16px',
            }}
          >
            Most review apps show you data from months or even years ago. A restaurant that was packed on a Friday night in January means nothing on a Tuesday in March. Pulse only shows what is happening right now.
          </p>
          <p
            style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: '15px',
              lineHeight: 1.7,
              color: '#6E6760',
              marginBottom: '24px',
            }}
          >
            Every check-in has a 2-hour time-to-live. Once it expires, it disappears from the feed automatically. If a venue has no recent check-ins, we show "No data yet" — because honest silence is better than stale signal.
          </p>
          <div
            style={{
              background: '#F0FFB3',
              borderRadius: '16px',
              padding: '20px 24px',
              display: 'flex',
              gap: '16px',
              alignItems: 'flex-start',
            }}
          >
            <span style={{ fontSize: '22px', flexShrink: 0 }}>⏱</span>
            <p
              style={{
                fontFamily: "'DM Sans', sans-serif",
                fontSize: '14px',
                lineHeight: 1.6,
                color: '#4E6200',
                margin: 0,
                fontWeight: 500,
              }}
            >
              Check-ins auto-expire after 2 hours. The feed always reflects the last 120 minutes — nothing older.
            </p>
          </div>
        </div>

        <div style={{ borderTop: '1px solid #E2DDD8', marginBottom: '56px' }} />

        {/* What you can report */}
        <div style={{ marginBottom: '56px' }}>
          <h2
            style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontStyle: 'italic',
              fontWeight: 700,
              fontSize: '26px',
              marginBottom: '20px',
            }}
          >
            What you report
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            {[
              { title: 'Busy level', tags: ['dead', 'moderate', 'packed'] },
              { title: 'Vibe tags', tags: ['chill', 'lively', 'loud', 'romantic'] },
              { title: 'Burj view', tags: ['clear', 'blocked', 'n/a'] },
              { title: 'Photo', tags: ['optional'] },
            ].map((item) => (
              <div
                key={item.title}
                style={{
                  background: '#F5F4F2',
                  borderRadius: '16px',
                  padding: '16px',
                }}
              >
                <p
                  style={{
                    fontFamily: "'DM Sans', sans-serif",
                    fontSize: '12px',
                    fontWeight: 600,
                    letterSpacing: '0.06em',
                    textTransform: 'uppercase',
                    color: '#AFA89F',
                    marginBottom: '10px',
                  }}
                >
                  {item.title}
                </p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {item.tags.map((tag) => (
                    <span
                      key={tag}
                      style={{
                        fontFamily: "'DM Sans', sans-serif",
                        fontSize: '13px',
                        fontWeight: 500,
                        color: '#1A1714',
                        background: '#FFFFFF',
                        border: '1px solid #E2DDD8',
                        borderRadius: '999px',
                        padding: '3px 10px',
                      }}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ borderTop: '1px solid #E2DDD8', marginBottom: '56px' }} />

        {/* Badges preview */}
        <div style={{ marginBottom: '64px' }}>
          <h2
            style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontStyle: 'italic',
              fontWeight: 700,
              fontSize: '26px',
              marginBottom: '8px',
            }}
          >
            Earn points and badges
          </h2>
          <p
            style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: '15px',
              color: '#6E6760',
              marginBottom: '20px',
              lineHeight: 1.6,
            }}
          >
            Every check-in earns points. Hit milestones and unlock badges.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {badges.map((b) => (
              <div
                key={b.label}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '14px',
                  background: '#FFFFFF',
                  border: '1px solid #E2DDD8',
                  borderRadius: '14px',
                  padding: '14px 18px',
                }}
              >
                <span style={{ fontSize: '20px' }}>🏅</span>
                <div>
                  <p
                    style={{
                      fontFamily: "'DM Sans', sans-serif",
                      fontWeight: 600,
                      fontSize: '14px',
                      margin: 0,
                    }}
                  >
                    {b.label}
                  </p>
                  <p
                    style={{
                      fontFamily: "'DM Sans', sans-serif",
                      fontSize: '13px',
                      color: '#6E6760',
                      margin: 0,
                    }}
                  >
                    {b.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div
          style={{
            background: '#C8FF00',
            borderRadius: '20px',
            padding: '36px 32px',
            textAlign: 'center',
          }}
        >
          <h2
            style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontStyle: 'italic',
              fontWeight: 700,
              fontSize: '24px',
              color: '#1A1714',
              marginBottom: '10px',
            }}
          >
            Ready to join?
          </h2>
          <p
            style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: '15px',
              color: '#4E6200',
              marginBottom: '24px',
            }}
          >
            Pulse is launching in Dubai soon. Get early access.
          </p>
          <a
            href="/"
            style={{
              display: 'inline-block',
              fontFamily: "'DM Sans', sans-serif",
              fontWeight: 600,
              fontSize: '15px',
              background: '#1A1714',
              color: '#C8FF00',
              borderRadius: '999px',
              padding: '12px 28px',
              textDecoration: 'none',
            }}
          >
            Join the waitlist
          </a>
        </div>
      </main>

      {/* Footer */}
      <footer
        style={{
          borderTop: '1px solid #E2DDD8',
          textAlign: 'center',
          padding: '24px',
        }}
      >
        <p
          style={{
            fontFamily: "'DM Sans', sans-serif",
            fontSize: '13px',
            color: '#AFA89F',
          }}
        >
          © 2026 Pulse Dubai
        </p>
      </footer>
    </div>
  );
}
