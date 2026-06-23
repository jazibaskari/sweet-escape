import initKaplay from "./kaplayCtx";
import { playMusic } from "./music";
import { loadAssets } from "./loader/loader";
import setupMainMenu from "./scenes/mainMenu";
import setupInstructions from "./scenes/instructions";
import setupGameResult from "./scenes/gameResult";
import setupFallingGame from "./scenes/fallingGame";

window.addEventListener(
  "wheel",
  (e) => {
    if (e.ctrlKey || e.metaKey) e.preventDefault();
  },
  { passive: false }
);
window.addEventListener(
  "keydown",
  (e) => {
    if (
      (e.ctrlKey || e.metaKey) &&
      (e.key === "+" ||
        e.key === "=" ||
        e.key === "-" ||
        e.key === "_" ||
        e.key === "0")
    ) {
      e.preventDefault();
    }
  },
  { passive: false }
);

document.addEventListener("gesturestart", (e) => e.preventDefault());
document.addEventListener("gesturechange", (e) => e.preventDefault());
document.addEventListener("gestureend", (e) => e.preventDefault());

const k = initKaplay();
k.setGravity(0);
k.setBackground(k.Color.fromHex("#000000"));

loadAssets(k);
setupMainMenu(k);
setupInstructions(k);
setupGameResult(k);
setupFallingGame(k);

export default function initGame() {
  k.go("main-menu");

  const canvas = document.querySelector("canvas");
  if (canvas) canvas.focus();

  const startAudio = async () => {
    await playMusic();
    window.removeEventListener("click", startAudio);
    window.removeEventListener("keydown", startAudio);
  };

  window.addEventListener("click", startAudio);
  window.addEventListener("keydown", startAudio);
  window.addEventListener("click", () => {
    if (canvas && document.activeElement !== canvas) canvas.focus();
  });
}
