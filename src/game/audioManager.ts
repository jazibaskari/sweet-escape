import { repl } from "@strudel/core";
import { webaudioOutput } from "@strudel/webaudio";

let schedulerInstance: ReturnType<typeof repl>["scheduler"] | null = null;

export const getScheduler = () => {
  if (!schedulerInstance) {
    const { scheduler } = repl({ defaultOutput: webaudioOutput });
    schedulerInstance = scheduler;
  }
  return schedulerInstance;
};
