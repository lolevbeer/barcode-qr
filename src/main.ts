// main.ts — app shell: tab switching, live re-render of the active generator,
// and download wiring. Holds no encoding logic itself — it only reads
// the DOM controls; barcode/QR specifics live in ./barcode and ./qr.
import "./style.css";
import QRCodeStyling from "qr-code-styling";
import { renderBarcode, type BarcodeOptions } from "./barcode";
import { qrOptions, type QrState } from "./qr";

// ---- tiny DOM helpers ----
const $ = <T extends HTMLElement = HTMLElement>(sel: string): T =>
  document.querySelector(sel) as T;
const field = (id: string) =>
  $(`#${id}`) as HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;
const val = (id: string) => field(id).value;
const num = (id: string) => parseFloat(val(id));
const checked = (id: string) => ($(`#${id}`) as HTMLInputElement).checked;

function download(href: string, name: string) {
  const a = document.createElement("a");
  a.href = href;
  a.download = name;
  document.body.appendChild(a);
  a.click();
  a.remove();
}

// ---- mode switching ----
const MODES = ["barcode", "qr"] as const;
type Mode = (typeof MODES)[number];
let mode: Mode = "barcode";

function setMode(m: Mode) {
  mode = m;
  document
    .querySelectorAll<HTMLElement>("[data-mode]")
    .forEach((el) => el.classList.toggle("active", el.dataset.mode === m));
  document.querySelectorAll<HTMLElement>("[data-panel]").forEach((el) => {
    el.hidden = el.dataset.panel !== m;
  });
  render();
}

// ---- barcode ----
// Preset UPC-A product codes selectable by tier 1–7. Loading a tier just fills the
// editable Data field, so any tier can be overridden by typing a custom value.
const TIERS = [
  "850051366040",
  "860009737631",
  "860009737617",
  "850051366156",
  "850051366170",
  "850051366224",
  "860009737600",
];

const barcodeSvg = $("#barcode") as unknown as SVGElement;
const barcodeError = $("#bc-error");
const barcodeViewport = barcodeSvg.closest(".viewport") as HTMLElement;

function barcodeOpts(): BarcodeOptions {
  return {
    height: num("bc-height"),
    displayValue: checked("bc-display"),
    rotation: num("bc-rotation"),
  };
}

function renderBarcodeMode() {
  const res = renderBarcode(barcodeSvg, val("bc-data"), barcodeOpts());
  barcodeError.textContent = res.ok ? "" : res.error ?? "";
  barcodeViewport.classList.toggle("invalid", !res.ok);
}

// ---- qr ----
const qrContainer = $("#qr-canvas");
let qr: QRCodeStyling | null = null;

// QR data comes from one of two sources: a fully custom URL, or the Lolev beer
// page — a fixed prefix plus a slug. In beer mode the slug also names the export.
const BEER_PREFIX = "https://lolev.beer/beer/";
const qrSlug = () => val("qr-slug").trim();
const qrIsBeer = () => val("qr-source") === "beer";
const qrData = () => (qrIsBeer() ? BEER_PREFIX + qrSlug() : val("qr-data"));

function qrState(): QrState {
  return {
    data: qrData(),
    size: num("qr-size"),
    dotType: val("qr-dot-type") as QrState["dotType"],
    cornerSquareType: val("qr-cs-type") as QrState["cornerSquareType"],
    cornerDotType: val("qr-cd-type") as QrState["cornerDotType"],
  };
}

function renderQrMode() {
  const opts = qrOptions(qrState());
  if (!qr) {
    qr = new QRCodeStyling(opts);
    qr.append(qrContainer);
  } else {
    qr.update(opts);
  }
}

function render() {
  if (mode === "barcode") renderBarcodeMode();
  else renderQrMode();
}

// ---- downloads (SVG only) ----
$("#bc-download-svg").addEventListener("click", () => {
  if (!barcodeSvg.childNodes.length) return;
  const svg = new XMLSerializer().serializeToString(barcodeSvg);
  // Name after the tier when the data is still a preset; otherwise the (overridden) number.
  const data = val("bc-data");
  const tier = TIERS.indexOf(data);
  const name = tier >= 0 ? `Tier ${tier + 1}` : data;
  download(
    "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg),
    `${name}.svg`,
  );
});
$("#qr-download-svg").addEventListener("click", () =>
  qr?.download({
    name: (qrIsBeer() && qrSlug()) || "qr-code",
    extension: "svg",
  }),
);

// ---- qr source toggle (custom URL vs. Lolev beer slug) ----
$("#qr-source").addEventListener("change", () => {
  const src = val("qr-source");
  document
    .querySelectorAll<HTMLElement>("[data-qr-src]")
    .forEach((el) => (el.hidden = el.dataset.qrSrc !== src));
  render();
});

// ---- barcode tier presets ----
$("#bc-tier").addEventListener("change", () => {
  field("bc-data").value = TIERS[+val("bc-tier") - 1] ?? "";
  render();
});

// ---- wire controls + tabs ----
document
  .querySelectorAll("[data-panel] input, [data-panel] select, [data-panel] textarea")
  .forEach((el) => el.addEventListener("input", render));
document
  .querySelectorAll<HTMLElement>("[data-mode]")
  .forEach((el) => el.addEventListener("click", () => setMode(el.dataset.mode as Mode)));

setMode("barcode");
