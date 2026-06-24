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
    dotsOptions: { type: s.dotType, color: COLOR },
    backgroundOptions: { color: "transparent" }, // always transparent
    cornersSquareOptions: { type: s.cornerSquareType, color: COLOR },
    cornersDotOptions: { type: s.cornerDotType, color: COLOR },
  };
}
