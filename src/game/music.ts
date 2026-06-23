import { stack, note, repl } from "@strudel/core";
import { webaudioOutput, initAudioOnFirstClick } from "@strudel/webaudio";

let scheduler: ReturnType<typeof repl>["scheduler"] | null = null;
const waitUntilReady = async (retries = 20): Promise<boolean> => {
  for (let i = 0; i < retries; i++) {
    if (webaudioOutput?.context) return true;
    await new Promise((r) => setTimeout(r, 50));
  }
  return false;
};

export const unlockAudio = async () => {
  initAudioOnFirstClick();

  const ready = await waitUntilReady();
  if (!ready) {
    console.error("Audio: AudioContext failed to initialize.");
    return;
  }

  if (webaudioOutput.context.state === "suspended") {
    await webaudioOutput.context.resume();
  }
};

export const playMusic = async () => {
  await unlockAudio();

  if (!webaudioOutput.context) return;

  if (!scheduler) {
    const instance = repl({ defaultOutput: webaudioOutput });
    scheduler = instance.scheduler;
  }

  scheduler.setPattern(stack(note("c3 e3 g3 c4").s("sine").gain(0.3)).cpm(60));
  scheduler.start();
};
