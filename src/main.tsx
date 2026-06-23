import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";

const uiElement = document.getElementById("ui");

if (uiElement && uiElement.parentElement) {
  const updateScale = () => {
    const scale = Math.min(window.innerWidth / 1920, window.innerHeight / 1080);
    document.documentElement.style.setProperty("--scale", scale.toString());
  };
  updateScale();

  new ResizeObserver(() => updateScale()).observe(uiElement.parentElement);

  createRoot(uiElement).render(
    <StrictMode>
      <App />
    </StrictMode>
  );
} else {
  console.error("Could not find the '#ui' container element in the DOM.");
}
