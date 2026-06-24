// qr.ts — maps the QR control form (QrState) into qr-code-styling Options.
// Kept separate from main.ts because the dot / corner option tree is the bulk of
// the QR configuration surface. Consumed by main.ts. Color is fixed and logos are
// not supported (product decision) — neither is user-configurable.
import type {
  Options,
  DotType,
  CornerSquareType,
  CornerDotType,
} from "qr-code-styling";

const COLOR = "#0a0a0a"; // fixed foreground — colors are not user-configurable

export interface QrState {
  data: string;
  size: number;
  dotType: DotType;
  cornerSquareType: CornerSquareType;
  cornerDotType: CornerDotType;
}

export function qrOptions(s: QrState): Options {
  return {
    width: s.size,
    height: s.size,
    type: "svg",
    data: s.data || " ",
    margin: 0, // fixed — no quiet zone
    qrOptions: { errorCorrectionLevel: "L" }, // fixed Low (7%)
    // roundSize:false keeps the dot size fractional so the modules fill `size`
    // exactly. With the default (true) the dot size floors to an integer px and
    // the centered leftover shows as a margin once the QR version grows past
    // ~v2 (≈32 chars), where size/moduleCount stops dividing evenly. SVG output
    // handles fractional coordinates fine.
    dotsOptions: { type: s.dotType, color: COLOR, roundSize: false },
    backgroundOptions: { color: "transparent" }, // always transparent
    cornersSquareOptions: { type: s.cornerSquareType, color: COLOR },
    cornersDotOptions: { type: s.cornerDotType, color: COLOR },
  };
}
