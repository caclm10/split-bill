# Split Bill

A perfectly stateless, offline-first web application designed to compute bill splitting flawlessly via peer-to-peer web links instead of centralized databases. 

## Capabilities

1. **Zero Database Configuration**: State is minified locally, compressed with `lz-string`, and encoded securely directly into the URL `?bill=` query parameter. This guarantees total data sovereignty across participants.
2. **Proportional Distribution Engines**: Complex tax/surcharge mapping and discount parameters correctly allocate splits proportionally based strictly on an individual's item sub-totals dynamically across custom amounts.
3. **PWA Capable (Native Mobile Experience)**: Implemented flawlessly utilizing `vite-plugin-pwa` pushing `sw.js` manifests safely caching your entire app directly on device memory avoiding constant network reliance safely.
4. **Local IndexedDB Memory**: Full bill history safely loads natively without pushing string representations into the address bar constantly letting you freely manage locally generated setups without server calls via `<HistoryList />`.

## Tech Stack
* **Framework**: React 19 + TypeScript + Vite
* **Styling**: Tailwind CSS & Vanilla `index.css` global mapping
* **Components Framework**: `shadcn/ui` 
* **Database**: Decentralized URL Hashes + Client-side `IndexedDB` (`idb` wrapper)
* **Compression**: `lz-string`

## Local Development Setup

To kickstart the environment on your native machine:

```bash
# 1. Install dependencies via bun
bun install

# 2. Fire up the local dev server
bun dev
```

### Production Build / PWA Emulation
To run a local emulation of the server manifesting the true PWA experience checking local asset fetching correctly:

```bash
bun run build
bun run preview
```

## Structure
- `src/lib/store.ts` handles your intricate state compression and string inflation algorithms allowing the offline behavior.
- `src/lib/calculation.ts` represents the core mathematical brain operating the proportion engine assigning fractions.
- `src/App.tsx` behaves as an intuitive wizard routing setups seamlessly between pure configuration layout mode and readonly display modes.
