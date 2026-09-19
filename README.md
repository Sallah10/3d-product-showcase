# 3D Product Showcase

An interactive, real-time **3D product viewer** for e-commerce, built on the WebGL engine [Three.js](https://threejs.org/) inside a [Next.js](https://nextjs.org/) (App Router) application. Drag to rotate, swipe between products, and add them to a cart — all rendered in the browser with compressed, cached 3D models.

![3DProductShowcase](https://github.com/user-attachments/assets/b81d474e-8c1c-42ba-bef7-e13798bebf39)

## ✨ Features

- **Real-time 3D rendering** – Physically-based materials with an image-based lighting environment (PMREM + `RoomEnvironment`), ACES filmic tone mapping, and auto-rotation via `OrbitControls`.
- **Three products, one viewer** – Switch between sneakers, a smartwatch, and a pair of casual shoes with sliding transitions, dots, and arrow controls.
- **E-commerce UI** – Add to cart with quantities, a sliding cart drawer, total calculation, simulated checkout, favorites, and toast notifications (all animated with Framer Motion).
- **Optimized asset pipeline** – All models are **DRACO-compressed GLB**, reduced from **~108 MB to ~29 MB** (a **73%** size reduction) with zero geometry loss and untouched materials/textures.
- **Smart loading experience** – Progress bar (throttled to avoid main-thread jank), rotating "did you know" facts, and a cache that prevents duplicate downloads.
- **Accessible & SEO-ready** – Icon buttons carry `aria-label`s, with full Open Graph / Twitter metadata and a generated social preview image.

## Tech Stack

| Layer     | Tool                                               |
| --------- | -------------------------------------------------- |
| 3D Engine | Three.js (`WebGLRenderer`, `OrbitControls`, DRACO) |
| Framework | Next.js 16 (App Router), React 19, TypeScript      |
| Styling   | Tailwind CSS 4                                     |
| Animation | Framer Motion                                      |
| Icons     | lucide-react                                       |

## Quick Start

```bash
git clone https://github.com/Sallah10/3d-product-showcase.git
cd 3d-product-showcase
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Other scripts

```bash
npm run build   # production build + type check
npm run start   # serve the production build
npm run lint    # ESLint (Next.js rules + TypeScript)
```

## 🗂️ Project Structure

```
app/
├── layout.tsx                       # Root layout + SEO metadata
├── opengraph-image.tsx              # Auto-generated social preview image
├── page.tsx                         # Home page (renders <Main />)
├── globals.css                      # Tailwind v4 entry
├── components/
│   ├── Main/Main.tsx                # Orchestrator: viewer, cart, controls, toasts
│   ├── ProductViewer/ProductViewer.tsx  # Three.js scene, loading, cleanup
│   └── ProductInfo/ProductInfo.tsx  # Title, price, rating (animated)
├── data/product.ts                  # Product catalog (id, title, price, modelPath)
└── utils/
    ├── modelCache.ts                # Model cache + in-flight dedupe + DRACO loader
    └── loadingFacts.ts              # Loading status texts & rotating facts
public/
├── models/…                         # DRACO-compressed GLB (original textures kept)
└── draco/                           # Self-hosted DRACO decoder (no CDN dependency)
```

## How the 3D pipeline works

1. **`ProductViewer`** creates a `Scene`, `PerspectiveCamera`, and `WebGLRenderer` once, then loads a model from `public/models/`.
2. **`modelCache`** owns a single `GLTFLoader` + `DRACOLoader` (decoder served from `/draco/`, not a third-party CDN). Requests for the same path are deduplicated by returning the same in-flight promise, and every consumer gets a `clone()` so nothing is accidentally disposed while another view uses it.
3. The viewer centers the model with a `Box3` bounds check and scales it to fit the viewport, then exposes orbit controls with damping + auto-rotate. On resize it recomputes the camera aspect from the **container**, not the window.
4. When a product is switched, `Main` prefetches **only the next product** into the cache — no more parallel 100 MB download on first visit; switching stays instant.
5. All scene resources are cleaned up on unmount (animation frame, resize listener, renderer), while cached model geometry is intentionally kept alive.

### Re-optimizing the models

The source models were compressed with [gltf-transform](https://gltf.report/):

```bash
npx @gltf-transform/cli optimize in.glb out.glb \
  --compress draco --palette false --prune-solid-textures false \
  --simplify false --texture-compress false --instance false
```

The aggressive default optimizer (texture re-encoding + material paletteing) was
deliberately avoided — it broke material colors during testing. The pipeline
above only compresses geometry, leaving materials and textures untouched for
guaranteed visual fidelity.

## 📝 Credits

- 3D models are sample assets used for demonstration (`red_snickers`, `sport_watch`, `blue_hills`). _(Add attribution / links to the model sources here before shipping.)_
- Built with [Three.js](https://threejs.org/), [Next.js](https://nextjs.org/), [Tailwind CSS](https://tailwindcss.com/), and [Framer Motion](https://motion.dev/).

## © License

For demonstration / portfolio purposes. Contact the author before using commercially.
