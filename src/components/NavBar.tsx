import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import styles from "../styles/Navbar.module.css"; // adjust path if needed
import { FaUser, FaSignOutAlt } from "react-icons/fa";
import { useAuth } from "../context/AuthContext";
import logo from "../assets/logo2.png";

export default function Navbar() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false); // for mobile hamburger
  const { email, logout } = useAuth();

  // Check login status
  useEffect(() => {
    const token = localStorage.getItem("token"); 
    setIsLoggedIn(!!token);
  }, [email]);

  return (
    <nav className={styles.navbar}>
      {/* Logo */}
      <div className={styles.logo}>
        <img src={logo} width="350" height="70" alt="DriveDeals" />
      </div>

      {/* Hamburger (mobile only) */}
      <div className={styles.hamburger} onClick={() => setMenuOpen(!menuOpen)}>
        <div></div>
        <div></div>
        <div></div>
      </div>

      {/* Links */}
      <div className={`${styles.links} ${menuOpen ? styles.show : ""}`}>
        <Link to='/AboutUs' className={styles.link} onClick={()=> setMenuOpen(false)}>About Us</Link>
        <Link to="/" className={styles.link} onClick={() => setMenuOpen(false)}>Home</Link>
        <Link to="/BrowseCars" className={styles.link} onClick={() => setMenuOpen(false)}>Browse Cars</Link>
        

        {isLoggedIn && (
          <>
            <Link to="/myBids" className={styles.link} onClick={() => setMenuOpen(false)}>My Bids</Link>
            <Link to="/MyAds" className={styles.link} onClick={() => setMenuOpen(false)}>My Ads</Link>
            <Link to ="/chat-list" className={styles.link} onClick={()=>setMenuOpen(false)}>Chat List</Link>
          </>
        )}

        {!isLoggedIn ? (
          <Link to="/login" className={styles.login_link} onClick={() => setMenuOpen(false)}>Login</Link>
        ) : (
          <div className={styles.profileMenu}>
            <button
              className={styles.profileButton}
              onClick={() => setDropdownOpen(!dropdownOpen)}
              aria-label="Toggle menu"
            >
              <FaUser size={18}/> Profile
            </button>
            {dropdownOpen && (
              <div className={styles.dropdown}>
                <Link to="/profile" className={styles.dropdownItem} onClick={() => {setMenuOpen(false);
                  setDropdownOpen(!dropdownOpen);
                }} >
                  <FaUser /> My Profile
                </Link>
                <div className={styles.dropdownDivider}></div>
                <Link to="/"
                  className={`${styles.dropdownItem} ${styles.logout}`}
                  onClick={() => {
                    logout();
                    setIsLoggedIn(false);
                    setMenuOpen(false);
                  }}
                >
                  <FaSignOutAlt /> Logout
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
