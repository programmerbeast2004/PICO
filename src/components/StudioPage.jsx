import { useState, useRef, useEffect } from 'react'
import { usePhotos } from '../hooks/usePhotos.js'
import {
  FRAMES, BG_OPTIONS, STICKERS,
  HEADER_BG_COLORS, HEADER_TEXT_COLORS, DATE_STR,
} from '../utils/constants.js'
import { PillBtn, SectionHead, ComicCard, TextInput, SliderRow, DotLoader } from './UI.jsx'
import Strip from './Strip.jsx'
import Bunny from './Bunny.jsx'

/* ─────────────────────────────────────────────
   Global styles injected once.
   Key rules:
   • preview col is a FIXED pixel width — never stretches
   • panels col gets all remaining space
   • sliders never overflow their cards
   • page scroll is never blocked
───────────────────────────────────────────── */
const GLOBAL_CSS = `
  /* ── Base: strip preview col is always fixed width ── */
  .studio-preview-col {
    flex-shrink: 0;
  }

  /* ── Mobile (≤ 700 px) ── */
  @media (max-width: 700px) {
    .studio-layout {
      flex-direction: column !important;
      align-items: center !important;
      gap: 16px !important;
    }
    .studio-preview-col {
      position: static !important;
      width: 200px !important;
      min-width: 200px !important;
      max-width: 200px !important;
    }
    .studio-panels-col {
      width: 100% !important;
      max-width: 100% !important;
      flex: unset !important;
      min-width: 0 !important;
    }
    .studio-title {
      font-size: 1.9rem !important;
      letter-spacing: 3px !important;
    }
    .sticker-grid {
      grid-template-columns: repeat(6, 1fr) !important;
    }
    .studio-main {
      padding: 0.9rem 0.6rem !important;
    }
  }

  /* ── Very small phones (≤ 380 px) ── */
  @media (max-width: 380px) {
    .studio-preview-col {
      width: 175px !important;
      min-width: 175px !important;
      max-width: 175px !important;
    }
    .studio-title {
      font-size: 1.5rem !important;
      letter-spacing: 2px !important;
    }
    .sticker-grid {
      grid-template-columns: repeat(5, 1fr) !important;
    }
    .studio-main {
      padding: 0.6rem 0.35rem !important;
    }
  }

  /* ── Tablet (701 – 900 px) ── */
  @media (min-width: 701px) and (max-width: 900px) {
    .studio-preview-col {
      position: sticky !important;
      top: 16px !important;
    }
    .studio-panels-col {
      flex: 1 1 260px !important;
      max-width: 440px !important;
    }
    .sticker-grid {
      grid-template-columns: repeat(7, 1fr) !important;
    }
  }

  /* ── Prevent range inputs overflowing cards on any device ── */
  .studio-panels-col input[type=range] {
    width: 100% !important;
    max-width: 100% !important;
    display: block !important;
    box-sizing: border-box !important;
  }

  /* ── Larger touch target for range inputs on touch devices ── */
  @media (pointer: coarse) {
    input[type=range] {
      height: 32px !important;
    }
  }
`

function useGlobalStyles() {
  useEffect(() => {
    const id = 'pico-studio-css'
    if (document.getElementById(id)) return
    const tag = document.createElement('style')
    tag.id = id
    tag.textContent = GLOBAL_CSS
    document.head.appendChild(tag)
  }, [])
}

/* ── Single source of truth for strip/button width ──
   Strip.jsx now uses width:100% so it fills this exactly. */
const STRIP_W = 200   // px — matches the mobile CSS above

export default function StudioPage({ navigate, bw }) {
  useGlobalStyles()

  const [photos] = usePhotos()

  const [topText,     setTopText]     = useState('PHOTO BOOTH')
  const [botText,     setBotText]     = useState('PICO ♡')
  const [dateText,    setDateText]    = useState(DATE_STR)
  const [showDate,    setShowDate]    = useState(true)
  const [bgColor,     setBgColor]     = useState('#ffffff')
  const [frame,       setFrame]       = useState('fr-classic')
  const [slotCount,   setSlotCount]   = useState(Math.min(4, photos.length || 4))
  const [headerBg,    setHeaderBg]    = useState('#111111')
  const [headerColor, setHeaderColor] = useState('#ffffff')
  const [spacing,     setSpacing]     = useState(8)
  const [padding,     setPadding]     = useState(12)
  const [radius,      setRadius]      = useState(0)
  const [stickers,    setStickers]    = useState([])
  const [activeSticker, setActive]    = useState(null)
  const [downloading, setDownloading] = useState(false)
  const [downloaded,  setDownloaded]  = useState(false)

  const stripRef = useRef(null)
  const dragInfo = useRef(null)  // null = idle | { id, offX, offY } = dragging

  /* ── Sticker helpers ── */
  const addSticker = (emoji) => {
    setStickers(prev => [...prev, {
      id: Date.now() + Math.random(),
      emoji,
      x: 15 + Math.random() * 100,
      y: 40  + Math.random() * 200,
      size: 2.0,
      rotate: 0,
    }])
  }

  const startDrag = (e, id) => {
    const s = stickers.find(st => st.id === id)
    if (!s || !stripRef.current) return
    const rect = stripRef.current.getBoundingClientRect()
    const cx = e.touches ? e.touches[0].clientX : e.clientX
    const cy = e.touches ? e.touches[0].clientY : e.clientY
    dragInfo.current = { id, offX: cx - rect.left - s.x, offY: cy - rect.top - s.y }
    setActive(id)
  }

  useEffect(() => {
    const onMove = (e) => {
      /* ── CRITICAL: only intercept scroll when a sticker is being dragged ── */
      if (!dragInfo.current) return
      if (e.cancelable) e.preventDefault()
      if (!stripRef.current) return

      const rect = stripRef.current.getBoundingClientRect()
      const cx = e.touches ? e.touches[0].clientX : e.clientX
      const cy = e.touches ? e.touches[0].clientY : e.clientY
      const x  = cx - rect.left - dragInfo.current.offX
      const y  = cy - rect.top  - dragInfo.current.offY

      setStickers(prev =>
  (prev || []).filter(s => s && s.id).map(s =>
    dragInfo.current && s.id === dragInfo.current.id
      ? { ...s, x, y }
      : s
  )
)
    }

    const onUp = () => { dragInfo.current = null; setActive(null) }

    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup',   onUp)
    /* passive:false needed so preventDefault() can fire WHEN dragging;
       but we only reach preventDefault if dragInfo.current !== null */
    window.addEventListener('touchmove', onMove, { passive: false })
    window.addEventListener('touchend',  onUp)

    return () => {
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup',   onUp)
      window.removeEventListener('touchmove', onMove)
      window.removeEventListener('touchend',  onUp)
    }
  }, [])

  const removeSticker = (id) => setStickers(prev => prev.filter(s => s.id !== id))
  const updateSticker = (id, patch) => setStickers(prev => prev.map(s => s.id === id ? { ...s, ...patch } : s))
  const clearStickers = () => setStickers([])

  /* ── Download ── */
  const downloadStrip = async () => {
    if (downloading) return
    setDownloading(true)
    try {
      const html2canvas = (await import('html2canvas')).default
      const el   = stripRef.current
      const rect = el.getBoundingClientRect()
      const canvas = await html2canvas(el, {
        scale: 3,
        useCORS: true,
        backgroundColor: '#ffffff',
        width:  rect.width,
        height: rect.height,
      })
      const link = document.createElement('a')
      link.download = 'pico-strip.jpg'
      link.href = canvas.toDataURL('image/jpeg', 0.95)
      link.click()
      setDownloaded(true)
      setTimeout(() => setDownloaded(false), 3000)
    } catch (err) {
      console.error(err)
      alert('Download failed — try on desktop if this persists.')
    }
    setDownloading(false)
  }

  const globalFilter = bw ? 'grayscale(1) contrast(1.1)' : 'none'

  /* ── No photos ── */
  if (photos.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-6" style={{ filter: globalFilter }}>
        <div className="animate-float"><Bunny size={90} wiggle /></div>
        <div className="font-caveat text-xl text-ink3 text-center">No photos yet! Go snap some first ♡</div>
        <button
          onClick={() => navigate('booth')}
          className="font-bangers border-[3px] border-ink bg-ink text-paper px-8 py-3 text-xl tracking-widest cursor-pointer rounded-lg"
          style={{ boxShadow: '5px 5px 0 #555', maxWidth: 280, width: '100%' }}
        >
          ← GO TO BOOTH
        </button>
      </div>
    )
  }

  return (
    <main
      className="studio-main max-w-[1240px] mx-auto px-4 py-8"
      style={{ filter: globalFilter }}
    >
      {/* Title */}
      <div className="text-center mb-8 animate-slide-u">
        <div className="studio-title font-bangers text-[2.8rem] tracking-[6px] leading-none">
          🎞 STRIP STUDIO
        </div>
        <div className="font-caveat text-ink3 mt-1">
          customize your strip ✦ drag stickers ✦ download ♡
        </div>
      </div>

      <div className="studio-layout flex gap-8 flex-wrap justify-center items-start">

        {/* ════════════════════════════════════
            LEFT — Strip preview + actions
            Fixed pixel width on every breakpoint.
            Strip itself uses width:100% so it
            fills this container exactly.
        ════════════════════════════════════ */}
        <div
          className="studio-preview-col flex flex-col items-center gap-3 sticky top-24"
          style={{ width: STRIP_W, minWidth: STRIP_W }}
        >
          <div className="font-caveat text-xs text-ink3 text-center">← your strip preview →</div>

          {/* Strip fills the 200 px column, grows naturally in height */}
          <div style={{ width: '100%' }}>
            <Strip
              stripRef={stripRef}
              photos={photos}
              slotCount={slotCount}
              topText={topText}
              botText={botText}
              dateText={dateText}
              showDate={showDate}
              bgColor={bgColor}
              frame={frame}
              headerBg={headerBg}
              headerColor={headerColor}
              spacing={spacing}
              padding={padding}
              radius={radius}
              stickers={stickers}
              activeSticker={activeSticker}
              onStickerMouseDown={startDrag}
              onStickerTouchStart={startDrag}
              onStickerDoubleClick={removeSticker}
              bw={bw}
            />
          </div>

          {/* Download — exactly same width as strip column */}
          <button
            onClick={downloadStrip}
            disabled={downloading}
            className="font-bangers border-[3px] border-ink text-lg tracking-[4px] cursor-pointer transition-all duration-150"
            style={{
              width: '100%',
              padding: '0.6rem 0',
              background: downloaded ? '#2d7a3a' : '#111',
              color: 'white',
              borderRadius: 8,
              boxShadow: '4px 4px 0 #555',
              opacity: downloading ? 0.7 : 1,
              display: 'block',
              textAlign: 'center',
              boxSizing: 'border-box',
            }}
            onMouseEnter={e => {
              if (!downloading) {
                e.currentTarget.style.transform = 'translate(-2px,-2px)'
                e.currentTarget.style.boxShadow = '7px 7px 0 #555'
              }
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = ''
              e.currentTarget.style.boxShadow = '4px 4px 0 #555'
            }}
          >
            {downloading ? <DotLoader /> : downloaded ? '✓ SAVED!' : '⬇ DOWNLOAD'}
          </button>

          {/* Clear stickers */}
          <button
            onClick={clearStickers}
            className="font-caveat border-2 border-ink text-sm cursor-pointer transition-colors duration-150 hover:bg-blush"
            style={{
              width: '100%',
              padding: '0.32rem 0',
              background: '#f0ece0',
              borderRadius: 6,
              display: 'block',
              textAlign: 'center',
              boxSizing: 'border-box',
            }}
          >
            ✕ Clear all stickers
          </button>

          <div className="font-caveat text-[0.68rem] text-ink3 text-center" style={{ width: '100%' }}>
            double-click any sticker to remove it ♡
          </div>
        </div>

        {/* ════════════════════════════════════
            RIGHT — Edit panels
            min-width:0 prevents flex blowout
            on narrow phones.
        ════════════════════════════════════ */}
        <div
          className="studio-panels-col flex flex-col gap-4"
          style={{ flex: '1 1 280px', maxWidth: 560, minWidth: 0 }}
        >

          {/* Layout slots */}
          <ComicCard style={{ padding: '0.9rem', borderRadius: 4 }}>
            <SectionHead>📐 LAYOUT — SLOTS</SectionHead>
            <div className="flex gap-2 flex-wrap">
              {[2, 3, 4].map(n => (
                <PillBtn key={n} active={slotCount === n} onClick={() => setSlotCount(n)}>
                  {n} photos
                </PillBtn>
              ))}
            </div>
          </ComicCard>

          {/* Strip text */}
          <ComicCard style={{ padding: '0.9rem', borderRadius: 4 }}>
            <SectionHead>✏️ STRIP TEXT</SectionHead>
            <TextInput label="Top header"   value={topText}  onChange={setTopText}  placeholder="PHOTO BOOTH" />
            <TextInput label="Bottom text"  value={botText}  onChange={setBotText}  placeholder="♡ your text ♡" />
            <TextInput label="Date/caption" value={dateText} onChange={setDateText} placeholder="Date..." />
            <label className="flex items-center gap-2 font-caveat text-sm text-ink3 cursor-pointer mt-1">
              <input type="checkbox" checked={showDate} onChange={e => setShowDate(e.target.checked)} />
              Show date / caption
            </label>
          </ComicCard>

          {/* Background */}
          <ComicCard style={{ padding: '0.9rem', borderRadius: 4 }}>
            <SectionHead>🎨 STRIP BACKGROUND</SectionHead>
            <div className="flex gap-2 flex-wrap">
              {BG_OPTIONS.map(opt => (
                <button
                  key={opt.value}
                  onClick={() => setBgColor(opt.value)}
                  className="font-caveat border-2 border-ink px-3 py-1 text-xs rounded-full cursor-pointer transition-all duration-150"
                  style={{
                    background:
                      opt.value === 'stripe' ? 'repeating-linear-gradient(45deg,#fff,#fff 3px,#eee 3px,#eee 6px)'
                      : opt.value === 'dots'  ? 'radial-gradient(circle,#bbb 1px,transparent 1px) #f5f5f5'
                      : opt.value === 'hatch' ? 'repeating-linear-gradient(0deg,transparent,transparent 5px,#ddd 5px,#ddd 6px),repeating-linear-gradient(90deg,transparent,transparent 5px,#ddd 5px,#ddd 6px) #fafafa'
                      : opt.value,
                    backgroundSize: opt.value === 'stripe' ? '12px 12px' : opt.value === 'dots' ? '7px 7px' : undefined,
                    outline: bgColor === opt.value ? '2.5px solid #111' : 'none',
                    outlineOffset: 2,
                    color: opt.value === '#111111' ? 'white' : '#111',
                    fontWeight: bgColor === opt.value ? 700 : 500,
                  }}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </ComicCard>

          {/* Header colours */}
          <ComicCard style={{ padding: '0.9rem', borderRadius: 4 }}>
            <SectionHead>🎨 HEADER COLOURS</SectionHead>
            <div className="flex gap-6 flex-wrap">
              <div>
                <div className="font-caveat text-xs text-ink3 mb-2">Background</div>
                <div className="flex gap-2 flex-wrap">
                  {HEADER_BG_COLORS.map(c => (
                    <div
                      key={c}
                      onClick={() => setHeaderBg(c)}
                      style={{
                        width: 28, height: 28, background: c,
                        border: headerBg === c ? '3px solid #111' : '1.5px solid #aaa',
                        borderRadius: 5, cursor: 'pointer', flexShrink: 0,
                      }}
                    />
                  ))}
                </div>
              </div>
              <div>
                <div className="font-caveat text-xs text-ink3 mb-2">Text colour</div>
                <div className="flex gap-2 flex-wrap">
                  {HEADER_TEXT_COLORS.map(c => (
                    <div
                      key={c}
                      onClick={() => setHeaderColor(c)}
                      style={{
                        width: 28, height: 28, background: c,
                        border: headerColor === c ? '3px solid #111' : '1.5px solid #aaa',
                        borderRadius: 5, cursor: 'pointer', flexShrink: 0,
                      }}
                    />
                  ))}
                </div>
              </div>
            </div>
          </ComicCard>

          {/* Photo frame */}
          <ComicCard style={{ padding: '0.9rem', borderRadius: 4 }}>
            <SectionHead>🖼 PHOTO FRAME STYLE</SectionHead>
            <div className="flex gap-2 flex-wrap">
              {FRAMES.map(f => (
                <PillBtn key={f.id} active={frame === f.id} onClick={() => setFrame(f.id)}>
                  {f.label}
                </PillBtn>
              ))}
            </div>
          </ComicCard>

          {/* Spacing & style */}
          <ComicCard style={{ padding: '0.9rem', borderRadius: 4 }}>
            <SectionHead>📏 SPACING & STYLE</SectionHead>
            <SliderRow label="Photo gap" value={spacing} min={0} max={24} onChange={setSpacing} emoji="↕" />
            <SliderRow label="Padding"   value={padding} min={4} max={30} onChange={setPadding} emoji="↔" />
            <SliderRow label="Roundness" value={radius}  min={0} max={22} onChange={setRadius}  emoji="○" />
          </ComicCard>

          {/* Stickers */}
          <ComicCard style={{ padding: '0.9rem', borderRadius: 4 }}>
            <SectionHead>✨ STICKERS — click to add</SectionHead>
            <div
              className="sticker-grid grid gap-1.5"
              style={{ gridTemplateColumns: 'repeat(8, 1fr)' }}
            >
              {STICKERS.map((s, i) => (
                <button
                  key={i}
                  onClick={() => addSticker(s)}
                  className="border-2 border-ink text-xl cursor-pointer transition-all duration-150 hover:scale-125 hover:bg-white"
                  style={{ padding: '3px 0', background: '#f0ece0', borderRadius: 6, lineHeight: 1.4 }}
                >
                  {s}
                </button>
              ))}
            </div>
            <div className="font-caveat text-[0.75rem] text-ink3 text-center mt-2">
              tap to add ✦ drag to place ✦ double-click to remove ♡
            </div>
          </ComicCard>

          {/* Sticker fine-tune — only shown when stickers exist */}
          {stickers.length > 0 && (
            <ComicCard style={{ padding: '0.9rem', borderRadius: 4 }}>
              <SectionHead>🔧 STICKER FINE-TUNING</SectionHead>
              <div className="flex flex-col gap-3">
                {stickers.map(s => (
                  <div
                    key={s.id}
                    className="flex items-center gap-3 p-2 rounded"
                    style={{ background: activeSticker === s.id ? '#fdeef4' : '#f0ece0' }}
                  >
                    <span style={{ fontSize: '1.4rem', flexShrink: 0 }}>{s.emoji}</span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-caveat text-[0.72rem] text-ink3 flex-shrink-0" style={{ width: 30 }}>size</span>
                        <input
                          type="range" min={0.6} max={4.5} step={0.1} value={s.size}
                          onChange={e => updateSticker(s.id, { size: Number(e.target.value) })}
                          style={{ flex: 1, minWidth: 0, cursor: 'pointer' }}
                        />
                        <span className="font-bangers text-[0.7rem]" style={{ width: 30, textAlign: 'right', flexShrink: 0 }}>{s.size.toFixed(1)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-caveat text-[0.72rem] text-ink3 flex-shrink-0" style={{ width: 30 }}>rot</span>
                        <input
                          type="range" min={-180} max={180} step={1} value={s.rotate}
                          onChange={e => updateSticker(s.id, { rotate: Number(e.target.value) })}
                          style={{ flex: 1, minWidth: 0, cursor: 'pointer' }}
                        />
                        <span className="font-bangers text-[0.7rem]" style={{ width: 30, textAlign: 'right', flexShrink: 0 }}>{s.rotate}°</span>
                      </div>
                    </div>
                    <button
                      onClick={() => removeSticker(s.id)}
                      className="w-6 h-6 rounded-full bg-ink text-paper border-none cursor-pointer text-[0.65rem] flex-shrink-0 flex items-center justify-center"
                    >✕</button>
                  </div>
                ))}
              </div>
            </ComicCard>
          )}

        </div>
      </div>
    </main>
  )
}