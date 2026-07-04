"use client";

import TopAppBar from "./components/TopAppBar";
import MainContent from "./components/MainContent";
import Footer from "./components/Footer";

export default function Page() {
  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <TopAppBar />
      <MainContent />
      <Footer />
    </div>
  );
}
