'use client';

export default function AISearchPage() {
  const exampleQueries = [
    { query: 'lively rooftop in DIFC', emoji: '🌆' },
    { query: 'romantic Italian with Burj views', emoji: '🕌' },
    { query: 'packed sports bar showing the game', emoji: '⚽' },
    { query: 'chill cafe in JLT for late night work', emoji: '☕' },
    { query: 'loud nightclub open after 1am', emoji: '🎶' },
    { query: 'quiet brunch spot in Business Bay', emoji: '🍳' },
  ];

  const pipeline = [
    {
      step: 'Analyzing',
      title: 'Understanding your intent',
      desc: 'GPT-4o-mini parses your query to extract vibe signals — atmosphere, cuisine type, location, time of day, and special conditions like views or crowd energy.',
    },
    {
      step: 'Google Places',
      title: 'Finding candidate venues',
      desc: "We search Google Places for venues in Dubai that match your criteria. We pull real venue data — names, ratings, hours, photos — not our own database alone.",
    },
    {
      step: 'Reading reviews',
      title: 'Scanning recent context',
      desc: 'We read recent Google reviews and extract qualitative signals — atmosphere mentions, recurring themes, and phrases that match your query.',
    },
    {
      step: 'Ranking',
      title: 'Scoring against live data',
      desc: 'Venues are scored against your query using AI. Critically, we cross-reference live Pulse check-ins. A venue described as "lively" only ranks highly if real people are there right now.',
    },
    {
      step: 'Summaries',
      title: 'Writing honest answers',
      desc: 'We generate a one-line AI summary for each result explaining why it matches. No fluff — just a direct answer about current vibe and why we think it fits.',
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
            AI Vibe Search
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
            Ask in plain English.
            <br />
            Get live answers.
          </h1>
          <p
            style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: '17px',
              lineHeight: 1.7,
              color: '#6E6760',
            }}
          >
            Pulse's AI search understands what you're actually looking for — not just keywords. Describe the vibe you want tonight, and we match it against real-time check-in data across Dubai.
          </p>
        </div>

        {/* Example queries */}
        <div style={{ marginBottom: '56px' }}>
          <p
            style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: '12px',
              fontWeight: 600,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color: '#AFA89F',
              marginBottom: '14px',
            }}
          >
            Try searches like
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {exampleQueries.map((item) => (
              <div
                key={item.query}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  background: '#FFFFFF',
                  border: '1px solid #E2DDD8',
                  borderRadius: '14px',
                  padding: '14px 18px',
                }}
              >
                <span style={{ fontSize: '18px', flexShrink: 0 }}>{item.emoji}</span>
                <span
                  style={{
                    fontFamily: "'DM Sans', sans-serif",
                    fontSize: '15px',
                    color: '#1A1714',
                    fontStyle: 'italic',
                  }}
                >
                  "{item.query}"
                </span>
              </div>
            ))}
          </div>
        </div>

        <div style={{ borderTop: '1px solid #E2DDD8', marginBottom: '56px' }} />

        {/* How it works pipeline */}
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
            What happens when you search
          </h2>
          <p
            style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: '15px',
              color: '#6E6760',
              marginBottom: '28px',
              lineHeight: 1.6,
            }}
          >
            Every search runs a 5-stage pipeline in real time. You see each step as it happens.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
            {pipeline.map((item, i) => (
              <div key={item.step} style={{ display: 'flex', gap: '0' }}>
                {/* Timeline line */}
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    flexShrink: 0,
                    marginRight: '20px',
                  }}
                >
                  <div
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      background: '#C8FF00',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontFamily: "'Space Grotesk', sans-serif",
                      fontWeight: 700,
                      fontSize: '13px',
                      color: '#4E6200',
                      flexShrink: 0,
                    }}
                  >
                    {i + 1}
                  </div>
                  {i < pipeline.length - 1 && (
                    <div
                      style={{
                        width: '2px',
                        flex: 1,
                        minHeight: '24px',
                        background: '#E2DDD8',
                        margin: '4px 0',
                      }}
                    />
                  )}
                </div>
                <div style={{ paddingBottom: i < pipeline.length - 1 ? '20px' : 0, paddingTop: '4px' }}>
                  <p
                    style={{
                      fontFamily: "'DM Sans', sans-serif",
                      fontSize: '11px',
                      fontWeight: 600,
                      letterSpacing: '0.08em',
                      textTransform: 'uppercase',
                      color: '#4E6200',
                      marginBottom: '2px',
                    }}
                  >
                    {item.step}
                  </p>
                  <h3
                    style={{
                      fontFamily: "'Space Grotesk', sans-serif",
                      fontWeight: 600,
                      fontSize: '16px',
                      marginBottom: '4px',
                    }}
                  >
                    {item.title}
                  </h3>
                  <p
                    style={{
                      fontFamily: "'DM Sans', sans-serif",
                      fontSize: '14px',
                      lineHeight: 1.65,
                      color: '#6E6760',
                      margin: 0,
                    }}
                  >
                    {item.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ borderTop: '1px solid #E2DDD8', marginBottom: '56px' }} />

        {/* Live data note */}
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
            Grounded in live data, not guesswork
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
            Most AI search tools hallucinate. They'll confidently tell you a place is "buzzing tonight" with zero real-world evidence. Pulse is different.
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
            Our AI only surfaces a venue as "lively" or "packed" if real Pulse check-ins from the last 2 hours confirm it. If a place has no recent activity, we either omit it or flag it as unverified.
          </p>
          <div
            style={{
              background: '#F0FFB3',
              borderRadius: '16px',
              padding: '20px 24px',
              display: 'flex',
              gap: '14px',
              alignItems: 'flex-start',
            }}
          >
            <span style={{ fontSize: '20px', flexShrink: 0 }}>✦</span>
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
              AI search results are only as good as the data behind them. The more people check in, the more accurate the search becomes. Every check-in makes Pulse smarter for everyone.
            </p>
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
            Try it yourself
          </h2>
          <p
            style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: '15px',
              color: '#4E6200',
              marginBottom: '24px',
            }}
          >
            Describe what you're looking for and see live results.
          </p>
          <a
            href="/search"
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
            Open vibe search →
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
