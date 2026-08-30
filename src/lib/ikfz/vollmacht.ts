import { createHash } from "node:crypto";
import { VOLLMACHT_TEXT, VOLLMACHT_VERSION } from "./vollmacht-text";

export { VOLLMACHT_TEXT, VOLLMACHT_VERSION };

/** Hash des Textes, dem tatsächlich zugestimmt wurde. */
export function vollmachtHash(text = VOLLMACHT_TEXT): string {
  return createHash("sha256").update(text.trim(), "utf8").digest("hex");
}
