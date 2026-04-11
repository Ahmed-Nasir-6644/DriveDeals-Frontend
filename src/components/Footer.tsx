import React, { useEffect, useState } from "react";
import styles from "../styles/Footer.module.css";
import { useAuth } from "../context/AuthContext";

const Footer: React.FC = () => {
  const { email } = useAuth();
  const [loggedInUserId, setLoggedInUserId] = useState<number | null>(null);

  // Fetch logged-in user ID
  useEffect(() => {
    if (!email) return;

    fetch(`${import.meta.env.VITE_BACKEND_URL}/users/get-by-email?email=${email}`)
      .then((res) => res.json())
      .then((data) => setLoggedInUserId(data.id))
      .catch((err) => console.error("Error fetching logged-in user:", err));
  }, [email]);

  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <div className={styles.left}>
          <h2 className={styles.logo}>DriveDeals</h2>
          <p className={styles.tagline}>
            Buy & Sell Cars Easily with Trust and Transparency
          </p>
        </div>

        <div className={styles.center}>
          <h3>Quick Links</h3>
          <ul>
            <li>
              <a href="/">Home</a>
            </li>
            <li>
              <a href="/browse">Browse Cars</a>
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
          </ul>
        </div>

        <div className={styles.right}>
          <h3>Contact</h3>
          <p>Email: drive.deals.pk@gmail.com</p>
          <p>Phone: +92 307 2003111</p>
          <p>Address: Lahore, Pakistan</p>
        </div>
      </div>

      <div className={styles.bottom}>
        <p>© {new Date().getFullYear()} DriveDeals. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;
