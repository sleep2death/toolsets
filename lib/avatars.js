import { createAvatar } from "@dicebear/avatars";
import * as style from "@dicebear/big-smile";

export default function getAvatar(seed) {
  let svg = createAvatar(style, {
    seed,
    // ... and other options
  });
  return svg;
}
