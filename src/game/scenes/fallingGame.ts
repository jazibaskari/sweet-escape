import { scaleFactor, playerScaleFactor, dialogueData } from "../constants";
import { playMusic } from "../music";
import { createPlayer } from "../entities/player";
import { spawnWaypointNPC } from "../entities/npc";
import {
  store,
  isTextBoxVisibleAtom,
  isBossTextBoxVisibleAtom,
  textBoxContentAtom,
  isParentTextBoxVisibleAtom,
  isChildPortraitVisibleAtom,
} from "../store";

export default function setupFallingGame(k) {
  k.scene("falling-game", async () => {
    const clearDialogues = () => {
      store.set(isTextBoxVisibleAtom, false);
      store.set(isParentTextBoxVisibleAtom, false);
      store.set(isBossTextBoxVisibleAtom, false);
      store.set(isChildPortraitVisibleAtom, false);
    };

    let isBossAlertActive = false;
    let bossAlert = null;
    let bossTimer = null;
    let dialogueTimer = null;
    let childAutoExitTimer = null;

    k.add([k.sprite("map-base"), k.pos(0), k.scale(scaleFactor), k.z(0)]);
    const CHILD_SPEED = 400;
    const PARENT_SPEED = 450;
    const DIALOGUE_DURATION = 8;

    let score = 0;
    let musicStarted = false;
    let isAttemptingMusic = false;

    const triggerMusic = async () => {
      if (musicStarted || isAttemptingMusic) return;
      isAttemptingMusic = true;
      try {
        await playMusic();
        musicStarted = true;
      } catch (err) {
        console.error(err);
      } finally {
        isAttemptingMusic = false;
      }
    };

    store.set(isTextBoxVisibleAtom, false);
    const response = await fetch("./sweet_escape_map.json");
    const mapData = await response.json();
    const MAP_WIDTH = mapData.width * 32 * scaleFactor;
    const MAP_HEIGHT = mapData.height * 32 * scaleFactor;

    const checkGameStatus = () => {
      if (score >= 100) k.go("game-result", { message: "You Won!", score });
      else if (score < 0) k.go("game-result", { message: "Game Over", score });
    };

    const scoreText = k.add([
      k.text(`Score: ${score}/100`, { font: "monogram", size: 24 }),
      k.color("#46465e"),
      k.anchor("topright"),
      k.pos(k.width() - 20, 20),
      k.z(200),
      k.fixed(),
    ]);

    const animateDoor = (door) => {
      if (door.isOpen) return;
      door.isOpen = true;
      door.play("door-open");
      k.wait(4.5, () => {
        door.play("door-closed");
        door.isOpen = false;
      });
    };

    let spawnPoint = { x: 320, y: 288 };
    let guardSpawnPoint = null;
    let bossSpawnPoint = null;

    // k.debug.inspect = true;

    for (const layer of mapData.layers) {
      if (layer.name === "boundaries") {
        for (const boundary of layer.objects) {
          if (boundary.name === "door") {
            const doorSprite = k.add([
              k.sprite("door", { anim: "closed" }),
              k.pos(boundary.x * scaleFactor, (boundary.y - 32) * scaleFactor),
              k.scale(scaleFactor),
              k.z(10),
            ]);
            k.add([
              k.pos(boundary.x * scaleFactor, boundary.y * scaleFactor),
              k.area({
                shape: new k.Rect(
                  k.vec2(0, 0),
                  boundary.width * scaleFactor,
                  boundary.height * scaleFactor
                ),
              }),
              "door",
              {
                play: (anim: string) => doorSprite.play(anim),
                isOpen: false,
              },
            ]);
          } else if (boundary.name === "cashier_3") {
            k.add([
              k.pos(boundary.x * scaleFactor, boundary.y * scaleFactor),
              k.rect(
                boundary.width * scaleFactor,
                boundary.height * scaleFactor
              ),
              k.area(),
              k.body({ isStatic: true }),
              "obstacle",
              "cashier-boundary",
              k.opacity(0),
            ]);
          } else {
            k.add([
              k.pos(boundary.x * scaleFactor, boundary.y * scaleFactor),
              k.rect(
                boundary.width * scaleFactor,
                boundary.height * scaleFactor
              ),
              k.area(),
              k.body({ isStatic: true }),
              "obstacle",
              k.opacity(0),
            ]);
          }
        }
      } else if (layer.name === "spawn_point") {
        const sp = layer.objects[0];
        if (sp) spawnPoint = { x: sp.x, y: sp.y };
      } else if (layer.name === "guard_spawn_point") {
        const sp = layer.objects[0];
        if (sp)
          guardSpawnPoint = { x: sp.x * scaleFactor, y: sp.y * scaleFactor };
      } else if (layer.name === "boss_spawn_point") {
        const sp = layer.objects[0];
        if (sp)
          bossSpawnPoint = { x: sp.x * scaleFactor, y: sp.y * scaleFactor };
      }
    }

    const getWaypoints = (layerName: string, pointNames: string[]) => {
      const layer = mapData.layers.find((l) => l.name === layerName);
      if (!layer) return null;
      return pointNames
        .map((name) => {
          const obj = layer.objects.find((o) => o.name === name);
          return obj
            ? { x: obj.x * scaleFactor, y: obj.y * scaleFactor, name: obj.name }
            : null;
        })
        .filter((p) => p !== null);
    };

    const getLayerObjects = (layerName: string) => {
      const layer = mapData.layers.find((l) => l.name === layerName);
      if (!layer) return null;
      return layer.objects.map((obj) => ({
        x: obj.x * scaleFactor,
        y: obj.y * scaleFactor,
        name: obj.name,
      }));
    };

    const playerControl = createPlayer(k, {
      x: spawnPoint.x * scaleFactor,
      y: spawnPoint.y * scaleFactor,
    });
    const player = playerControl.instance;

    const parentWaypoints = getWaypoints("npc_parent_spawn_points", [
      "start_point",
      "turn_right_point",
      "turn_up_point",
      "end_point",
    ]);
    const childWaypoints = getWaypoints("npc_child_spawn_points", [
      "start_point",
      "turn_left_point",
      "end_point",
    ]);

    const boy1 = spawnWaypointNPC(
      k,
      "boy-1",
      parentWaypoints || [],
      2,
      PARENT_SPEED,
      "breathe-side",
      32,
      48,
      0,
      10,
      true,
      animateDoor,
      player,
      clearDialogues
    );

    const child = spawnWaypointNPC(
      k,
      "child",
      childWaypoints || [],
      3,
      CHILD_SPEED,
      "breathe-down",
      32,
      40,
      0,
      10,
      false,
      animateDoor,
      player,
      clearDialogues,
      (childNpc) => {
        k.wait(2, () => {
          if (!childNpc.hasTriggeredText) {
            const alert = k.add([
              k.sprite("alert"),
              k.pos(childNpc.pos.x, childNpc.pos.y - 30),
              k.anchor("center"),
              k.z(100),
            ]);
            childNpc.alertSprite = alert;
            childNpc.alertActive = true;
          }
        });

        childAutoExitTimer = k.wait(20, () => {
          if (!childNpc.hasTriggeredText && !childNpc.hasCompletedInteraction) {
            childNpc.hasCompletedInteraction = true;
            if (childNpc.alertSprite) {
              childNpc.alertSprite.destroy();
              childNpc.alertSprite = null;
            }
            childNpc.alertActive = false;

            const parentExit = getWaypoints("parent_exit_points", [
              "turn_down_point",
              "turn_right_point",
              "turn_up_point",
              "turn_left_point",
              "end_point",
            ]);

            if (boy1 && parentExit) {
              boy1.waypoints = parentExit;
              boy1.curIndex = 0;
              boy1.moving = true;
              boy1.isExiting = true;
              boy1.startNextLeg();
            }
          }
        });
      },
      getWaypoints
    );

    let npcsDestroyed = 0;
    const handleNpcDestroyed = () => {
      npcsDestroyed++;
      if (npcsDestroyed === 2) {
        if (bossSpawnPoint) {
          bossAlert = k.add([
            k.sprite("alert"),
            k.pos(bossSpawnPoint.x, bossSpawnPoint.y - 60),
            k.anchor("center"),
            k.z(100),
          ]);

          k.wait(1.5, () => {
            isBossAlertActive = true;
          });

          bossTimer = k.wait(20, () => {
            if (bossAlert) {
              bossAlert.destroy();
              bossAlert = null;
            }
            isBossAlertActive = false;
          });
        }

        k.wait(5, () => {
          const trolleyPoints = getLayerObjects("trolley_spawn_point");
          if (trolleyPoints && trolleyPoints.length > 0) {
            spawnWaypointNPC(
              k,
              "trolley-guy-sprite",
              trolleyPoints,
              0,
              100,
              "trolley-right",
              32,
              48,
              0,
              10,
              false,
              animateDoor,
              player,
              clearDialogues
            );
          }
        });
      }
    };

    if (boy1) boy1.on("destroy", handleNpcDestroyed);
    if (child) child.on("destroy", handleNpcDestroyed);

    const triggerBossDialogue = () => {
      if (!isBossAlertActive) return;
      isBossAlertActive = false;

      if (bossAlert) {
        bossAlert.destroy();
        bossAlert = null;
      }

      if (bossTimer) bossTimer.cancel();
      if (dialogueTimer) dialogueTimer.cancel();

      clearDialogues();

      store.set(
        textBoxContentAtom,
        "Stay out of the way of any customers with trolleys. They're in a rush!"
      );
      store.set(isBossTextBoxVisibleAtom, true);

      dialogueTimer = k.wait(DIALOGUE_DURATION, () =>
        store.set(isBossTextBoxVisibleAtom, false)
      );
    };

    player.onCollide("cashier-boundary", triggerBossDialogue);

    player.onCollide("trolley-guy-sprite", () => {
      playerControl.playEffectAnimation("damage");
      score -= 5;
      scoreText.text = `Score: ${score}/100`;
      checkGameStatus();
    });

    player.onCollide("child", (childNpc) => {
      if (
        childNpc.alertActive &&
        !childNpc.hasTriggeredText &&
        !childNpc.hasCompletedInteraction
      ) {
        childNpc.hasTriggeredText = true;

        if (childAutoExitTimer) {
          childAutoExitTimer.cancel();
          childAutoExitTimer = null;
        }

        if (childNpc.alertSprite) {
          childNpc.alertSprite.destroy();
          childNpc.alertSprite = null;
        }

        if (dialogueTimer) dialogueTimer.cancel();
        clearDialogues();

        store.set(textBoxContentAtom, dialogueData.Child_Sprite_Boundary);
        store.set(isTextBoxVisibleAtom, true);

        dialogueTimer = k.wait(DIALOGUE_DURATION, () => {
          store.set(isTextBoxVisibleAtom, false);
        });

        childNpc.isParentWindowActive = true;
        k.wait(10, () => {
          childNpc.isParentWindowActive = false;
        });
      }
    });

    k.onUpdate(() => {
      if (isBossAlertActive) {
        const cashiers = k.get("cashier-boundary");
        for (const cashier of cashiers) {
          if (player.isColliding(cashier)) {
            triggerBossDialogue();
          }
        }
      }

      if (boy1 && boy1.isExiting && !boy1.hasWaited) {
        const target = boy1.waypoints[boy1.curIndex];
        if (
          target &&
          target.name === "turn_up_point" &&
          boy1.pos.dist(k.vec2(target.x, target.y)) <= 5
        ) {
          boy1.moving = false;
          boy1.hasWaited = true;
          boy1.play("breathe-side");

          k.wait(1, () => {
            if (child) {
              const childExit = getWaypoints("child_exit_points", [
                "turn_left_point",
                "end_point",
              ]);
              if (childExit) {
                child.waypoints = [child.pos, ...childExit];
                child.curIndex = 1;
                child.isExiting = true;
                child.moving = false;
                child.play("breathe-side");
                k.wait(1, () => {
                  child.moving = true;
                  child.flipX = false;
                  child.play("walk-side");
                });
              }
            }
          });

          k.wait(2, () => {
            boy1.moving = true;
            boy1.curIndex++;
            boy1.startNextLeg();
          });
        }
      }
    });

    if (guardSpawnPoint) {
      k.add([
        k.sprite("guard", { anim: "breathe-down" }),
        k.pos(guardSpawnPoint.x, guardSpawnPoint.y),
        k.anchor("center"),
        k.scale(playerScaleFactor),
        k.area({ shape: new k.Rect(k.vec2(0, 10), 32, 40) }),
        k.body({ isStatic: true }),
        k.z(80),
        "guard",
      ]);
    }

    if (bossSpawnPoint) {
      k.add([
        k.sprite("boss-sprite", { anim: "breathe-down" }),
        k.pos(bossSpawnPoint.x, bossSpawnPoint.y - 30),
        k.anchor("center"),
        k.scale(playerScaleFactor),
        k.z(25),
        "boss",
      ]);
      k.add([
        k.sprite("map-boss-desk"),
        k.pos(0),
        k.scale(scaleFactor),
        k.z(50),
      ]);
    }

    k.add([k.sprite("map-top"), k.pos(0), k.scale(scaleFactor), k.z(100)]);

    const spawnItem = () => {
      const minX = 750;
      const maxX = 1400;
      const startX = k.rand(minX, maxX);
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

      //   const startX = k.rand(screenLeft + 20, screenRight - 20);
      const startY = screenTop - 50;
      const rotationSpeed = k.rand(-90, 90);

      k.add([
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
    };

    k.loop(1.5, spawnItem);

    k.onUpdate("falling", (item) => {
      item.pos.x = item.fixedX;
      item.angle += item.rotationSpeed * k.dt();
      const cam = k.camPos();
      const screenTop = cam.y - k.height() / 2;
      const isMiddleX =
        item.pos.x >= MAP_WIDTH * 0.35 && item.pos.x <= MAP_WIDTH * 0.8;
      const destroyY =
        screenTop + (isMiddleX ? k.height() * 0.7 : k.height() * 0.5);
      if (item.pos.y > destroyY) item.destroy();
    });

    player.onCollide("good-item", (item) => {
      score += 10;
      scoreText.text = `Score: ${score}/100`;
      playerControl.playEffectAnimation("power");
      item.destroy();
      checkGameStatus();
    });

    player.onCollide("bad-item", (item) => {
      score -= 10;
      scoreText.text = `Score: ${score}/100`;
      playerControl.playEffectAnimation("damage");
      item.destroy();
      checkGameStatus();
    });

    player.onCollide("door", (door) => {
      animateDoor(door);
    });

    player.onUpdate(() => {
      if (player.pos.x < 10) player.pos.x = 10;
      if (player.pos.x > MAP_WIDTH - 10) player.pos.x = MAP_WIDTH - 10;
      if (player.pos.y < 10) player.pos.y = 10;
      if (player.pos.y > MAP_HEIGHT - 10) player.pos.y = MAP_HEIGHT - 10;

      const camX = Math.max(
        k.width() / 2,
        Math.min(player.pos.x, MAP_WIDTH - k.width() / 2)
      );
      const camY = Math.max(
        k.height() / 2,
        Math.min(player.pos.y, MAP_HEIGHT - k.height() / 2)
      );
      const currentCam = k.camPos();
      k.camPos(
        k.lerp(currentCam.x, camX, 0.1),
        k.lerp(currentCam.y, camY, 0.1)
      );
    });

    player.onCollide("boy-1", () => {
      const children = k.get("child");
      if (children.length > 0) {
        const childNpc = children[0];
        if (
          childNpc.isParentWindowActive &&
          !childNpc.hasCompletedInteraction
        ) {
          childNpc.hasCompletedInteraction = true;
          score += 20;
          scoreText.text = `Score: ${score}/100`;
          childNpc.isParentWindowActive = false;

          if (childNpc.alertSprite) {
            childNpc.alertSprite.destroy();
            childNpc.alertSprite = null;
          }

          childNpc.play("breathe-down");

          if (dialogueTimer) dialogueTimer.cancel();
          clearDialogues();
          store.set(textBoxContentAtom, dialogueData.Parent_Sprite_Boundary);
          store.set(isParentTextBoxVisibleAtom, true);

          dialogueTimer = k.wait(DIALOGUE_DURATION, () => {
            store.set(isParentTextBoxVisibleAtom, false);

            const parentExit = getWaypoints("parent_exit_points", [
              "turn_down_point",
              "turn_right_point",
              "turn_up_point",
              "turn_left_point",
              "end_point",
            ]);

            if (boy1 && parentExit) {
              boy1.waypoints = parentExit;
              boy1.curIndex = 0;
              boy1.moving = true;
              boy1.isExiting = true;
              boy1.startNextLeg();
            }
          });
        }
      }
    });

    k.onKeyDown("left", () => playerControl.moveLeft(triggerMusic));
    k.onKeyDown("right", () => playerControl.moveRight(triggerMusic));
    k.onKeyDown("up", () => playerControl.moveUp(triggerMusic));
    k.onKeyDown("down", () => playerControl.moveDown(triggerMusic));

    k.onKeyRelease(["left", "right"], () => playerControl.stopHorizontal());
    k.onKeyRelease("up", () => playerControl.stopUp());
    k.onKeyRelease("down", () => playerControl.stopDown());

    k.onSceneLeave(() => {
      player.timers.forEach((timer: number) => clearTimeout(timer));
      player.timers = [];
      if (dialogueTimer) dialogueTimer.cancel();
      if (childAutoExitTimer) childAutoExitTimer.cancel();
      clearDialogues();
    });
  });
}
