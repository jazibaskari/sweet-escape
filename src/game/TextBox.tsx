import { useEffect, useState } from "react";
import { useAtom } from "jotai";
import { motion, AnimatePresence } from "framer-motion";
import {
  store,
  isTextBoxVisibleAtom,
  isParentTextBoxVisibleAtom,
  isBossTextBoxVisibleAtom,
  textBoxContentAtom,
} from "./store";
import defaultTextboxBg from "/boss_textbox.png";
import childTextboxBg from "/child_textbox.png";
import parentTextboxBg from "/parent_textbox.png";
import "./textbox.css";

const variants = {
  open: { opacity: 1, scale: 1 },
  closed: { opacity: 0, scale: 0.5 },
};

function TypewriterText({ text }: { text: string }) {
  const [displayedText, setDisplayedText] = useState("");
  useEffect(() => {
    let index = 0;
    let currentText = "";
    const interval = setInterval(() => {
      if (index < text.length) {
        currentText += text[index];
        setDisplayedText(currentText);
        index++;
      } else {
        clearInterval(interval);
      }
    }, 50);
    return () => clearInterval(interval);
  }, [text]);
  return <>{displayedText}</>;
}

export default function TextBox() {
  const [isVisible] = useAtom(isTextBoxVisibleAtom, { store });
  const [isParentVisible] = useAtom(isParentTextBoxVisibleAtom, { store });
  const [isBossVisible] = useAtom(isBossTextBoxVisibleAtom, { store });
  const [defaultContent] = useAtom(textBoxContentAtom, { store });

  const isAnyVisible = isVisible || isParentVisible || isBossVisible;

  const activeTextbox = isParentVisible
    ? { content: defaultContent, bg: parentTextboxBg }
    : isBossVisible
    ? { content: defaultContent, bg: defaultTextboxBg }
    : isVisible
    ? { content: defaultContent, bg: childTextboxBg }
    : { content: defaultContent, bg: defaultTextboxBg };

  return (
    <AnimatePresence>
      {isAnyVisible && (
        <motion.div
          className="text-box-wrapper"
          initial="closed"
          animate="open"
          exit="closed"
          variants={variants}
          transition={{ duration: 0.2 }}
        >
          <div className="child-portrait" />
          <img
            src={activeTextbox.bg}
            alt="Textbox UI"
            className="textbox-image"
          />
          <div className="displayed-text">
            <TypewriterText
              key={activeTextbox.content}
              text={activeTextbox.content}
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
