export default function setupInstructions(k) {
  k.scene("instructions", () => {
    k.setBackground(k.Color.fromHex("#9ba99e"));
    k.add([
      k.text(
        "Instructions\n\nUse arrows to move\nAvoid vegetables\nCollect cake\nReach 100 points to win\n\n[Space] to Menu",
        {
          font: "monogram",
          size: 32,
          align: "center",
        }
      ),
      k.anchor("center"),
      k.pos(k.center()),
      k.color(255, 255, 255),
    ]);
    k.onKeyPress("space", () => k.go("main-menu"));
  });
}
