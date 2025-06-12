import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { BrowserRouter } from "react-router-dom";
import { TempoDevtools } from "tempo-devtools";
import { Provider } from "react-redux";
import {store} from "./redux/store.ts";

TempoDevtools.init();

const basename = import.meta.env.BASE_URL;

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
   <Provider store={store} >
      <BrowserRouter basename={basename}>
        <App />
      </BrowserRouter>
   </Provider>

  </React.StrictMode>
);
