import { playMusic } from "../music";

export default function setupMainMenu(k) {
  k.scene("main-menu", () => {
    const canvas = document.querySelector("canvas");
    if (canvas)
      canvas.addEventListener("click", async () => {
        await playMusic();
      });

    k.add([
      k.text("Sweet Escape", { font: "monogram", size: 60 }),
      k.pos(50, 50),
      k.color(255, 255, 255),
    ]);

    const options = [
      { label: "> instructions", scene: "instructions" },
      { label: "> start game", scene: "falling-game" },
    ];

    let selectedIndex = 0;
    const buttons = options.map((opt, i) => {
      return k.add([
        k.text(opt.label, { font: "monogram", size: 32 }),
        k.pos(50, 200 + i * 50),
        k.anchor("left"),
        k.color(255, 255, 255),
        k.opacity(1),
        { scene: opt.scene },
      ]);
    });

    k.onKeyPress(
      "down",
      () => (selectedIndex = (selectedIndex + 1) % options.length)
    );
    k.onKeyPress(
      "up",
      () =>
        (selectedIndex = (selectedIndex - 1 + options.length) % options.length)
    );
    k.onKeyPress("enter", () => k.go(buttons[selectedIndex].scene));

    k.onUpdate(() => {
      buttons.forEach(
        (btn, i) =>
          (btn.opacity =
            i === selectedIndex ? Math.sin(k.time() * 2) * 0.5 + 0.5 : 1)
      );
    });
  });
}
