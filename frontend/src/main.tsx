import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthProvider";
import { SidebarProvider } from "./contexts/SidebarContext";
import { ThemeProvider } from "./contexts/ThemeContext";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <BrowserRouter>
    <AuthProvider>
      <SidebarProvider>
        <ThemeProvider>
      <App />
        </ThemeProvider>
      </SidebarProvider>
    </AuthProvider>
  </BrowserRouter>
);
