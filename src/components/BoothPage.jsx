import { useState, useRef, useCallback, useEffect } from 'react'
import { useCamera } from '../hooks/useCamera.js'
import { usePhotos } from '../hooks/usePhotos.js'
import { FILTERS, DELAYS, SPEECH_MSGS } from '../utils/constants.js'
import { PillBtn, SectionHead, ComicCard, SliderRow } from './UI.jsx'
import Bunny from './Bunny.jsx'

/* ── Countdown speech bubble ── */
function CountdownOverlay({ count, msg }) {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center z-30 pointer-events-none">
      {msg && (
        <div className="bubble mb-6 animate-pop">{msg}</div>
      )}
      <div
        key={count}
        className="font-bangers text-white animate-count-pop"
        style={{ fontSize: '8rem', lineHeight: 1, textShadow: '5px 5px 0 #000, -1px -1px 0 #000' }}
      >
        {count}
      </div>
    </div>
  )
}

/* ── Shoot button ── */
function ShootBtn({ label, onClick, disabled, secondary }) {
  const [anim, setAnim] = useState(false)
  return (
    <button
      disabled={disabled}
      onClick={() => { if (disabled) return; setAnim(true); setTimeout(() => setAnim(false), 350); onClick(); }}
      className="font-bangers border-[3px] border-ink flex-1 py-3 text-lg tracking-widest cursor-pointer transition-all duration-150"
      style={{
        background: secondary ? '#f0ece0' : '#111',
        color: secondary ? '#111' : 'white',
        borderRadius: 8,
        boxShadow: disabled ? 'none' : '4px 4px 0 #555',
        opacity: disabled ? 0.4 : 1,
        transform: anim ? 'scale(0.93)' : 'none',
      }}
      onMouseEnter={e => { if (!disabled) { e.currentTarget.style.transform = 'translate(-2px,-2px)'; e.currentTarget.style.boxShadow = '6px 6px 0 #555' } }}
      onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = disabled ? 'none' : '4px 4px 0 #555' }}
    >
      {label}
    </button>
  )
}

/* ── Upload zone ── */
function UploadZone({ onUpload, disabled }) {
  const fileRef = useRef(null)
  const [drag, setDrag] = useState(false)
  return (
    <div
      className={`upload-zone w-full text-center py-3 px-4 ${drag ? 'drag-over' : ''} ${disabled ? 'opacity-40 pointer-events-none' : ''}`}
      onClick={() => fileRef.current?.click()}
      onDragOver={e => { e.preventDefault(); setDrag(true) }}
      onDragLeave={() => setDrag(false)}
      onDrop={e => { e.preventDefault(); setDrag(false); onUpload(e.dataTransfer.files) }}
    >
      <input
        ref={fileRef} type="file" accept="image/*" multiple
        style={{ display: 'none' }}
        onChange={e => onUpload(e.target.files)}
      />
      <div className="font-caveat text-sm text-ink3 pointer-events-none">
        {drag ? '✦ Drop here! ♡' : '⬆ Upload your own photos — drag or click'}
      </div>
    </div>
  )
}

export default function BoothPage({ navigate, bw }) {
  const { videoRef, ready, error } = useCamera()
  const canvasRef = useRef(null)
  const [photos, setPhotos] = usePhotos()

  const [filter, setFilter]       = useState(FILTERS[0])
  const [delay, setDelay]         = useState(0)
  const [shooting, setShooting]   = useState(false)
  const [countdown, setCountdown] = useState(null)
  const [speech, setSpeech]       = useState('')
  const [flash, setFlash]         = useState(false)
  const [seqDots, setSeqDots]     = useState(-1)
  const [brightness, setBrightness] = useState(100)
  const [contrast, setContrast]   = useState(100)

  const globalFilter = bw ? 'grayscale(1) contrast(1.15)' : 'none'
  const videoFilter  = `${filter.css} brightness(${brightness}%) contrast(${contrast}%) ${bw ? 'grayscale(1)' : ''}`

  const doCountdown = useCallback((secs) => new Promise(res => {
    if (secs === 0) { res(); return }
    let n = secs
    setSpeech(SPEECH_MSGS[Math.floor(Math.random() * SPEECH_MSGS.length)])
    setCountdown(n)
    const iv = setInterval(() => {
      n--
      if (n <= 0) { clearInterval(iv); setCountdown(null); setSpeech(''); res() }
      else setCountdown(n)
    }, 1000)
  }), [])

  const captureFrame = useCallback(() => {
    const v = videoRef.current
    if (!v) return null
    const c = canvasRef.current
    c.width  = v.videoWidth  || 640
    c.height = v.videoHeight || 480
    const ctx = c.getContext('2d')
    ctx.filter = videoFilter
    ctx.drawImage(v, 0, 0)
    return c.toDataURL('image/jpeg', 0.93)
  }, [videoRef, videoFilter])

  const triggerFlash = () => { setFlash(true); setTimeout(() => setFlash(false), 200) }

  const snapOne = useCallback(async () => {
    if (shooting || !ready || photos.length >= 4) return
    setShooting(true)
    await doCountdown(delay)
    triggerFlash()
    const url = captureFrame()
    if (url) setPhotos(p => [...p, { url, filter: filter.id, label: filter.label }])
    setShooting(false)
  }, [shooting, ready, photos.length, delay, doCountdown, captureFrame, filter, setPhotos])

  const snapAll = useCallback(async () => {
    if (shooting || !ready) return
    setShooting(true)
    setPhotos([])
    const d = delay > 0 ? delay : 3
    for (let i = 0; i < 4; i++) {
      setSeqDots(i)
      await doCountdown(d)
      triggerFlash()
      const url = captureFrame()
      if (url) setPhotos(p => [...p, { url, filter: filter.id, label: filter.label }])
      if (i < 3) await new Promise(r => setTimeout(r, 500))
    }
    setSeqDots(-1)
    setShooting(false)
  }, [shooting, ready, delay, doCountdown, captureFrame, filter, setPhotos])

  const handleUpload = (files) => {
    if (!files?.length) return
    Array.from(files).slice(0, 4 - photos.length).forEach(file => {
      const reader = new FileReader()
      reader.onload = e => {
        setPhotos(p => p.length < 4 ? [...p, { url: e.target.result, filter: 'pf-none', label: 'Uploaded' }] : p)
      }
      reader.readAsDataURL(file)
    })
  }

  return (
    <main className="max-w-[1100px] mx-auto px-4 py-8" style={{ filter: globalFilter }}>
      {/* Title */}
      <div className="text-center mb-8 animate-slide-u">
        <div className="font-bangers text-[2.8rem] tracking-[6px] leading-none">📷 PHOTO BOOTH</div>
        <div className="font-caveat text-ink3 mt-1">snap 4 photos → head to Studio to build your strip ✨</div>
      </div>

      <div className="flex gap-6 flex-wrap justify-center items-start">

        {/* ── Camera column ── */}
        <div className="flex flex-col gap-4 items-center">

          {/* Camera frame */}
          <ComicCard
            className="shadow-comic-lg overflow-hidden"
            style={{ width: 440, maxWidth: '92vw', borderRadius: 6 }}
          >
            {/* Panel header */}
            <div className="font-bangers text-sm tracking-[5px] bg-ink text-paper text-center py-1.5 border-b-[3px] border-ink">
              ✦ LIVE VIEW ✦
            </div>

            <div style={{ aspectRatio: '4/3', background: '#111', position: 'relative', overflow: 'hidden' }}>
              {!error && (
                <video
                  ref={videoRef} autoPlay playsInline muted
                  style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', filter: videoFilter }}
                />
              )}

              {/* Scanline */}
              {ready && !error && <div className="scan-line" />}

              {/* Camera error */}
              {error && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-[#111]">
                  <div className="animate-float"><Bunny size={80} /></div>
                  <div className="font-caveat text-center text-[#aaa] px-6 text-lg">
                    Camera access needed!<br />
                    <span className="text-sm text-[#777]">Allow it in browser settings ♡</span>
                  </div>
                </div>
              )}

              {/* Speech bubble */}
              {speech && countdown !== null && (
                <div className="absolute top-10 left-1/2 -translate-x-1/2 z-30">
                  <div className="bubble animate-pop">{speech}</div>
                </div>
              )}

              {/* Countdown number */}
              {countdown !== null && (
                <CountdownOverlay count={countdown} msg={null} />
              )}

              {/* Flash */}
              {flash && (
                <div className="absolute inset-0 bg-white z-40" style={{ animation: 'flashIn 0.2s ease forwards' }} />
              )}

              {/* Sequence progress dots */}
              {seqDots >= 0 && (
                <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-2 z-20">
                  {[0, 1, 2, 3].map(i => (
                    <div key={i} style={{
                      width: 10, height: 10, borderRadius: '50%',
                      border: '2px solid white',
                      background: i <= seqDots ? 'white' : 'transparent',
                      transition: 'background 0.25s',
                    }} />
                  ))}
                </div>
              )}

              <canvas ref={canvasRef} style={{ display: 'none' }} />
            </div>
          </ComicCard>

          {/* Shoot buttons */}
          <div className="flex gap-3 w-full" style={{ maxWidth: 440 }}>
            <ShootBtn
              label="📸 SNAP ONE"
              disabled={shooting || !ready || photos.length >= 4}
              onClick={snapOne}
              secondary={false}
            />
            <ShootBtn
              label="🎞 SNAP ALL 4"
              disabled={shooting || !ready}
              onClick={snapAll}
              secondary={true}
            />
          </div>

          {/* Upload */}
          <UploadZone onUpload={handleUpload} disabled={photos.length >= 4} />

          {/* Tip */}
          <div className="font-caveat text-xs text-ink3 text-center" style={{ maxWidth: 440 }}>
            ✦ Snap All 4 uses 3s auto-countdown between shots
          </div>
        </div>

        {/* ── Controls column ── */}
        <div className="flex flex-col gap-4" style={{ flex: '1 1 240px', minWidth: 220, maxWidth: 340 }}>

          {/* Filters */}
          <ComicCard style={{ padding: '0.9rem', borderRadius: 4 }}>
            <SectionHead>🎨 CAMERA FILTER</SectionHead>
            <div className="grid grid-cols-3 gap-2">
              {FILTERS.map(f => (
                <PillBtn key={f.id} active={filter.id === f.id} onClick={() => setFilter(f)}>
                  {f.label}
                </PillBtn>
              ))}
            </div>
          </ComicCard>

          {/* Adjustments */}
          <ComicCard style={{ padding: '0.9rem', borderRadius: 4 }}>
            <SectionHead>✦ ADJUSTMENTS</SectionHead>
            <SliderRow label="Brightness" value={brightness} min={50} max={160} onChange={setBrightness} emoji="☀️" />
            <SliderRow label="Contrast"   value={contrast}   min={50} max={200} onChange={setContrast}   emoji="◑" />
          </ComicCard>

          {/* Timer */}
          <ComicCard style={{ padding: '0.9rem', borderRadius: 4 }}>
            <SectionHead>⏱ COUNTDOWN TIMER</SectionHead>
            <div className="flex gap-2 flex-wrap">
              {DELAYS.map(d => (
                <PillBtn key={d} active={delay === d} onClick={() => setDelay(d)}>
                  {d === 0 ? 'Instant' : `${d}s`}
                </PillBtn>
              ))}
            </div>
          </ComicCard>

          {/* Captured thumbnails */}
          <ComicCard style={{ padding: '0.9rem', borderRadius: 4 }}>
            <SectionHead>🖼 CAPTURED ({photos.length}/4)</SectionHead>
            {photos.length === 0 ? (
              <div className="font-caveat text-ink3 text-center py-4 text-sm">
                No photos yet~<br />snap or upload ♡
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                {photos.map((p, i) => (
                  <div key={i} className="relative animate-pop">
                    <img
                      src={p.url} alt={`Photo ${i + 1}`}
                      className="w-full border-[2.5px] border-ink block"
                      style={{ aspectRatio: '4/3', objectFit: 'cover' }}
                    />
                    <span className="font-bangers absolute top-1 left-2 text-[0.65rem] text-black/30">{i + 1}</span>
                    <button
                      onClick={() => setPhotos(prev => prev.filter((_, idx) => idx !== i))}
                      className="absolute top-1 right-1 w-5 h-5 rounded-full bg-ink text-paper border-none cursor-pointer text-[0.6rem] flex items-center justify-center"
                    >✕</button>
                    <div className="font-caveat text-[0.68rem] text-center text-ink3 bg-paper2 py-px">{p.label}</div>
                  </div>
                ))}
              </div>
            )}
            {photos.length > 0 && (
              <button
                onClick={() => setPhotos([])}
                className="font-caveat border-2 border-ink w-full mt-3 py-1 text-sm bg-white cursor-pointer rounded transition-colors duration-150 hover:bg-blush"
              >
                ✕ Clear all photos
              </button>
            )}
          </ComicCard>

          {/* Go to studio */}
          {photos.length > 0 && (
            <button
              onClick={() => navigate('studio')}
              className="font-bangers border-[3px] border-ink bg-ink text-paper w-full py-3 text-xl tracking-[4px] cursor-pointer rounded-lg animate-bounce-in transition-all duration-150"
              style={{ boxShadow: '5px 5px 0 #555' }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translate(-2px,-2px)'; e.currentTarget.style.boxShadow = '8px 8px 0 #555' }}
              onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '5px 5px 0 #555' }}
            >
              🎞 GO TO STUDIO →
            </button>
          )}
        </div>
      </div>

      <style>{`
        @keyframes countPop { 0%{ transform: scale(0.2); opacity: 0; } 50%{ transform: scale(1.35); opacity: 1; } 75%{ transform: scale(0.9); } 100%{ transform: scale(1); } }
        @keyframes flashIn  { 0%{ opacity: 1; } 100%{ opacity: 0; } }
      `}</style>
    </main>
  )
}
