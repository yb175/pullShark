import { useEffect, useState } from 'react'
import { Routes, Route } from "react-router";
import { useDispatch, useSelector } from "react-redux";
import Header from "./components/Header";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import Login from "./pages/Login";
import RepoPage from './pages/RepoPage';
import ScrollToHash from './components/ScrollToHash';
import AuthCallback from './components/AuthCallback';
import { checkAuthStatusThunk } from "./slice/authSlice";

function App() {
  const dispatch = useDispatch();
  const [appLoading, setAppLoading] = useState(true);


  useEffect(() => {
    const init = async () => {
      dispatch(checkAuthStatusThunk());
      setAppLoading(false);
    };
    init();
  }, []);
  // Show loading until auth check is complete
  if (appLoading) {
    return (
      <div className="bg-[#0A0A0F] text-white min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00fff0] mx-auto mb-4"></div>
          <p className="text-white/60">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#0A0A0F] text-white min-h-screen flex flex-col font-inter">
      <Header />
      <main className="grow">
        <ScrollToHash />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/repo" element={<RepoPage />} />
          <Route path="/auth/callback" element={<AuthCallback />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

export default App
