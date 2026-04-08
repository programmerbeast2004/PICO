// ── Pill toggle button ──────────────────────────────
export function PillBtn({ active, onClick, children, className = '' }) {
  return (
    <button
      onClick={onClick}
      className={`font-caveat text-sm px-3 py-1 border-2 border-ink rounded-full cursor-pointer transition-all duration-150 select-none ${className}`}
      style={{
        background: active ? '#111' : '#f0ece0',
        color: active ? '#faf8f3' : '#111',
        boxShadow: active ? '2px 2px 0 #555' : 'none',
        transform: active ? 'translate(-1px,-1px)' : 'none',
        fontWeight: active ? 700 : 500,
      }}
    >
      {children}
    </button>
  )
}

// ── Section heading ──────────────────────────────────
export function SectionHead({ children }) {
  return (
    <div
      className="font-bangers text-sm tracking-widest mb-3 flex items-center gap-2 pb-1"
      style={{ borderBottom: '2px solid #111' }}
    >
      {children}
    </div>
  )
}

// ── Comic card panel ─────────────────────────────────
export function ComicCard({ children, className = '', style = {} }) {
  return (
    <div
      className={`border-[3px] border-ink bg-white relative ${className}`}
      style={style}
    >
      {children}
    </div>
  )
}

// ── Text input ───────────────────────────────────────
export function TextInput({ label, value, onChange, placeholder }) {
  return (
    <div className="mb-3">
      <div className="font-caveat text-xs text-ink3 mb-1">{label}</div>
      <input
        className="font-caveat border-2 border-ink w-full px-3 py-[5px] text-[0.95rem] bg-paper2 rounded outline-none font-semibold transition-all duration-150 focus:bg-white"
        style={{ boxSizing: 'border-box', maxWidth: '100%' }}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
      />
    </div>
  )
}

// ── Slider row ───────────────────────────────────────
export function SliderRow({ label, value, min, max, step = 1, onChange, emoji }) {
  return (
    <div className="mb-4">
      <div className="flex justify-between items-center mb-1">
        <span className="font-caveat text-sm text-ink3">{emoji} {label}</span>
        <span className="font-bangers text-sm min-w-[38px] text-right">{value}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={e => onChange(Number(e.target.value))}
        style={{
          width: '100%',        /* never overflows its card */
          display: 'block',
          boxSizing: 'border-box',
          cursor: 'pointer',
          /* taller hit-target for touch */
          height: '28px',
          accentColor: '#111',
        }}
      />
    </div>
  )
}

// ── Star decoration ──────────────────────────────────
export function Star({ style = {} }) {
  return (
    <div className="absolute pointer-events-none opacity-25 animate-spin-star" style={style}>
      <svg viewBox="0 0 24 24" fill="#111" width="100%" height="100%">
        <polygon points="12,2 15,9 22,9 16,14 18,21 12,16 6,21 8,14 2,9 9,9" />
      </svg>
    </div>
  )
}

// ── Dot loader ────────────────────────────────────────
export function DotLoader() {
  return (
    <span className="dot-loader inline-flex items-center">
      <span /><span /><span />
    </span>
  )
}

// ── B&W Toggle ────────────────────────────────────────
export function BWToggle({ bw, onChange }) {
  return (
    <button
      onClick={() => onChange(!bw)}
      title={bw ? 'Switch to Colour' : 'Switch to B&W'}
      className="flex items-center gap-2 border-2 border-ink px-3 py-1.5 rounded-full font-caveat font-bold text-sm cursor-pointer transition-all duration-200 select-none"
      style={{
        background: bw ? '#111' : 'white',
        color: bw ? 'white' : '#111',
        boxShadow: '3px 3px 0 #555',
      }}
    >
      <span style={{ fontSize: '1rem' }}>{bw ? '◑' : '◐'}</span>
      {bw ? 'B&W Mode' : 'Colour Mode'}
    </button>
  )
}