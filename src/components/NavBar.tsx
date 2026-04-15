import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import styles from "../styles/Navbar.module.css";
import { FaUser, FaSignOutAlt, FaHome, FaList, FaClipboardList, FaComments, FaInfoCircle } from "react-icons/fa";
import { useAuth } from "../context/AuthContext";
import logo from "../assets/logo2.png";

export default function Navbar() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { email, logout } = useAuth();

  // Check login status
  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsLoggedIn(!!token);
  }, [email]);

  const closeAll = () => {
    setMenuOpen(false);
    setDropdownOpen(false);
  };

  return (
    <nav className={styles.navbar}>
      {/* Logo */}
      <Link to="/" className={styles.logoLink}>
        <div className={styles.logo}>
          <img src={logo} width="350" height="70" alt="DriveDeals" />
        </div>
      </Link>

      {/* Hamburger (mobile only) */}
      <div
        className={`${styles.hamburger} ${menuOpen ? styles.active : ""}`}
        onClick={() => setMenuOpen(!menuOpen)}
      >
        <span></span>
        <span></span>
        <span></span>
      </div>

      {/* Links */}
      <div className={`${styles.links} ${menuOpen ? styles.show : ""}`}>
        <Link
          to="/"
          className={`${styles.link} ${styles.linkWithIcon}`}
          onClick={closeAll}
        >
          <FaHome /> Home
        </Link>
        <Link
          to="/AboutUs"
          className={`${styles.link} ${styles.linkWithIcon}`}
          onClick={closeAll}
        >
          <FaInfoCircle /> About Us
        </Link>
        <Link
          to="/BrowseCars"
          className={`${styles.link} ${styles.linkWithIcon}`}
          onClick={closeAll}
        >
          <FaList /> Browse Cars
        </Link>

        {isLoggedIn && (
          <>
            <Link
              to="/myBids"
              className={`${styles.link} ${styles.linkWithIcon}`}
              onClick={closeAll}
            >
              <FaClipboardList /> My Bids
            </Link>
            <Link
              to="/MyAds"
              className={`${styles.link} ${styles.linkWithIcon}`}
              onClick={closeAll}
            >
              <FaList /> My Ads
            </Link>
            <Link
              to="/chat-list"
              className={`${styles.link} ${styles.linkWithIcon}`}
              onClick={closeAll}
            >
              <FaComments /> Chat
            </Link>
          </>
        )}

        {!isLoggedIn ? (
          <Link to="/login" className={styles.loginLink} onClick={closeAll}>
            <FaUser /> Login
          </Link>
        ) : (
          <div className={styles.profileMenu}>
            <button
              className={styles.profileButton}
              onClick={() => setDropdownOpen(!dropdownOpen)}
              aria-label="Toggle profile menu"
            >
              <FaUser /> Profile
            </button>
            {dropdownOpen && (
              <div className={styles.dropdown}>
                <Link
                  to="/profile"
                  className={styles.dropdownItem}
                  onClick={closeAll}
                >
                  <FaUser /> My Profile
                </Link>
                <div className={styles.dropdownDivider}></div>
                <button
                  className={`${styles.dropdownItem} ${styles.logoutItem}`}
                  onClick={() => {
                    logout();
                    setIsLoggedIn(false);
                    closeAll();
                  }}
                >
                  <FaSignOutAlt /> Logout
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
