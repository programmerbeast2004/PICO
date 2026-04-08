import Bunny from './Bunny.jsx'

// Returns inline bg style for strip background option
export function stripBgStyle(bgColor) {
  if (bgColor === 'stripe') return {
    backgroundImage: 'repeating-linear-gradient(45deg,#fff,#fff 5px,#f0ece0 5px,#f0ece0 10px)',
  }
  if (bgColor === 'dots') return {
    backgroundImage: 'radial-gradient(circle,#bbb 0.85px,transparent 0.85px)',
    backgroundSize: '8px 8px',
    backgroundColor: '#f5f5f5',
  }
  if (bgColor === 'hatch') return {
    backgroundImage: 'repeating-linear-gradient(0deg,transparent,transparent 7px,#ddd 7px,#ddd 8px),repeating-linear-gradient(90deg,transparent,transparent 7px,#ddd 7px,#ddd 8px)',
    backgroundColor: '#fafafa',
  }
  return { background: bgColor }
}

export default function Strip({
  stripRef,
  photos,
  slotCount,
  topText,
  botText,
  dateText,
  showDate,
  bgColor,
  frame,
  headerBg,
  headerColor,
  spacing,
  padding,
  radius,
  stickers,
  activeSticker,
  onStickerMouseDown,
  onStickerTouchStart,
  onStickerDoubleClick,
  bw,
}) {
  const displayCount  = Math.min(slotCount, 4)
  const activePhotos  = photos.slice(0, displayCount)
  const bg            = stripBgStyle(bgColor)
  const darkBg        = bgColor === '#111111'
  const filter        = bw ? 'grayscale(1) contrast(1.1)' : 'none'

  return (
    <div
      ref={stripRef}
      className="shadow-comic-lg"
      style={{
        width: 210,
        ...bg,
        border: '3px solid #111',
        padding: padding,
        display: 'flex',
        flexDirection: 'column',
        gap: spacing,
        position: 'relative',
        borderRadius: radius,
        userSelect: 'none',
        filter,
      }}
    >
      {/* Header */}
      <div
        className="font-bangers text-center tracking-[5px] text-[0.9rem] border-b-[2.5px] border-ink flex-shrink-0"
        style={{
          background: headerBg,
          color: headerColor,
          padding: '5px 4px',
          margin: `-${padding}px -${padding}px ${spacing}px`,
          borderRadius: `${Math.max(0, radius - 3)}px ${Math.max(0, radius - 3)}px 0 0`,
        }}
      >
        {topText || 'PHOTO BOOTH'}
      </div>

      {/* Photo slots */}
      {Array.from({ length: displayCount }).map((_, i) => {
        const photo = activePhotos[i]
        return (
          <div
            key={i}
            className={`relative overflow-hidden ${frame}`}
            style={{
              aspectRatio: '4/3',
              borderRadius: radius > 0 ? Math.max(0, radius - 4) : 0,
            }}
          >
            {photo ? (
              <img
                src={photo.url}
                alt={`Photo ${i + 1}`}
                style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
              />
            ) : (
              <div
                className="w-full h-full flex items-center justify-center"
                style={{ background: '#eee' }}
              >
                <span className="font-bangers text-[0.8rem]" style={{ color: '#ccc' }}>EMPTY</span>
              </div>
            )}
            <span
              className="font-bangers absolute top-1 left-2 text-[0.6rem]"
              style={{ color: 'rgba(0,0,0,0.22)' }}
            >{i + 1}</span>
          </div>
        )
      })}

      {/* Footer */}
      <div className="flex flex-col items-center gap-1" style={{ marginTop: spacing / 2 }}>
        <div
          className="font-caveat text-center font-semibold"
          style={{ fontSize: '0.82rem', color: darkBg ? '#bbb' : '#555' }}
        >
          {botText}
        </div>
        {showDate && (
          <div
            className="font-caveat text-center"
            style={{ fontSize: '0.7rem', color: darkBg ? '#888' : '#999' }}
          >
            {dateText}
          </div>
        )}
        <div style={{ marginTop: 3, opacity: 0.22 }}>
          <Bunny size={22} />
        </div>
      </div>

      {/* Sticker layer */}
      {stickers.map(s => (
        <div
          key={s.id}
          className={`sticker-item ${activeSticker === s.id ? 'ring-active' : ''}`}
          onMouseDown={e => onStickerMouseDown(e, s.id)}
          onTouchStart={e => onStickerTouchStart(e, s.id)}
          onDoubleClick={() => onStickerDoubleClick(s.id)}
          style={{
            left: s.x,
            top: s.y,
            fontSize: `${s.size}rem`,
            transform: `rotate(${s.rotate}deg)`,
            zIndex: activeSticker === s.id ? 50 : 20,
            touchAction: "none"
          }}
        >
          {s.emoji}
        </div>
      ))}
    </div>
  )
}
