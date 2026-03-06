import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import AppIndex from "./AppIndex";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AppIndex />
  </StrictMode>
);
