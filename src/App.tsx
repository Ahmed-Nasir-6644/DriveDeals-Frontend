import "./App.css";
import { Route, Routes } from "react-router-dom";
import HomePage from "./pages/HomePage";
import Navbar from "./components/NavBar";
import Footer from "./components/Footer";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import BrowseCars from "./pages/BrowseCars";
import AdDetailPage from "./pages/Ad";
import VerifiedSuccess from "./pages/verify-success";
import VerifyFailed from "./pages/verify-failed";
import MyAdsPage from "./pages/Myads";
import AboutUs from "./pages/AboutUS";
import MyBids from "./pages/MyBids";
import ProfilePage from "./pages/Profile";
import ChatList from "./pages/ChatList";
import ChatPage from "./pages/ChatPage";
import { useScrollToTop } from "./hooks/useScrollToTop";

function App() {
  // Scroll to top on route change
  useScrollToTop();

  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="BrowseCars" element={<BrowseCars />} />
        <Route path="/ad/:id" element={<AdDetailPage />} />
        <Route path="/verify-success" element={<VerifiedSuccess />} />
        <Route path="/verify-failed" element={<VerifyFailed />} />
        <Route path="/myAds" element={<MyAdsPage />} />
        <Route path="/AboutUs" element={<AboutUs />} />
        <Route path="/myBids" element={<MyBids />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/chat-list" element={<ChatList />} />
        <Route path="/chat/:chatId" element={<ChatPage />} />
      </Routes>
      <Footer />
    </>
  );
}

export default App;
