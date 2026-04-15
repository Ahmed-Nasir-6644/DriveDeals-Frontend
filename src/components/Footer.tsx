import React, { useEffect, useState } from "react";
import styles from "../styles/Footer.module.css";
import { useAuth } from "../context/AuthContext";
import { FaFacebook, FaInstagram, FaLinkedin, FaTwitter, FaPhone, FaEnvelope, FaMapMarkerAlt, FaArrowRight } from "react-icons/fa";
import { useToast } from "../hooks/useToast";
import { ToastContainer } from "./ToastContainer";

const Footer: React.FC = () => {
  const { email } = useAuth();
  const [loggedInUserId, setLoggedInUserId] = useState<number | null>(null);
  const [newsletter, setNewsletter] = useState("");
  const { toasts, showToast, dismissToast } = useToast();

  // Fetch logged-in user ID
  useEffect(() => {
    if (!email) return;

    fetch(`${import.meta.env.VITE_BACKEND_URL}/users/get-by-email?email=${email}`)
      .then((res) => res.json())
      .then((data) => setLoggedInUserId(data.id))
      .catch((err) => console.error("Error fetching logged-in user:", err));
  }, [email]);

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    showToast(`Subscribed with ${newsletter}`, "success"
    alert(`Subscribed with ${newsletter}`);
    setNewsletter("");
  };

  return (
    <footer className={styles.footer}>
      <ToastContainer toasts={toasts} dismissToast={dismissToast} />
      
      {/* Newsletter Section */}
      <section className={styles.newsletterSection}>
        <div className={styles.newsletterContent}>
          <h2>Stay Updated with Latest Cars</h2>
          <p>Get exclusive deals and updates delivered to your inbox</p>
          <form onSubmit={handleNewsletterSubmit} className={styles.newsletterForm}>
            <input
              type="email"
              placeholder="Enter your email"
              value={newsletter}
              onChange={(e) => setNewsletter(e.target.value)}
              required
              className={styles.newsletterInput}
            />
            <button type="submit" className={styles.newsletterButton}>
              Subscribe <FaArrowRight />
            </button>
          </form>
        </div>
      </section>

      {/* Main Footer Content */}
      <div className={styles.mainContent}>
        <div className={styles.container}>
          {/* Brand Section */}
          <div className={styles.section}>
            <h2 className={styles.logo}>DriveDeals</h2>
            <p className={styles.tagline}>
              Your trusted platform for buying and selling cars in Pakistan with transparency and trust.
            </p>
            <div className={styles.socialLinks}>
              <a href="#" title="Facebook" className={styles.socialIcon}>
                <FaFacebook />
              </a>
              <a href="#" title="Twitter" className={styles.socialIcon}>
                <FaTwitter />
              </a>
              <a href="#" title="Instagram" className={styles.socialIcon}>
                <FaInstagram />
              </a>
              <a href="#" title="LinkedIn" className={styles.socialIcon}>
                <FaLinkedin />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className={styles.section}>
            <h3>Quick Links</h3>
            <ul className={styles.linksList}>
              <li>
                <a href="/">Home</a>
              </li>
              <li>
                <a href="/BrowseCars">Browse Cars</a>
              </li>
              {loggedInUserId ? (
                <li>
                  <a href="/myAds">Post an Ad</a>
                </li>
              ) : (
                <li>
                  <a href="/login">Post an Ad</a>
                </li>
              )}
              <li>
                <a href="/AboutUs">About Us</a>
              </li>
              <li>
                <a href="/myBids">My Bids</a>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className={styles.section}>
            <h3>Contact Us</h3>
            <div className={styles.contactItem}>
              <FaEnvelope className={styles.contactIcon} />
              <div>
                <p className={styles.label}>Email</p>
                <a href="mailto:drive.deals.pk@gmail.com">drive.deals.pk@gmail.com</a>
              </div>
            </div>
            <div className={styles.contactItem}>
              <FaPhone className={styles.contactIcon} />
              <div>
                <p className={styles.label}>Phone</p>
                <a href="tel:+923072003111">+92 307 2003111</a>
              </div>
            </div>
            <div className={styles.contactItem}>
              <FaMapMarkerAlt className={styles.contactIcon} />
              <div>
                <p className={styles.label}>Location</p>
                <p>Lahore, Pakistan</p>
              </div>
            </div>
          </div>

          {/* Company Info */}
          <div className={styles.section}>
            <h3>Legal</h3>
            <ul className={styles.linksList}>
              <li>
                <a href="#privacy">Privacy Policy</a>
              </li>
              <li>
                <a href="#terms">Terms & Conditions</a>
              </li>
              <li>
                <a href="#faq">FAQ</a>
              </li>
              <li>
                <a href="#support">Support</a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Footer */}
      <div className={styles.bottomSection}>
        <p>&copy; {new Date().getFullYear()} DriveDeals. All rights reserved.</p>
        <p>Designed with <span className={styles.heart}>❤</span> for Pakistani car enthusiasts</p>
      </div>
    </footer>
  );
};

export default Footer;
