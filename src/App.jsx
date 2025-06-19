import React from "react";
import { RouterProvider } from "react-router-dom";
import router from "./routes/router";
import { AuthProvider } from "./context/AuthContext";
import { Toaster } from "sonner";
import { ThemeProvider } from "./components/theme-provider";

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Toaster position="top-center" />
        <RouterProvider router={router} />
      </AuthProvider>
    </ThemeProvider>
  );
}
