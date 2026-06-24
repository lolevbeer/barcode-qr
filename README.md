# SCANLINE — barcode & QR studio

Client-side generator for 1D barcodes and styled QR codes. No backend, no tracking —
everything runs in the browser, so the data you encode never leaves the page.

All output is rendered on a **transparent background**, so the exported codes drop
onto any surface.

- **Barcodes** via [JsBarcode](https://github.com/lindell/JsBarcode): UPC-A only.
  Pick one of 7 preset UPC-A tiers (1–7) as the data or type a custom value (12 digits).
  Tune height and rotation (0/90/180/270°), and toggle the human-readable value text;
  bar width, quiet zone, text size, and bar color are fixed. Invalid input is reported
  inline. Export SVG.
- **QR codes** via [qr-code-styling](https://github.com/kozakdenys/qr-code-styling):
  dot & eye styles and error-correction level (L/M/Q/H, default Low). Foreground color
  is fixed and logos are not supported. Export SVG.

## Develop

```bash
npm install
npm run dev      # vite dev server (http://localhost:5173)
npm run build    # type-check (tsc) + static build to dist/
npm run preview  # serve the production build
```

Stack: Vite + vanilla TypeScript. The build emits a fully static `dist/` — deploy it
to any static host (Vercel, Netlify, GitHub Pages, an S3 bucket, …).

## Layout

| File             | Purpose                                                      |
| ---------------- | ------------------------------------------------------------ |
| `index.html`     | Markup for both control panels + the preview viewport.       |
| `src/main.ts`    | App shell: tab switching, live render, SVG downloads.        |
| `src/barcode.ts` | JsBarcode wrapper (SVG preview + PNG raster, with validity). |
| `src/qr.ts`      | Maps the QR form to qr-code-styling `Options`.               |
| `src/style.css`  | Visual system (instrument-panel theme).                      |
