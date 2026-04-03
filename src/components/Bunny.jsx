export default function SublimeBloom({ size = 140, animate = true }) {
  const float = animate
    ? { animation: "float 6s ease-in-out infinite" }
    : {}

  const rotate = animate
    ? { transformOrigin: "center", animation: "rotate 40s linear infinite" }
    : {}

  const pulse = animate
    ? { animation: "pulse 4s ease-in-out infinite" }
    : {}

  return (
    <>
      <style>
        {`
        @keyframes float {
          0%,100% { transform: translateY(0px); }
          50% { transform: translateY(-8px); }
        }

        @keyframes rotate {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        @keyframes pulse {
          0%,100% { opacity: 0.7; }
          50% { opacity: 1; }
        }
        `}
      </style>

      <svg
        width={size}
        height={size}
        viewBox="0 0 200 200"
        fill="none"
        style={{ ...float }}
      >
        {/* Outer Glow */}
        <circle
          cx="100"
          cy="100"
          r="70"
          fill="url(#softGlow)"
          opacity="0.25"
          style={pulse}
        />

        {/* Rotating Petals */}
        <g style={rotate}>
          {[...Array(10)].map((_, i) => {
            const angle = (i * 360) / 10
            return (
              <ellipse
                key={i}
                cx="100"
                cy="45"
                rx="12"
                ry="40"
                fill="url(#petalGrad)"
                opacity="0.85"
                transform={`rotate(${angle} 100 100)`}
              />
            )
          })}
        </g>

        {/* Inner Layer */}
        <g>
          {[...Array(6)].map((_, i) => {
            const angle = (i * 360) / 6
            return (
              <ellipse
                key={i}
                cx="100"
                cy="65"
                rx="8"
                ry="28"
                fill="url(#innerGrad)"
                opacity="0.9"
                transform={`rotate(${angle} 100 100)`}
              />
            )
          })}
        </g>

        {/* Center Core */}
        <circle
          cx="100"
          cy="100"
          r="18"
          fill="url(#coreGrad)"
          style={pulse}
        />

        {/* Gradients */}
        <defs>
          <radialGradient id="softGlow">
            <stop offset="0%" stopColor="#ffd166" />
            <stop offset="100%" stopColor="#ff4d6d" />
          </radialGradient>

          <linearGradient id="petalGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#ff4d6d" />
            <stop offset="100%" stopColor="#ffd166" />
          </linearGradient>

          <linearGradient id="innerGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#ff758f" />
            <stop offset="100%" stopColor="#ffe066" />
          </linearGradient>

          <radialGradient id="coreGrad">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="100%" stopColor="#ffd166" />
          </radialGradient>
        </defs>
      </svg>
    </>
  )
}