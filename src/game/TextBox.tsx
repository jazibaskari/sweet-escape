import { useEffect, useState } from "react";
import { useAtom } from "jotai";
import { motion } from "framer-motion";
import {
  isTextBoxVisibleAtom,
  isParentTextBoxVisibleAtom,
  textBoxContentAtom,
} from "./store";
import defaultTextboxBg from "/textbox.png";
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
  const [isVisible, setIsVisible] = useAtom(isTextBoxVisibleAtom);
  const [isParentVisible, setIsParentVisible] = useAtom(
    isParentTextBoxVisibleAtom
  );

  const [defaultContent] = useAtom(textBoxContentAtom);

  const [isCloseRequest, setIsCloseRequest] = useState(false);

  const isAnyVisible = isVisible || isParentVisible;

  const activeTextbox = isParentVisible
    ? { content: defaultContent, bg: parentTextboxBg }
    : isVisible
    ? { content: defaultContent, bg: childTextboxBg }
    : { content: defaultContent, bg: defaultTextboxBg };

  useEffect(() => {
    if (!isAnyVisible) return;

    const timer = setTimeout(() => {
      setIsCloseRequest(true);
    }, 8000);

    return () => clearTimeout(timer);
  }, [isAnyVisible, activeTextbox.content]);

  const handleAnimationComplete = () => {
    if (isCloseRequest) {
      setIsVisible(false);
      setIsParentVisible(false);
      setIsCloseRequest(false);
    }
  };

  return (
    isAnyVisible && (
      <motion.div
        className="text-box-wrapper"
        initial={{ opacity: 0, scale: 0.5 }}
        animate={isCloseRequest ? "closed" : "open"}
        variants={variants}
        transition={{ duration: 0.2 }}
        onAnimationComplete={handleAnimationComplete}
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
    )
  );
}
