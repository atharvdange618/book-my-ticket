import { Outlet } from "react-router-dom";
import { Navbar } from "./Navbar";
import { Footer } from "./Footer";
import { GooeyToaster } from "@/components/ui/goey-toaster";
import { useTheme } from "../theme-provider";

export function MainLayout() {
  const { theme } = useTheme();
  const toasterTheme = theme === "system" ? undefined : theme;
  return (
    <div
      className={`flex flex-col min-h-svh ${theme === "dark" ? "bg-dark text-white" : "bg-light text-black"}`}
    >
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
      <GooeyToaster
        position="top-center"
        theme={toasterTheme}
        closeButton="top-right"
        preset="subtle"
        duration={3000}
        swipeToDismiss
      />
    </div>
  );
}
