'use client';

export default function PrivacyPage() {
  const sections = [
    {
      title: 'What we collect',
      content: [
        {
          subtitle: 'Account information',
          text: 'When you sign up, we collect your email address and, if you sign in with Google, your name and profile photo. We use Clerk for authentication and do not store your password.',
        },
        {
          subtitle: 'Check-in data',
          text: 'When you submit a check-in, we store the venue, busy level, vibe tags, view status, timestamp, and — if you choose to add one — a photo. If you check in anonymously, your username is never shown publicly, but the check-in data itself (vibe, busy level) is still displayed.',
        },
        {
          subtitle: 'Location',
          text: 'We request your approximate location to show nearby venues and to surface relevant results. Location data is used in the moment and is not stored against your account history.',
        },
        {
          subtitle: 'Usage data',
          text: 'We collect basic usage logs (page views, API requests) to keep the service running and to diagnose errors. We do not build behavioral profiles from this data.',
        },
      ],
    },
    {
      title: 'How we use it',
      content: [
        {
          subtitle: 'Displaying live vibes',
          text: 'Your check-ins are shown on the Pulse feed and venue pages for up to 2 hours after submission. After that, they expire automatically and are no longer visible to other users.',
        },
        {
          subtitle: 'Improving AI search',
          text: 'Aggregated, anonymised check-in data is used to improve the accuracy of our AI vibe search. We do not use your individual check-ins to train external AI models.',
        },
        {
          subtitle: 'Points and leaderboard',
          text: 'Your username and point total may appear on the public leaderboard if you opt in. You can choose to remain anonymous at any time from your profile settings.',
        },
        {
          subtitle: 'Service communications',
          text: 'We may email you about important updates to Pulse — new features, terms changes, or security notices. We do not send marketing emails without your explicit opt-in.',
        },
      ],
    },
    {
      title: 'What we do not do',
      content: [
        {
          subtitle: 'We do not sell your data',
          text: 'We have never sold personal data to third parties and do not intend to. Your information is used solely to operate and improve Pulse.',
        },
        {
          subtitle: 'We do not share with advertisers',
          text: 'Pulse does not display third-party advertising and does not share your data with ad networks, data brokers, or marketing platforms.',
        },
        {
          subtitle: 'We do not profile you',
          text: 'We do not build interest profiles, segment you for targeting, or infer sensitive attributes from your usage.',
        },
      ],
    },
    {
      title: 'Data retention',
      content: [
        {
          subtitle: 'Check-ins',
          text: 'Individual check-ins expire and are removed from the public feed after 2 hours. Check-in records may be retained in our database for a short period for analytics and abuse prevention, after which they are deleted.',
        },
        {
          subtitle: 'Photos',
          text: 'Photos uploaded with check-ins are stored on Cloudflare R2. They are deleted when the associated check-in record is purged.',
        },
        {
          subtitle: 'Account data',
          text: 'If you delete your account, we remove your profile, username, and associated data within 30 days. Anonymised aggregate data (e.g., total check-ins at a venue) may be retained.',
        },
      ],
    },
    {
      title: 'Your rights',
      content: [
        {
          subtitle: 'Access and portability',
          text: 'You can request a copy of the personal data we hold about you at any time by emailing us.',
        },
        {
          subtitle: 'Correction and deletion',
          text: 'You can correct your account information from your profile page. To delete your account and all associated data, contact us at hello@pulse.app.',
        },
        {
          subtitle: 'Objection',
          text: 'If you believe we are processing your data unlawfully, you have the right to object. Contact us and we will respond within 30 days.',
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
            Privacy Policy
          </h1>
          <p
            style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: '15px',
              lineHeight: 1.7,
              color: '#6E6760',
            }}
          >
            Last updated: March 2026. We've written this to be plain and honest — no legalese, no surprises.
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
                {section.content.map((item) => (
                  <div key={item.subtitle}>
                    <p
                      style={{
                        fontFamily: "'DM Sans', sans-serif",
                        fontWeight: 700,
                        fontSize: '14px',
                        marginBottom: '6px',
                        color: '#1A1714',
                      }}
                    >
                      {item.subtitle}
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
        <div style={{ marginBottom: '0' }}>
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
            If you have any questions about this policy or want to exercise your rights, reach us at:
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
