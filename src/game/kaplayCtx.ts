import kaplay from "kaplay";
import { scaleFactor } from "./constants"; // Import your scale factor

export default function initKaplay() {
  const canvas = document.getElementById("game") as HTMLCanvasElement;

  return kaplay({
    width: 704 * scaleFactor,
    height: 400 * scaleFactor,
    letterbox: true,
    global: false,
    debug: true,
    debugKey: "f1",
    canvas,
    pixelDensity: devicePixelRatio,
  });
}
