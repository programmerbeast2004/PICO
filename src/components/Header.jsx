import Bunny from './Bunny.jsx'
//import { BWToggle } from './UI.jsx'
import { usePhotos } from '../hooks/usePhotos.js'

const TABS = [
  { id: 'entry',  icon: ' ', label: 'HOME'   },
  { id: 'booth',  icon: ' ', label: 'BOOTH'  },
  { id: 'studio', icon: ' ', label: 'STUDIO' },
]

export default function Header({ page, navigate, bw, setBw }) {
  const [photos] = usePhotos()

  return (
    <header
      className="sticky top-0 z-50 bg-white border-b-[3px] border-ink"
      style={{ boxShadow: '0 3px 0 #111' }}
    >
      <div className="max-w-[1200px] mx-auto px-4 py-2 flex items-center justify-between gap-3 flex-wrap">

        {/* Logo */}
        <button
          onClick={() => navigate('entry')}
          className="flex items-center gap-2 cursor-pointer group"
          style={{ background: 'none', border: 'none', padding: 0 }}
        >
          <div className="animate-float">
            <Bunny size={42} wiggle />
          </div>
          <div className="text-left">
            <div className="font-bangers text-2xl leading-none tracking-[10px]">PICO</div>
            <div className="font-caveat text-[0.72rem] text-ink3 tracking-widest">✦ photobooth studio ✦</div>
          </div>
        </button>

        {/* Nav tabs */}
        <nav className="flex gap-1 items-end">
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => navigate(tab.id)}
              className="font-bangers tracking-widest cursor-pointer transition-all duration-150 border-[2.5px] border-ink px-4 py-1.5 text-[0.95rem]"
              style={{
                background: page === tab.id ? '#111' : '#f0ece0',
                color: page === tab.id ? 'white' : '#111',
                borderRadius: '6px 6px 0 0',
                borderBottom: page === tab.id ? '2.5px solid white' : '2.5px solid #111',
                marginBottom: page === tab.id ? '-3px' : '0',
                boxShadow: page === tab.id ? 'none' : '2px 2px 0 #aaa',
              }}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </nav>

        {/* Right controls */}
        <div className="flex items-center gap-3">
          

          {/* Photo counter */}
          <div
            className="font-caveat border-2 border-ink px-3 py-1 rounded-full text-sm font-bold transition-all duration-300"
            style={{
              background: photos.length === 4 ? '#111' : '#f0ece0',
              color: photos.length === 4 ? 'white' : '#111',
              boxShadow: photos.length === 4 ? '2px 2px 0 #555' : 'none',
            }}
          >
            {photos.length}/4 {photos.length === 4 ? '✦ ready!' : '○'.repeat(4 - photos.length)}
          </div>
        </div>
      </div>
    </header>
  )
}
