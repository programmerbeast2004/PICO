import { useState } from 'react'
import Bunny from './Bunny.jsx'
import { Star } from './UI.jsx'

const FEATURES = [
  { icon: '📷', title: 'Live Camera Booth', desc: 'Snap 4 photos with countdown, filters & adjustments — just like a real photobooth!' },
  { icon: '🎨', title: 'Filter Magic', desc: 'B&W, Manga, Vintage, Dreamy, Sketch, Rosé — toggle global colour mode too!' },
  { icon: '🎞', title: 'Strip Studio', desc: 'Arrange your shots into a gorgeous strip with custom frames, text & backgrounds.' },
  { icon: '✨', title: 'Drag Stickers', desc: 'Place cute emoji stickers anywhere on the strip. Resize & rotate each one!' },
  { icon: '⬆', title: 'Upload Your Pics', desc: 'Already have photos? Drop them in and go straight to the studio.' },
  { icon: '⬇', title: 'Download Strip', desc: 'Save your strip as a high-quality JPEG to share with everyone you love ♡' },
]

const HOW_IT_WORKS = [
  { step: 1, title: 'Open the booth', desc: 'Grant camera access — nothing is stored.' },
  { step: 2, title: 'Pick your vibe', desc: 'Choose filters like B&W, Manga, Vintage, etc.' },
  { step: 3, title: 'Strike a pose & snap', desc: 'Take up to 4 shots with countdown.' },
  { step: 4, title: 'Customise in Studio', desc: 'Arrange photos, frames & text.' },
  { step: 5, title: 'Decorate with stickers', desc: 'Drag, resize & rotate stickers.' },
  { step: 6, title: 'Download & share ♡', desc: 'Save and share your strip.' },
]

export default function EntryPage({ navigate, bw }) {
  const [hovered, setHovered] = useState(null)
  const [showSteps, setShowSteps] = useState(false)

  const filter = bw ? 'grayscale(1) contrast(1.15)' : 'none'

  return (
    <div className="min-h-screen flex flex-col items-center justify-start px-4 pt-10 pb-6 relative overflow-hidden" style={{ filter }}>

      {/* Stars */}
      <Star style={{ width: 20, height: 20, top: '8%', left: '4%' }} />
      <Star style={{ width: 28, height: 28, top: '12%', right: '6%' }} />

      {/* HERO */}
      <div className="text-center mb-8 flex flex-col items-center">

        {/* Bunny centered */}
        <div className="flex justify-center items-center mb-2">
          <Bunny size={100} wiggle />
        </div>

        {/* Title */}
        <div className="font-bangers text-[3.5rem] tracking-[6px] leading-none">
          PICO
        </div>

        <div className="font-bangers text-[1.6rem] tracking-[5px] text-ink3 mb-2">
          PHOTOBOOTH STUDIO
        </div>

        <div className="font-caveat text-lg text-ink3 mb-4">
          snap ✦ create ✦ share ♡
        </div>

        {/* ENTER BUTTON */}
        <button
          onClick={() => navigate('booth')}
          onMouseEnter={() => setHovered('enter')}
          onMouseLeave={() => setHovered(null)}
          className="font-bangers text-[1.4rem] border-[4px] border-ink bg-ink text-white px-10 py-3"
          style={{
            boxShadow: hovered === 'enter' ? '10px 10px 0 #555' : '6px 6px 0 #555',
            transform: hovered === 'enter' ? 'translate(-4px,-4px)' : 'none',
            borderRadius: 8,
          }}
        >
          📷 ENTER
        </button>

        {/* STEPS BUTTON */}
        <button
          onClick={() => setShowSteps(true)}
          className="mt-3 block mx-auto font-bangers border-[3px] border-ink px-6 py-2 bg-white"
          style={{
            boxShadow: '4px 4px 0 #111',
            borderRadius: 6,
          }}
        >
          ✦ VIEW STEPS
        </button>
      </div>

      {/* FEATURES */}
      <div
        className="grid gap-3 w-full max-w-4xl mt-6"
        style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}
      >
        {FEATURES.map((f, i) => (
          <div
            key={i}
            className="border-[3px] border-ink p-4 bg-white"
            style={{
              boxShadow: hovered === i ? '6px 6px 0 #111' : '4px 4px 0 #111',
              transform: hovered === i ? 'translate(-2px,-2px)' : 'none',
              borderRadius: 6,
            }}
            onMouseEnter={() => setHovered(i)}
            onMouseLeave={() => setHovered(null)}
          >
            <div className="text-2xl mb-1">{f.icon}</div>
            <div className="font-bangers text-sm">{f.title}</div>
            <div className="font-caveat text-xs text-ink3">{f.desc}</div>
          </div>
        ))}
      </div>

      {/* FOOTER */}
      <div className="mt-6 text-xs font-caveat text-ink3 text-center">
        made with ♡ — PICO
      </div>

      {/* MODAL */}
      {showSteps && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4"
          onClick={() => setShowSteps(false)}
        >
          <div
            className="bg-white border-[4px] border-ink p-5 max-w-lg w-full relative"
            style={{
              boxShadow: '8px 8px 0 #111',
              borderRadius: 10,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close */}
            <button
              onClick={() => setShowSteps(false)}
              className="absolute right-4 top-2 font-bangers"
            >
              ✖
            </button>

            <div className="font-bangers text-lg mb-3 text-center">
              HOW IT WORKS ✦
            </div>

            <div className="flex flex-col gap-3 max-h-[60vh] overflow-y-auto">
              {HOW_IT_WORKS.map((step) => (
                <div
                  key={step.step}
                  className="border-[3px] border-ink p-3"
                  style={{
                    boxShadow: '4px 4px 0 #111',
                    borderRadius: 6,
                  }}
                >
                  <div className="font-bangers text-sm">
                    {step.step}. {step.title}
                  </div>
                  <div className="font-caveat text-xs text-ink3">
                    {step.desc}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}