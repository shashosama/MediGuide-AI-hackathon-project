import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import { DailyProvider } from "@daily-co/daily-react";

import "./assets/fonts/Christmas and Santona.ttf";
import "./styles/index.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <DailyProvider>
      <App />
    </DailyProvider>
  </React.StrictMode>,
);