import { useState, useRef, useEffect } from 'react'
import { usePhotos } from '../hooks/usePhotos.js'
import {
  FILTERS, FRAMES, BG_OPTIONS, STICKERS,
  HEADER_BG_COLORS, HEADER_TEXT_COLORS, DATE_STR,
} from '../utils/constants.js'
import { PillBtn, SectionHead, ComicCard, TextInput, SliderRow, DotLoader } from './UI.jsx'
import Strip from './Strip.jsx'
import Bunny from './Bunny.jsx'

/* ─────────────────────────────────────────────
   Responsive style injection — runs once, adds
   media-query rules that override inline/Tailwind
   styles for small screens. Zero logic changes.
───────────────────────────────────────────── */
const MOBILE_CSS = `
  /* ── Studio outer layout ── */
  @media (max-width: 700px) {
    .studio-layout {
      flex-direction: column !important;
      align-items: center !important;
      gap: 20px !important;
    }

    /* Strip preview: unstick on mobile, full-width */
    .studio-preview-col {
      position: static !important;
      width: 100% !important;
      align-items: center !important;
    }

    /* Preview label */
    .studio-preview-label {
      font-size: 0.7rem !important;
    }

    /* Download / clear buttons under strip */
    .studio-dl-btn,
    .studio-clear-btn {
      width: 100% !important;
      max-width: 320px !important;
    }

    /* Edit panels column: full width */
    .studio-panels-col {
      width: 100% !important;
      max-width: 100% !important;
      flex: unset !important;
    }

    /* Title font size */
    .studio-title {
      font-size: 2rem !important;
      letter-spacing: 3px !important;
    }

    /* Sticker grid: 6 cols on small phones */
    .sticker-grid {
      grid-template-columns: repeat(6, 1fr) !important;
    }

    /* Sticker fine-tune range inputs: ensure touch-friendly height */
    .sticker-fine-tune input[type=range] {
      height: 28px !important;
      cursor: pointer !important;
    }

    /* ComicCard padding tighter on mobile */
    .studio-panels-col .comic-card-inner {
      padding: 0.65rem !important;
    }

    /* Big bottom download btn */
    .studio-big-dl {
      font-size: 1.1rem !important;
      letter-spacing: 3px !important;
      padding: 0.85rem 0 !important;
      border-width: 3px !important;
    }

    /* Page padding */
    .studio-main {
      padding: 1rem 0.5rem !important;
    }

    /* Pill buttons: slightly smaller */
    .studio-panels-col .pill-btn {
      font-size: 0.78rem !important;
      padding: 0.3rem 0.7rem !important;
    }

    /* Header colour swatches: slightly smaller */
    .studio-panels-col .swatch-dot {
      width: 24px !important;
      height: 24px !important;
    }

    /* Slider labels */
    .studio-panels-col .slider-label {
      font-size: 0.7rem !important;
    }

    /* "No photos" fallback: button full width */
    .studio-goto-btn {
      width: 100% !important;
      max-width: 280px !important;
    }
  }

  /* ── Very small phones (≤ 380 px) ── */
  @media (max-width: 380px) {
    .studio-title {
      font-size: 1.5rem !important;
      letter-spacing: 2px !important;
    }

    .sticker-grid {
      grid-template-columns: repeat(5, 1fr) !important;
    }

    .studio-main {
      padding: 0.75rem 0.35rem !important;
    }
  }

  /* ── Tablet range: 701 – 900 px ── */
  @media (min-width: 701px) and (max-width: 900px) {
    .studio-layout {
      gap: 20px !important;
    }

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

  /* ── Touch: make range inputs taller for fingers ── */
  @media (pointer: coarse) {
    input[type=range] {
      height: 30px !important;
    }
  }
`

function useStudioStyles() {
  useEffect(() => {
    const id = 'studio-mobile-css'
    if (document.getElementById(id)) return
    const tag = document.createElement('style')
    tag.id = id
    tag.textContent = MOBILE_CSS
    document.head.appendChild(tag)
    return () => { /* leave it — harmless if re-used */ }
  }, [])
}

export default function StudioPage({ navigate, bw }) {
  useStudioStyles()

  const [photos] = usePhotos()

  // Strip state
  const [topText,    setTopText]    = useState('PHOTO BOOTH')
  const [botText,    setBotText]    = useState('PICO ♡')
  const [dateText,   setDateText]   = useState(DATE_STR)
  const [showDate,   setShowDate]   = useState(true)
  const [bgColor,    setBgColor]    = useState('#ffffff')
  const [frame,      setFrame]      = useState('fr-classic')
  const [slotCount,  setSlotCount]  = useState(Math.min(4, photos.length || 4))
  const [headerBg,   setHeaderBg]   = useState('#111111')
  const [headerColor,setHeaderColor]= useState('#ffffff')
  const [spacing,    setSpacing]    = useState(8)
  const [padding,    setPadding]    = useState(12)
  const [radius,     setRadius]     = useState(0)
  const [stickers,   setStickers]   = useState([])
  const [activeSticker, setActive]  = useState(null)
  const [downloading, setDownloading] = useState(false)
  const [downloaded,  setDownloaded]  = useState(false)

  const stripRef  = useRef(null)
  const dragInfo  = useRef(null)

  const addSticker = (emoji) => {
    setStickers(prev => [...prev, {
      id: Date.now() + Math.random(),
      emoji,
      x: 15 + Math.random() * 140,
      y: 40 + Math.random() * 250,
      size: 2.0,
      rotate: 0,
    }])
  }

  const startDrag = (e, id) => {
    e.preventDefault()
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
      if (!dragInfo.current || !stripRef.current) return
      const rect = stripRef.current.getBoundingClientRect()
      const cx = e.touches ? e.touches[0].clientX : e.clientX
      const cy = e.touches ? e.touches[0].clientY : e.clientY
      const x  = cx - rect.left - dragInfo.current.offX
      const y  = cy - rect.top  - dragInfo.current.offY
      setStickers(prev => prev.map(s => s.id === dragInfo.current.id ? { ...s, x, y } : s))
    }
    const onUp = () => { dragInfo.current = null; setActive(null) }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
    window.addEventListener('touchmove', onMove, { passive: false })
    window.addEventListener('touchend', onUp)
    return () => {
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
      window.removeEventListener('touchmove', onMove)
      window.removeEventListener('touchend', onUp)
    }
  }, [])

  const removeSticker = (id) => setStickers(prev => prev.filter(s => s.id !== id))
  const updateSticker = (id, patch) => setStickers(prev => prev.map(s => s.id === id ? { ...s, ...patch } : s))
  const clearStickers = () => setStickers([])

  const downloadStrip = async () => {
    if (downloading) return
    setDownloading(true)
    try {
      const html2canvas = (await import('html2canvas')).default
      const canvas = await html2canvas(stripRef.current, {
        scale: 4,
        useCORS: true,
        allowTaint: true,
        backgroundColor: bgColor === 'stripe' || bgColor === 'dots' || bgColor === 'hatch' ? '#ffffff' : bgColor,
        logging: false,
      })
      const link = document.createElement('a')
      link.download = 'comic-cafe-strip.jpg'
      link.href = canvas.toDataURL('image/jpeg', 0.96)
      link.click()
      setDownloaded(true)
      setTimeout(() => setDownloaded(false), 3000)
    } catch (err) {
      console.error(err)
      alert('Download failed. Try allowing popups or use a different browser.')
    }
    setDownloading(false)
  }

  const globalFilter = bw ? 'grayscale(1) contrast(1.1)' : 'none'

  if (photos.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-6" style={{ filter: globalFilter }}>
        <div className="animate-float"><Bunny size={90} wiggle /></div>
        <div className="font-caveat text-xl text-ink3 text-center">
          No photos yet! Go snap some first ♡
        </div>
        <button
          onClick={() => navigate('booth')}
          className="studio-goto-btn font-bangers border-[3px] border-ink bg-ink text-paper px-8 py-3 text-xl tracking-widest cursor-pointer rounded-lg"
          style={{ boxShadow: '5px 5px 0 #555' }}
        >
          ← GO TO BOOTH
        </button>
      </div>
    )
  }

  return (
    <main className="studio-main max-w-[1240px] mx-auto px-4 py-8" style={{ filter: globalFilter }}>

      {/* Title */}
      <div className="text-center mb-8 animate-slide-u">
        <div className="studio-title font-bangers text-[2.8rem] tracking-[6px] leading-none">🎞 STRIP STUDIO</div>
        <div className="font-caveat text-ink3 mt-1">
          customize your strip ✦ drag stickers ✦ download ♡
        </div>
      </div>

      <div className="studio-layout flex gap-8 flex-wrap justify-center items-start">

        {/* ── Strip preview + download ── */}
        <div className="studio-preview-col flex flex-col items-center gap-4 sticky top-24">
          <div className="studio-preview-label font-caveat text-xs text-ink3">← your strip preview →</div>

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

          {/* Download button */}
          <button
            onClick={downloadStrip}
            disabled={downloading}
            className="studio-dl-btn font-bangers border-[3px] border-ink text-lg tracking-[4px] cursor-pointer transition-all duration-150"
            style={{
              width: 210,
              padding: '0.65rem 0',
              background: downloaded ? '#2d7a3a' : '#111',
              color: 'white',
              borderRadius: 8,
              boxShadow: '5px 5px 0 #555',
              opacity: downloading ? 0.7 : 1,
            }}
            onMouseEnter={e => { if (!downloading) { e.currentTarget.style.transform = 'translate(-2px,-2px)'; e.currentTarget.style.boxShadow = '8px 8px 0 #555' } }}
            onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '5px 5px 0 #555' }}
          >
            {downloading ? <DotLoader /> : downloaded ? '✓ SAVED!' : '⬇ DOWNLOAD'}
          </button>

          <button
            onClick={clearStickers}
            className="studio-clear-btn font-caveat border-2 border-ink text-sm cursor-pointer transition-colors duration-150 hover:bg-blush"
            style={{ width: 210, padding: '0.35rem 0', background: '#f0ece0', borderRadius: 6 }}
          >
            ✕ Clear all stickers
          </button>

          <div className="font-caveat text-[0.72rem] text-ink3 text-center" style={{ width: 210 }}>
            double-click any sticker to remove it ♡
          </div>
        </div>

        {/* ── Edit panels ── */}
        <div className="studio-panels-col flex flex-col gap-4" style={{ flex: '1 1 280px', maxWidth: 560 }}>

          {/* Layout */}
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

          {/* Text */}
          <ComicCard style={{ padding: '0.9rem', borderRadius: 4 }}>
            <SectionHead>✏️ STRIP TEXT</SectionHead>
            <TextInput label="Top header"    value={topText}  onChange={setTopText}  placeholder="PHOTO BOOTH" />
            <TextInput label="Bottom text"   value={botText}  onChange={setBotText}  placeholder="♡ your text ♡" />
            <TextInput label="Date/caption"  value={dateText} onChange={setDateText} placeholder="Date..." />
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
                  className="pill-btn font-caveat border-2 border-ink px-3 py-1 text-xs rounded-full cursor-pointer transition-all duration-150"
                  style={{
                    background:
                      opt.value === 'stripe' ? 'repeating-linear-gradient(45deg,#fff,#fff 3px,#eee 3px,#eee 6px)'
                      : opt.value === 'dots' ? 'radial-gradient(circle,#bbb 1px,transparent 1px) #f5f5f5'
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

          {/* Header colors */}
          <ComicCard style={{ padding: '0.9rem', borderRadius: 4 }}>
            <SectionHead>🎨 HEADER COLOURS</SectionHead>
            <div className="flex gap-6 flex-wrap">
              <div>
                <div className="slider-label font-caveat text-xs text-ink3 mb-2">Background</div>
                <div className="flex gap-2 flex-wrap">
                  {HEADER_BG_COLORS.map(c => (
                    <div key={c} onClick={() => setHeaderBg(c)} className="swatch-dot" style={{
                      width: 28, height: 28, background: c,
                      border: headerBg === c ? '3px solid #111' : '1.5px solid #aaa',
                      borderRadius: 5, cursor: 'pointer', transition: 'all 0.1s',
                    }} />
                  ))}
                </div>
              </div>
              <div>
                <div className="slider-label font-caveat text-xs text-ink3 mb-2">Text colour</div>
                <div className="flex gap-2 flex-wrap">
                  {HEADER_TEXT_COLORS.map(c => (
                    <div key={c} onClick={() => setHeaderColor(c)} className="swatch-dot" style={{
                      width: 28, height: 28, background: c,
                      border: headerColor === c ? '3px solid #111' : '1.5px solid #aaa',
                      borderRadius: 5, cursor: 'pointer', transition: 'all 0.1s',
                    }} />
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

          {/* Spacing */}
          <ComicCard style={{ padding: '0.9rem', borderRadius: 4 }}>
            <SectionHead>📏 SPACING & STYLE</SectionHead>
            <SliderRow label="Photo gap"  value={spacing} min={0} max={24} onChange={setSpacing} emoji="↕" />
            <SliderRow label="Padding"    value={padding} min={4} max={30} onChange={setPadding} emoji="↔" />
            <SliderRow label="Roundness"  value={radius}  min={0} max={22} onChange={setRadius}  emoji="○" />
          </ComicCard>

          {/* Stickers */}
          <ComicCard style={{ padding: '0.9rem', borderRadius: 4 }}>
            <SectionHead>✨ STICKERS — click to add</SectionHead>
            <div className="sticker-grid grid gap-1.5" style={{ gridTemplateColumns: 'repeat(8, 1fr)' }}>
              {STICKERS.map((s, i) => (
                <button
                  key={i}
                  onClick={() => addSticker(s)}
                  className="border-2 border-ink text-xl cursor-pointer transition-all duration-150 hover:scale-125 hover:bg-white"
                  style={{
                    padding: '3px 0',
                    background: '#f0ece0',
                    borderRadius: 6,
                    lineHeight: 1.4,
                  }}
                >
                  {s}
                </button>
              ))}
            </div>
            <div className="font-caveat text-[0.75rem] text-ink3 text-center mt-2">
              tap to add ✦ drag to place ✦ double-click to remove ♡
            </div>
          </ComicCard>

          {/* Sticker controls */}
          {stickers.length > 0 && (
            <ComicCard style={{ padding: '0.9rem', borderRadius: 4 }}>
              <SectionHead>🔧 STICKER FINE-TUNING</SectionHead>
              <div className="sticker-fine-tune flex flex-col gap-3">
                {stickers.map(s => (
                  <div
                    key={s.id}
                    className="flex items-center gap-3 p-2 rounded"
                    style={{ background: activeSticker === s.id ? '#fdeef4' : '#f0ece0' }}
                  >
                    <span style={{ fontSize: '1.4rem', flexShrink: 0 }}>{s.emoji}</span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-caveat text-[0.72rem] text-ink3 w-8 flex-shrink-0">size</span>
                        <input type="range" min={0.6} max={4.5} step={0.1} value={s.size}
                          onChange={e => updateSticker(s.id, { size: Number(e.target.value) })} />
                        <span className="font-bangers text-[0.7rem] w-7 text-right">{s.size.toFixed(1)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-caveat text-[0.72rem] text-ink3 w-8 flex-shrink-0">rot</span>
                        <input type="range" min={-180} max={180} step={1} value={s.rotate}
                          onChange={e => updateSticker(s.id, { rotate: Number(e.target.value) })} />
                        <span className="font-bangers text-[0.7rem] w-7 text-right">{s.rotate}°</span>
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

          {/* Big download button */}
          <button
            onClick={downloadStrip}
            disabled={downloading}
            className="studio-big-dl font-bangers border-[4px] border-ink text-[1.5rem] tracking-[5px] cursor-pointer transition-all duration-200 w-full py-4 rounded-xl"
            style={{
              background: downloaded ? '#2d7a3a' : '#111',
              color: 'white',
              boxShadow: '8px 8px 0 #555',
              opacity: downloading ? 0.7 : 1,
            }}
            onMouseEnter={e => { if (!downloading) { e.currentTarget.style.transform = 'translate(-4px,-4px)'; e.currentTarget.style.boxShadow = '14px 14px 0 #555' } }}
            onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '8px 8px 0 #555' }}
          >
            {downloading
              ? <span className="flex items-center justify-center gap-3">SAVING <DotLoader /></span>
              : downloaded ? '✓ STRIP SAVED!' : '⬇ DOWNLOAD STRIP'
            }
          </button>

        </div>
      </div>
    </main>
  )
}