export default function setupGameResult(k) {
  k.scene(
    "game-result",
    ({ message, score }: { message: string; score: number }) => {
      k.setBackground(k.Color.fromHex("#9ba99e"));
      k.add([
        k.text(`${message}\nScore: ${score}\n\nPress [Space] to Menu`, {
          font: "monogram",
          size: 32,
          align: "center",
        }),
        k.anchor("center"),
        k.pos(k.center()),
        k.color(255, 255, 255),
      ]);
      k.onKeyPress("space", () => k.go("main-menu"));
    }
  );
}
