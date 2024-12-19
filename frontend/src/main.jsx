import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { BrowserRouter } from "react-router-dom";
import AppContextProvider from "./context/AppContext.jsx";

// Add this in your main JavaScript file
window.addEventListener("beforeunload", () => {
  localStorage.setItem("reloaded", "true");
});

window.addEventListener("load", () => {
  if (localStorage.getItem("reloaded") === "true") {
    console.log("Page was reloaded");
    localStorage.removeItem("reloaded"); // Clear the flag
  }
});

createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <AppContextProvider>
      <StrictMode>
        <App />
      </StrictMode>
    </AppContextProvider>
  </BrowserRouter>,
);
