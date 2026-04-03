import { useState, useEffect } from 'react'
import Header from './components/Header.jsx'
import EntryPage from './components/EntryPage.jsx'
import BoothPage from './components/BoothPage.jsx'
import StudioPage from './components/StudioPage.jsx'

// Decorative halftone + star background
function Background() {
  return (
    <div
      className="fixed inset-0 -z-10"
      style={{
        backgroundColor: '#faf8f3',
        backgroundImage: 'radial-gradient(circle, #c5bda8 0.7px, transparent 0.7px)',
        backgroundSize: '14px 14px',
      }}
    />
  )
}

// Decorative corner accents
function CornerStars() {
  const positions = [
    { top: '7%',  left: '2%',  size: 18, delay: '0s'    },
    { top: '10%', right: '3%', size: 24, delay: '-3s'   },
    { top: '45%', left: '1%',  size: 13, delay: '-6s'   },
    { top: '70%', right: '2%', size: 20, delay: '-1.5s' },
    { top: '88%', left: '4%',  size: 15, delay: '-4.5s' },
    { top: '30%', right: '1.5%', size: 10, delay: '-2s' },
  ]
  return (
    <>
      {positions.map((p, i) => (
        <div
          key={i}
          className="fixed pointer-events-none opacity-20"
          style={{
            ...p,
            width: p.size,
            height: p.size,
            animation: `spinStar 12s linear ${p.delay} infinite`,
            zIndex: 0,
          }}
        >
          <svg viewBox="0 0 24 24" fill="#111" width="100%" height="100%">
            <polygon points="12,2 15,9 22,9 16,14 18,21 12,16 6,21 8,14 2,9 9,9" />
          </svg>
        </div>
      ))}
      <style>{`@keyframes spinStar { from{ transform: rotate(0); } to{ transform: rotate(360deg); } }`}</style>
    </>
  )
}

// Page transition wrapper
function PageTransition({ children, animKey }) {
  return (
    <div
      key={animKey}
      style={{ animation: 'pageIn 0.42s cubic-bezier(.25,.8,.25,1) both' }}
    >
      {children}
      <style>{`@keyframes pageIn { from{ opacity:0; transform: translateY(20px); } to{ opacity:1; transform: translateY(0); } }`}</style>
    </div>
  )
}

export default function App() {
  const [page, setPage]   = useState('entry')
  const [animKey, setAnimKey] = useState(0)
  const [bw, setBw]       = useState(false)

  const navigate = (p) => {
    setAnimKey(k => k + 1)
    setPage(p)
  }

  // Keyboard shortcut: B for B&W toggle
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'b' && !e.ctrlKey && !e.metaKey && e.target.tagName !== 'INPUT') {
        setBw(prev => !prev)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  return (
    <>
      <Background />
      <CornerStars />

      <div className="relative z-10 min-h-screen">
        <Header page={page} navigate={navigate} bw={bw} setBw={setBw} />

        <PageTransition animKey={animKey}>
          {page === 'entry'  && <EntryPage  navigate={navigate} bw={bw} />}
          {page === 'booth'  && <BoothPage  navigate={navigate} bw={bw} />}
          {page === 'studio' && <StudioPage navigate={navigate} bw={bw} />}
        </PageTransition>
      </div>
    </>
  )
}
