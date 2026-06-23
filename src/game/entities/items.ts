import { scaleFactor } from "../constants";

export function spawnFallingItem(k, mapWidth: number) {
  const isGood = Math.random() > 0.3;
  const goodSprites = ["good-item-1", "good-item-2", "good-item-3"];
  const badSprites = ["bad-item-1"];
  const spriteName = isGood
    ? goodSprites[Math.floor(Math.random() * goodSprites.length)]
    : badSprites[Math.floor(Math.random() * badSprites.length)];

  const cam = k.camPos();
  const screenLeft = cam.x - k.width() / 2;
  const screenRight = cam.x + k.width() / 2;
  const screenTop = cam.y - k.height() / 2;

  const startX = k.rand(screenLeft + 20, screenRight - 20);
  const startY = screenTop - 50;
  const rotationSpeed = k.rand(-90, 90);

  const item = k.add([
    k.sprite(spriteName),
    k.pos(startX, startY),
    k.scale(scaleFactor),
    k.area(),
    k.z(150),
    k.rotate(0),
    k.move(k.vec2(0, 1), 150),
    k.anchor("center"),
    { rotationSpeed, fixedX: startX },
    isGood ? "good-item" : "bad-item",
    "falling",
  ]);

  item.onUpdate(() => {
    item.pos.x = item.fixedX;
    item.angle += item.rotationSpeed * k.dt();
    const currentCam = k.camPos();
    const currentScreenTop = currentCam.y - k.height() / 2;
    const isMiddleX =
      item.pos.x >= mapWidth * 0.35 && item.pos.x <= mapWidth * 0.8;
    const destroyY =
      currentScreenTop + (isMiddleX ? k.height() * 0.7 : k.height() * 0.5);
    if (item.pos.y > destroyY) item.destroy();
  });

  return item;
}
