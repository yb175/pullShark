import { useState } from 'react'
import { Routes, Route } from "react-router-dom";
import Header from "./components/Header";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import FeaturesPage from "./pages/FeaturesPage";
import DocsPage from "./pages/DocsPage";
import ContactPage from "./pages/ContactPage";

function App() {
  return (
   <div className="bg-[#0A0A0F] text-white min-h-screen flex flex-col font-inter">
      <Header />
      <main className="grow">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/features" element={<FeaturesPage />} />
          <Route path="/docs" element={<DocsPage />} />
          <Route path="/contact" element={<ContactPage />} />
        </Routes>
      </main>
      <Footer />
    </div>
  )
}

export default App
