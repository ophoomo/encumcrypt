import React from "react";
import ReactDOM from "react-dom/client";
import "./styles.css";
import 'virtual:uno.css'
import { RouterProvider } from "react-router-dom";
import router from "./router";
import { AppProvider } from "./AppContext";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  //<React.StrictMode>
    <AppProvider>
      <RouterProvider router={router} />
    </AppProvider>
  //</React.StrictMode>,
);
