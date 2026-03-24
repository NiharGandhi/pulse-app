'use client';

export default function TermsPage() {
  const sections = [
    {
      title: 'Use of service',
      items: [
        {
          heading: 'Age requirement',
          text: 'You must be at least 18 years old to use Pulse. By creating an account, you confirm that you meet this requirement.',
        },
        {
          heading: 'Dubai focus',
          text: 'Pulse is designed for use in Dubai. While you may be able to access it from elsewhere, the venue data, vibe signals, and community are built around Dubai\'s dining and nightlife scene.',
        },
        {
          heading: 'Account responsibility',
          text: 'You are responsible for maintaining the security of your account. Do not share your login credentials. Notify us immediately if you suspect unauthorised access.',
        },
      ],
    },
    {
      title: 'Check-in rules',
      items: [
        {
          heading: 'Honest reporting',
          text: 'Check-ins must reflect your genuine experience at the venue at the time of submission. Do not report a vibe you did not personally observe.',
        },
        {
          heading: 'No spam',
          text: 'You may only submit one check-in per venue per hour. Bulk check-ins, automated submissions, or any attempt to game the points system will result in account suspension.',
        },
        {
          heading: 'No harmful content',
          text: 'Photos uploaded with check-ins must not contain nudity, violence, hate speech, or any content that violates applicable law. We reserve the right to remove any content without notice.',
        },
      ],
    },
    {
      title: 'Your content',
      items: [
        {
          heading: 'You own your check-ins',
          text: 'You retain ownership of the content you submit — vibe tags, photos, and reports. By submitting, you grant Pulse a non-exclusive, royalty-free licence to display and use that content to operate the service.',
        },
        {
          heading: 'Anonymous display',
          text: 'If you check in anonymously, your username will not be shown publicly, but the vibe data (busy level, atmosphere tags) will still appear on the feed. This is the core function of the service.',
        },
        {
          heading: 'Content removal',
          text: 'You can delete your own check-ins at any time from your profile. Check-ins also expire automatically after 2 hours.',
        },
      ],
    },
    {
      title: 'Prohibited conduct',
      items: [
        {
          heading: 'Misuse',
          text: 'Do not use Pulse to harass, defame, or impersonate others. Do not attempt to scrape, reverse-engineer, or interfere with the service.',
        },
        {
          heading: 'False information',
          text: 'Do not submit check-ins for venues you are not physically present at. Do not deliberately misrepresent a venue\'s vibe to influence others.',
        },
        {
          heading: 'Venue manipulation',
          text: 'Do not use Pulse to promote or damage a specific venue artificially — for example, coordinating bulk positive or negative check-ins.',
        },
      ],
    },
    {
      title: 'Limitation of liability',
      items: [
        {
          heading: 'No warranties',
          text: "Pulse is provided 'as is'. We don't guarantee that check-in data is accurate, complete, or up to date. Venue information sourced from Google Places may not reflect actual conditions.",
        },
        {
          heading: 'Decisions you make',
          text: 'Pulse is a discovery tool. Any decisions you make based on vibe data — including where to go, what to eat, or how to spend your time — are your own responsibility.',
        },
        {
          heading: 'Service availability',
          text: 'We do not guarantee uninterrupted access to Pulse. We may suspend or discontinue the service at any time, with or without notice.',
        },
      ],
    },
    {
      title: 'Changes to these terms',
      items: [
        {
          heading: 'Updates',
          text: 'We may update these terms from time to time. If we make material changes, we will notify you by email or via the app. Continued use of Pulse after changes take effect constitutes your acceptance of the new terms.',
        },
        {
          heading: 'Governing law',
          text: 'These terms are governed by the laws of the United Arab Emirates. Any disputes will be subject to the jurisdiction of the courts of Dubai.',
        },
      ],
    },
  ];

  return (
    <div style={{ background: '#FAFAFA', minHeight: '100vh', color: '#1A1714' }}>
      {/* Header */}
      <header style={{ borderBottom: '1px solid #E2DDD8', background: '#FFFFFF' }}>
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
              Pulse<span style={{ color: '#C8FF00' }}>.</span>
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

      <main style={{ maxWidth: '672px', margin: '0 auto', padding: '64px 24px 96px' }}>
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
            Legal
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
            Terms of Service
          </h1>
          <p
            style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: '15px',
              lineHeight: 1.7,
              color: '#6E6760',
            }}
          >
            Last updated: March 2026. These terms govern your use of Pulse. Please read them. They're written to be clear, not to trap you.
          </p>
        </div>

        {/* Sections */}
        {sections.map((section, i) => (
          <div key={section.title}>
            {i > 0 && <div style={{ borderTop: '1px solid #E2DDD8', marginBottom: '48px' }} />}
            <div style={{ marginBottom: '48px' }}>
              <h2
                style={{
                  fontFamily: "'Space Grotesk', sans-serif",
                  fontStyle: 'italic',
                  fontWeight: 700,
                  fontSize: '22px',
                  marginBottom: '24px',
                }}
              >
                {section.title}
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {section.items.map((item) => (
                  <div key={item.heading}>
                    <p
                      style={{
                        fontFamily: "'DM Sans', sans-serif",
                        fontWeight: 700,
                        fontSize: '14px',
                        marginBottom: '6px',
                        color: '#1A1714',
                      }}
                    >
                      {item.heading}
                    </p>
                    <p
                      style={{
                        fontFamily: "'DM Sans', sans-serif",
                        fontSize: '15px',
                        lineHeight: 1.7,
                        color: '#6E6760',
                        margin: 0,
                      }}
                    >
                      {item.text}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}

        <div style={{ borderTop: '1px solid #E2DDD8', marginBottom: '48px' }} />

        {/* Contact */}
        <div>
          <h2
            style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontStyle: 'italic',
              fontWeight: 700,
              fontSize: '22px',
              marginBottom: '16px',
            }}
          >
            Contact
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
            Questions about these terms? Get in touch:
          </p>
          <div
            style={{
              background: '#F0FFB3',
              borderRadius: '14px',
              padding: '18px 22px',
              display: 'inline-block',
            }}
          >
            <a
              href="mailto:hello@pulse.app"
              style={{
                fontFamily: "'DM Sans', sans-serif",
                fontWeight: 600,
                fontSize: '15px',
                color: '#4E6200',
                textDecoration: 'none',
              }}
            >
              hello@pulse.app
            </a>
          </div>
        </div>
      </main>

      <footer style={{ borderTop: '1px solid #E2DDD8', textAlign: 'center', padding: '24px' }}>
        <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '13px', color: '#AFA89F' }}>
          © 2026 Pulse Dubai
        </p>
      </footer>
    </div>
  );
}
