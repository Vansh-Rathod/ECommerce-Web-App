import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import { ConfigProvider, App as AntdApp } from "antd";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  // <StrictMode>
    <BrowserRouter>
      <ConfigProvider theme={{}}>
        <AntdApp>
          <App />
        </AntdApp>
      </ConfigProvider>
    </BrowserRouter>
  // </StrictMode>
);
