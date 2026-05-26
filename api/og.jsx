import { ImageResponse } from '@vercel/og'

export const config = {
  runtime: 'edge',
}

export default async function handler(req) {
  const { searchParams } = new URL(req.url)
  const saving = searchParams.get('saving') || '0'
  const total = searchParams.get('total') || '0'
  const subs = searchParams.get('subs') || '0'
  const keep = searchParams.get('keep') || ''
  const cancel = searchParams.get('cancel') || ''

  return new ImageResponse(
    (
      <div
        style={{
          width: '1200px',
          height: '630px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
          fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif',
          padding: '60px',
        }}
      >
        {/* Logo / Brand */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            marginBottom: '40px',
          }}
        >
          <div
            style={{
              fontSize: '32px',
              display: 'flex',
            }}
          >
            🎮
          </div>
          <div
            style={{
              fontSize: '24px',
              fontWeight: 600,
              color: '#94a3b8',
              letterSpacing: '-0.5px',
            }}
          >
            gamesubcalc.gg
          </div>
        </div>

        {/* Main stat */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            marginBottom: '40px',
          }}
        >
          <div
            style={{
              fontSize: '28px',
              color: '#94a3b8',
              marginBottom: '8px',
            }}
          >
            I was spending
          </div>
          <div
            style={{
              fontSize: '72px',
              fontWeight: 700,
              color: '#ffffff',
              letterSpacing: '-2px',
            }}
          >
            ${total}/year
          </div>
          <div
            style={{
              fontSize: '24px',
              color: '#64748b',
              marginTop: '4px',
            }}
          >
            on {subs} gaming subscription{subs !== '1' ? 's' : ''}
          </div>
        </div>

        {/* Saving callout */}
        {parseInt(saving) > 0 ? (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
              background: 'rgba(29, 158, 117, 0.15)',
              border: '2px solid rgba(29, 158, 117, 0.4)',
              borderRadius: '16px',
              padding: '20px 40px',
            }}
          >
            <div
              style={{
                fontSize: '24px',
                color: '#1D9E75',
                fontWeight: 500,
              }}
            >
              Saving
            </div>
            <div
              style={{
                fontSize: '48px',
                fontWeight: 700,
                color: '#1D9E75',
              }}
            >
              ${saving}/year
            </div>
            <div
              style={{
                fontSize: '20px',
                color: '#1D9E75',
              }}
            >
              by cancelling {cancel}
            </div>
          </div>
        ) : (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              background: 'rgba(29, 158, 117, 0.15)',
              border: '2px solid rgba(29, 158, 117, 0.4)',
              borderRadius: '16px',
              padding: '20px 40px',
            }}
          >
            <div
              style={{
                fontSize: '28px',
                color: '#1D9E75',
                fontWeight: 600,
              }}
            >
              ✓ All my subs are worth keeping
            </div>
          </div>
        )}

        {/* CTA */}
        <div
          style={{
            position: 'absolute',
            bottom: '40px',
            fontSize: '20px',
            color: '#475569',
          }}
        >
          Find out what to cancel in 60 seconds →
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  )
}
