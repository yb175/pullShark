import { useState , useEffect } from 'react'
import { Routes, Route } from "react-router";
import { useDispatch } from "react-redux";
import Header from "./components/Header";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from './pages/Signup';
import AuthCallback from './components/AuthCallback';
import { checkAuthStatusThunk } from "./slice/authSlice";

function App() {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(checkAuthStatusThunk());
  }, [dispatch]);

  return (
   <div className="bg-[#0A0A0F] text-white min-h-screen flex flex-col font-inter">
      <Header />
      <main className="grow">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/auth/callback" element={<AuthCallback />} />
        </Routes>
      </main>
      <Footer />
    </div>
  )
}

export default App
