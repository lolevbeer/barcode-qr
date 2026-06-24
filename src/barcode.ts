// barcode.ts — thin wrapper over JsBarcode.
// Renders 1D barcodes into an <svg> (preview + SVG export), surfacing JsBarcode's
// `valid` callback as a typed result instead of a partially-drawn/thrown render.
// Consumed by src/main.ts.
import JsBarcode from "jsbarcode";

export interface BarcodeOptions {
  height: number;
  displayValue: boolean;
  rotation: number; // 0 | 90 | 180 | 270, baked into the rendered SVG
}

export interface RenderResult {
  ok: boolean;
  error?: string;
}

const common = (opts: BarcodeOptions) => ({
  format: "UPC", // UPC-A only
  width: 1, // fixed module (single bar) width
  height: opts.height,
  displayValue: opts.displayValue,
  fontSize: 20, // fixed value-text size
  textMargin: 4,
  margin: 0, // fixed quiet zone
  lineColor: "#000000", // fixed black — bar color is not user-configurable
  background: "transparent", // codes always export with a transparent background
  font: "Poppins, sans-serif", // loaded via Google Fonts in index.html
});

/** Render into the preview SVG. Returns ok:false (and clears the SVG) when the
 *  value is invalid for the chosen symbology. */
export function renderBarcode(svg: SVGElement, value: string, opts: BarcodeOptions): RenderResult {
  if (!value) {
    svg.replaceChildren();
    return { ok: false, error: "Enter a value to encode." };
  }
  let valid = true;
  try {
    JsBarcode(svg, value, { ...common(opts), valid: (v: boolean) => (valid = v) });
  } catch (e) {
    svg.replaceChildren();
    return { ok: false, error: (e as Error).message };
  }
  if (!valid) {
    svg.replaceChildren();
    return { ok: false, error: `"${value}" is not a valid UPC-A code (12 digits).` };
  }
  applyRotation(svg, opts.rotation);
  return { ok: true };
}

/** Bake a 0/90/180/270° rotation into the rendered SVG so preview and export match.
 *  Swaps the canvas dimensions for quarter turns so the rotated content isn't clipped. */
function applyRotation(svg: SVGElement, deg: number): void {
  if (!deg) return;
  const w = parseFloat(svg.getAttribute("width") ?? "");
  const h = parseFloat(svg.getAttribute("height") ?? "");
  if (!w || !h) return;
  const quarter = deg % 180 !== 0;
  const newW = quarter ? h : w;
  const newH = quarter ? w : h;
  const g = document.createElementNS("http://www.w3.org/2000/svg", "g");
  g.setAttribute(
    "transform",
    `translate(${newW / 2} ${newH / 2}) rotate(${deg}) translate(${-w / 2} ${-h / 2})`,
  );
  while (svg.firstChild) g.appendChild(svg.firstChild);
  svg.appendChild(g);
  svg.setAttribute("width", `${newW}px`);
  svg.setAttribute("height", `${newH}px`);
  svg.setAttribute("viewBox", `0 0 ${newW} ${newH}`);
}
