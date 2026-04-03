export const FILTERS = [
  { id: 'pf-bw',     label: 'B&W',     css: 'grayscale(1) contrast(1.2)' },
  { id: 'pf-manga',  label: 'Manga',   css: 'grayscale(1) contrast(1.9) brightness(1.1)' },
  { id: 'pf-vintage',label: 'Vintage', css: 'sepia(0.7) contrast(1.1) brightness(0.9)' },
  { id: 'pf-dreamy', label: 'Dreamy',  css: 'brightness(1.12) saturate(1.4) contrast(0.88)' },
  { id: 'pf-sketch', label: 'Sketch',  css: 'grayscale(1) contrast(2.2) brightness(1.15)' },
  { id: 'pf-rose',   label: 'Rosé',    css: 'saturate(1.5) hue-rotate(310deg) brightness(1.06)' },
  { id: 'pf-fade',   label: 'Fade',    css: 'contrast(0.78) brightness(1.18) saturate(0.45)' },
  { id: 'pf-comic',  label: 'Comic',   css: 'contrast(1.6) saturate(0.15) brightness(1.08)' },
]

export const FRAMES = [
  { id: 'fr-classic',  label: 'Classic'  },
  { id: 'fr-double',   label: 'Double'   },
  { id: 'fr-dashed',   label: 'Dashed'   },
  { id: 'fr-dotted',   label: 'Dotted'   },
  { id: 'fr-rounded',  label: 'Rounded'  },
  { id: 'fr-scallop',  label: 'Scallop'  },
  { id: 'fr-polaroid', label: 'Polaroid' },
  { id: 'fr-shadow',   label: 'Shadow'   },
]

export const BG_OPTIONS = [
  { label: 'White',   value: '#ffffff' },
  { label: 'Cream',   value: '#faf8f3' },
  { label: 'Black',   value: '#111111' },
  { label: 'Blush',   value: '#fdeef4' },
  { label: 'Sky',     value: '#eef4fd' },
  { label: 'Mint',    value: '#edf7ef' },
  { label: 'Lemon',   value: '#fefbe8' },
  { label: 'Stripe',  value: 'stripe'  },
  { label: 'Dots',    value: 'dots'    },
  { label: 'Hatch',   value: 'hatch'   },
]

export const STICKERS = [
  // 🌸 ORIGINAL 40
  '⭐','♡','✦','🌸','☁️','⚡','🦋','✿','💌','🎀',
  '✰','🌙','🍓','🌈','🎵','💫','🧸','🌷','🐾','💎',
  '🍀','🌻','🫧','🎀','🍡','🧁','🌺','🦊','🐰','🍄',
  '🌟','💐','🫶','🎏','🕊️','🫐','🌼','🍒','🧋','🎐',

  // 💕 POOKIE + EXTRA CUTE 40
  '💗','💖','💘','💝','💞','💕','💓','💟','❣️','💌',
  '🥺','👉👈','🥹','😚','😽','😻','😿','😺','😸','😹',
  '🧸','🧶','🪄','🎀','🫂','🛌','☁️','🫧','🌸','🌷',
  '🌹','🌺','🌼','🌻','🍓','🍒','🫐','🍡','🧁','🐻'
]

export const DELAYS = [0, 3, 5, 10]

export const SPEECH_MSGS = [
  'Smile! ✨', 'Say cheese!', 'Look cute~', 'Hehe~ ♡',
  'Ready?', "You're gorgeous!", '3…2…1!', 'Wink!',
  'Strike a pose!', 'Super cute!', 'Yay! ♡',
]

export const HEADER_BG_COLORS = [
  '#111111','#ffffff','#fdeef4','#eef4fd','#edf7ef','#fefbe8','#c8f0e4','#f4d0e8',
]

export const HEADER_TEXT_COLORS = [
  '#ffffff','#111111','#f4b8c8','#b8d4f4','#b8f4c8','#ffe08a',
]

export const DATE_STR = new Date().toLocaleDateString('en-US', {
  month: 'short', day: 'numeric', year: 'numeric'
})
