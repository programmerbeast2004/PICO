# 🐰 Comic Café Photobooth Studio

A beautiful **2D black-and-white comic-styled photobooth app** built with **React + Tailwind CSS**.  
Snap photos, build a cute strip, add stickers, and download it — all in the browser. No backend needed.

---

## ✨ Features

| Feature | Details |
|---|---|
| 📷 Live Camera Booth | Webcam capture with countdown timer (0/3/5/10s) |
| 🎨 9 Filters | Clear, B&W, Manga, Vintage, Dreamy, Sketch, Rosé, Fade, Comic |
| ☀️ Adjustments | Brightness + Contrast sliders per session |
| 🎞 Snap All 4 | Auto-sequence 4 shots with progress dots |
| ⬆️ Upload Photos | Drag & drop or file picker — go straight to Studio |
| 🎞 Strip Studio | 2/3/4-photo layouts, custom header/footer text, dates |
| 🖼 8 Frame Styles | Classic, Double, Dashed, Dotted, Rounded, Scallop, Polaroid, Shadow |
| 🎨 10 Backgrounds | White, Cream, Black, Blush, Sky, Mint, Lemon, Stripe, Dots, Hatch |
| ✨ 40 Stickers | Tap to add, drag to place, resize & rotate each one |
| ◑ B&W Mode Toggle | Global black-and-white mode (or press `B`) |
| ⬇️ Download | High-quality 4× JPEG export via html2canvas |

---

## 🚀 Run Locally

### Requirements
- **Node.js 18+** — download from [nodejs.org](https://nodejs.org)

### Steps

```bash
# 1. Unzip the project
unzip comic-cafe-photobooth.zip
cd comic-cafe

# 2. Install dependencies (one time only)
npm install

# 3. Start the dev server
npm run dev
```

Then open **http://localhost:3000** in your browser.

> 📸 **Camera note:** Your browser will ask for camera permission. Click **Allow**.  
> Camera only works on `localhost` or HTTPS — not on plain `http://` remote URLs.

---

## 🏗 Build for Production

```bash
npm run build
# Output goes to the `dist/` folder
```

To preview the production build locally:
```bash
npm run preview
# Opens at http://localhost:4173
```

---

## 🌐 Host It Free (3 options)

### Option 1 — Netlify (easiest, drag & drop)

1. Run `npm run build`
2. Go to [netlify.com](https://netlify.com) → **Add new site → Deploy manually**
3. Drag the **`dist/`** folder onto the deploy area
4. Done! You get a live URL instantly ✦

For auto-deploy from GitHub: connect repo, set build command to `npm run build`, publish dir to `dist`.

---

### Option 2 — Vercel (one command)

```bash
# Install Vercel CLI once
npm install -g vercel

# Deploy from the project folder
vercel

# Follow the prompts — it auto-detects Vite
# Your live URL appears at the end ✦
```

---

### Option 3 — GitHub Pages

```bash
# Install gh-pages
npm install --save-dev gh-pages

# Add to package.json scripts:
# "deploy": "gh-pages -d dist"

npm run build
npm run deploy
```

Then enable GitHub Pages in your repo Settings → Pages → branch: `gh-pages`.

---

## 📁 Project Structure

```
comic-cafe/
├── src/
│   ├── components/
│   │   ├── App.jsx          ← Root: routing, B&W toggle, page transitions
│   │   ├── Header.jsx       ← Sticky nav + B&W toggle + photo counter
│   │   ├── EntryPage.jsx    ← Landing / home page
│   │   ├── BoothPage.jsx    ← Camera booth + controls
│   │   ├── StudioPage.jsx   ← Strip editor + download
│   │   ├── Strip.jsx        ← The actual photo strip component
│   │   ├── Bunny.jsx        ← Mascot SVG
│   │   └── UI.jsx           ← Shared atoms (PillBtn, SliderRow, etc.)
│   ├── hooks/
│   │   ├── usePhotos.js     ← Global photo store (pub-sub)
│   │   └── useCamera.js     ← Webcam init hook
│   ├── utils/
│   │   └── constants.js     ← Filters, stickers, frames, colors
│   ├── App.jsx              ← (imported from components)
│   ├── main.jsx             ← React entry point
│   └── index.css            ← Tailwind + global CSS
├── index.html
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
├── netlify.toml             ← Netlify deploy config
├── vercel.json              ← Vercel deploy config
└── package.json
```

---

## ⌨️ Keyboard Shortcuts

| Key | Action |
|---|---|
| `B` | Toggle global B&W mode |

---

## 🎨 Customization Tips

- **Change the brand name:** Edit `topText` default in `StudioPage.jsx` and the logo text in `Header.jsx`
- **Add more stickers:** Add emojis to the `STICKERS` array in `utils/constants.js`
- **Add more filters:** Add entries to `FILTERS` in `constants.js` and matching CSS in `index.css`
- **Change fonts:** Update Google Fonts link in `index.html` and `tailwind.config.js` fontFamily

---

## 💝 Made with love

**Comic Café Photobooth Studio** — your cutest photobooth companion ✦  
Built with React 18 · Vite 5 · Tailwind CSS 3 · html2canvas
