import { atom, createStore } from "jotai";

export const isTextBoxVisibleAtom = atom(false);

export const isBossTextBoxVisibleAtom = atom(false);

export const isChildPortraitVisibleAtom = atom<boolean>(false);

export const textBoxContentAtom = atom("");

export const textBoxBackgroundAtom = atom<string>("");

export const isParentTextBoxVisibleAtom = atom(false);

export const isAudioInitializedAtom = atom(false);

export const store = createStore();
