'use client';

export default function HowLeaderboardWorksPage() {
  const pointsBreakdown = [
    { action: 'Check in to a venue', points: 10, emoji: '📍' },
    { action: 'Add a photo to your check-in', points: 25, emoji: '📸' },
    { action: 'Discover a new venue (first check-in ever)', points: 50, emoji: '🗺️' },
    { action: 'Weekly streak bonus', points: '×2', emoji: '🔥', isBonus: true },
  ];

  const badges = [
    {
      name: 'First Timer',
      emoji: '👋',
      desc: 'Complete your first check-in on Pulse.',
      color: '#CCF0FF',
      textColor: '#005A75',
    },
    {
      name: 'Explorer',
      emoji: '🗺️',
      desc: 'Visit and check in to 10 unique venues.',
      color: '#EEFF99',
      textColor: '#4E6200',
    },
    {
      name: 'Night Owl',
      emoji: '🦉',
      desc: 'Check in after midnight at least 5 times.',
      color: '#E8D5FF',
      textColor: '#4A0080',
    },
    {
      name: 'Streak Master',
      emoji: '🔥',
      desc: 'Check in on 7 consecutive days.',
      color: '#FFE5CC',
      textColor: '#7A3000',
    },
    {
      name: 'Vibe Pioneer',
      emoji: '⚡',
      desc: 'Be the first to check in to 5 different venues.',
      color: '#F0FFB3',
      textColor: '#4E6200',
    },
    {
      name: 'Photographer',
      emoji: '📷',
      desc: 'Upload photos with 10 check-ins.',
      color: '#FFD6F0',
      textColor: '#7A004F',
    },
    {
      name: 'Local Legend',
      emoji: '🏆',
      desc: 'Reach the top 10 on the weekly leaderboard.',
      color: '#FFF0CC',
      textColor: '#664800',
    },
    {
      name: 'Scene Setter',
      emoji: '🎉',
      desc: 'Accumulate 500 total points.',
      color: '#D6FFE8',
      textColor: '#005A2A',
    },
  ];

  const tiers = [
    { name: 'Scout', range: '0 – 99 pts', color: '#F5F4F2', textColor: '#6E6760' },
    { name: 'Regular', range: '100 – 499 pts', color: '#CCF0FF', textColor: '#005A75' },
    { name: 'Local', range: '500 – 1,499 pts', color: '#EEFF99', textColor: '#4E6200' },
    { name: 'Insider', range: '1,500 – 4,999 pts', color: '#FFE5CC', textColor: '#7A3000' },
    { name: 'Legend', range: '5,000+ pts', color: '#C8FF00', textColor: '#4E6200' },
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
            Leaderboard
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
            Earn points.
            <br />
            Own the scene.
          </h1>
          <p
            style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: '17px',
              lineHeight: 1.7,
              color: '#6E6760',
            }}
          >
            The more you contribute to Pulse, the more points you earn. Top contributors appear on the weekly leaderboard and unlock exclusive badges.
          </p>
        </div>

        {/* Points breakdown */}
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
            How you earn points
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {pointsBreakdown.map((item) => (
              <div
                key={item.action}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  background: item.isBonus ? '#F0FFB3' : '#FFFFFF',
                  border: `1px solid ${item.isBonus ? '#C8FF00' : '#E2DDD8'}`,
                  borderRadius: '14px',
                  padding: '16px 20px',
                  gap: '12px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{ fontSize: '20px', flexShrink: 0 }}>{item.emoji}</span>
                  <span
                    style={{
                      fontFamily: "'DM Sans', sans-serif",
                      fontSize: '15px',
                      fontWeight: item.isBonus ? 600 : 400,
                      color: item.isBonus ? '#4E6200' : '#1A1714',
                    }}
                  >
                    {item.action}
                  </span>
                </div>
                <span
                  style={{
                    fontFamily: "'Space Grotesk', sans-serif",
                    fontWeight: 700,
                    fontSize: '18px',
                    color: item.isBonus ? '#4E6200' : '#1A1714',
                    flexShrink: 0,
                  }}
                >
                  {typeof item.points === 'number' ? `+${item.points}` : item.points}
                </span>
              </div>
            ))}
          </div>
          <p
            style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: '13px',
              color: '#AFA89F',
              marginTop: '12px',
              lineHeight: 1.5,
            }}
          >
            Weekly streak bonus: check in at least once every day for 7 consecutive days and all points earned that week are doubled.
          </p>
        </div>

        <div style={{ borderTop: '1px solid #E2DDD8', marginBottom: '56px' }} />

        {/* Tiers */}
        <div style={{ marginBottom: '56px' }}>
          <h2
            style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontStyle: 'italic',
              fontWeight: 700,
              fontSize: '26px',
              marginBottom: '8px',
            }}
          >
            Rank tiers
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
            Your rank is based on total lifetime points. Each tier unlocks a profile badge visible to other users.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {tiers.map((tier) => (
              <div
                key={tier.name}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  background: tier.color,
                  borderRadius: '12px',
                  padding: '14px 18px',
                }}
              >
                <span
                  style={{
                    fontFamily: "'DM Sans', sans-serif",
                    fontWeight: 700,
                    fontSize: '15px',
                    color: tier.textColor,
                  }}
                >
                  {tier.name}
                </span>
                <span
                  style={{
                    fontFamily: "'DM Sans', sans-serif",
                    fontSize: '13px',
                    color: tier.textColor,
                    opacity: 0.8,
                  }}
                >
                  {tier.range}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div style={{ borderTop: '1px solid #E2DDD8', marginBottom: '56px' }} />

        {/* Badges */}
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
            Badges
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
            Badges are earned by hitting specific milestones. They're displayed on your public profile.
          </p>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '12px',
            }}
          >
            {badges.map((badge) => (
              <div
                key={badge.name}
                style={{
                  background: badge.color,
                  borderRadius: '16px',
                  padding: '18px',
                }}
              >
                <div style={{ fontSize: '24px', marginBottom: '8px' }}>{badge.emoji}</div>
                <p
                  style={{
                    fontFamily: "'DM Sans', sans-serif",
                    fontWeight: 700,
                    fontSize: '14px',
                    color: badge.textColor,
                    marginBottom: '4px',
                  }}
                >
                  {badge.name}
                </p>
                <p
                  style={{
                    fontFamily: "'DM Sans', sans-serif",
                    fontSize: '12px',
                    color: badge.textColor,
                    opacity: 0.85,
                    lineHeight: 1.5,
                    margin: 0,
                  }}
                >
                  {badge.desc}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div style={{ borderTop: '1px solid #E2DDD8', marginBottom: '56px' }} />

        {/* Fair play note */}
        <div style={{ marginBottom: '64px' }}>
          <h2
            style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontStyle: 'italic',
              fontWeight: 700,
              fontSize: '26px',
              marginBottom: '16px',
            }}
          >
            Fair play
          </h2>
          <p
            style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: '15px',
              lineHeight: 1.7,
              color: '#6E6760',
            }}
          >
            You can only earn points for one check-in per venue per hour. Spamming check-ins at the same place won't inflate your score. The leaderboard resets weekly, so the rankings stay competitive for everyone — not just early adopters.
          </p>
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
            Start earning today
          </h2>
          <p
            style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: '15px',
              color: '#4E6200',
              marginBottom: '24px',
            }}
          >
            Create your account and start climbing the leaderboard.
          </p>
          <a
            href="/sign-up"
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
            Create an account
          </a>
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
