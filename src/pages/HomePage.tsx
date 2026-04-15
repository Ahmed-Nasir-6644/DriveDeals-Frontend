import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import styles from "../styles/HomePage.module.css";
import { useToast } from "../hooks/useToast";
import { ToastContainer } from "../components/ToastContainer";

interface Ad {
  id: number;
  make: string;
  model: string;
  variant: string;
  images: string[];
  created_at: string;
  price: number;
}

const HomePage: React.FC = () => {
  const [recentAds, setRecentAds] = useState<Ad[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const location = useLocation();
  const { toasts, showToast, dismissToast } = useToast();

  // Show login success message if coming from login
  useEffect(() => {
    if (location.state && (location.state as any).showLoginSuccess) {
      showToast("Login successful", "success");
    }
  }, [location.state]);

  // Scroll to top on component mount
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    setLoading(true);
    setError(null);
    
    fetch(`${import.meta.env.VITE_BACKEND_URL}/ads/get/ads?limit=10&sort=recent`)
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch ads');
        return res.json();
      })
      .then((data) => {
        // Backend should return sorted data, but fallback sort just in case
        const sorted = Array.isArray(data) 
          ? data.sort(
              (a: Ad, b: Ad) =>
                new Date(b.created_at).getTime() -
                new Date(a.created_at).getTime()
            ).slice(0, 10)
          : [];
        setRecentAds(sorted);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error fetching ads:', err);
        setError('Failed to load cars. Please try again.');
        setLoading(false);
      });
  }, []);

  // Format price with commas
  const formatPrice = (price: number): string => {
    return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  // Get relative time
  const getRelativeTime = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <main className={styles.container}>
      <ToastContainer toasts={toasts} dismissToast={dismissToast} />
      {/* HERO HEADER */}
      <section className={styles.header}>
        <div className={styles.headerContent}>
          <div className={styles.headerText}>
            <h1 className={styles.title}>Find Your Perfect Car</h1>
            <p className={styles.subtitle}>
              Discover the best used cars in Pakistan with competitive prices and trusted sellers
            </p>
            <Link to="/BrowseCars" className={styles.ctaButton}>
              Explore Now →
            </Link>
          </div>
          <div className={styles.headerStats}>
            <div className={styles.stat}>
              <div className={styles.statNumber}>5000+</div>
              <div className={styles.statLabel}>Cars Listed</div>
            </div>
            <div className={styles.stat}>
              <div className={styles.statNumber}>10K+</div>
              <div className={styles.statLabel}>Happy Users</div>
            </div>
            <div className={styles.stat}>
              <div className={styles.statNumber}>24/7</div>
              <div className={styles.statLabel}>Support</div>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURED LISTINGS */}
      <section className={styles.sliderWrapper}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>🔥 Recently Added Cars</h2>
          <Link to="/BrowseCars" className={styles.viewAll}>
            View All →
          </Link>
        </div>

        {loading ? (
          <div className={styles.loadingContainer}>
            <div className={styles.spinner}></div>
            <p>Loading cars...</p>
          </div>
        ) : error ? (
          <div className={styles.errorContainer}>
            <p>{error}</p>
            <button onClick={() => window.location.reload()} className={styles.retryButton}>
              Retry
            </button>
          </div>
        ) : recentAds.length === 0 ? (
          <div className={styles.emptyContainer}>
            <p>No cars available at the moment. Check back soon!</p>
          </div>
        ) : (
          <div className={styles.sliderContainer}>
            <div className={styles.slider}>
              {recentAds.map((ad) => (
                <Link to={`/ad/${ad.id}`} key={ad.id} className={styles.slideCard}>
                <div className={styles.cardImageWrapper}>
                  <img
                    src={ad.images?.[0] || "/placeholder-car.jpg"}
                    alt={ad.model}
                    className={styles.slideImage}
                  />
                  <span className={styles.newBadge}>NEW</span>
                </div>
                <div className={styles.slideText}>
                  <h3 className={styles.carTitle}>{ad.make} {ad.model}</h3>
                  <p className={styles.carVariant}>{ad.variant}</p>
                  <div className={styles.cardFooter}>
                    <p className={styles.price}>PKR {formatPrice(ad.price)}</p>
                    <span className={styles.date}>{getRelativeTime(ad.created_at)}</span>
                  </div>
                </div>
              </Link>
            ))}
            </div>
          </div>
        )}
      </section>

      {/* QUICK LINKS GRID */}
      <section className={styles.featuresSection}>
        <h2 className={styles.featuresSectionTitle}>Explore Our Services</h2>
        
        <div className={styles.grid}>
          <Link to="/BrowseCars" className={`${styles.card} ${styles.cardBrowse}`}>
            <div className={styles.cardIcon}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8"></circle>
                <path d="m21 21-4.35-4.35"></path>
              </svg>
            </div>
            <h2>Browse Cars</h2>
            <p>Explore thousands of verified listings</p>
            <span className={styles.cardArrow}>→</span>
          </Link>

          <Link to="/myBids" className={`${styles.card} ${styles.cardBids}`}>
            <div className={styles.cardIcon}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 1v22M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
              </svg>
            </div>
            <h2>My Bids</h2>
            <p>Track and manage your negotiations</p>
            <span className={styles.cardArrow}>→</span>
          </Link>

          <Link to="/AboutUs" className={`${styles.card} ${styles.cardAbout}`}>
            <div className={styles.cardIcon}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"></circle>
                <path d="M12 16v-4M12 8h.01"></path>
              </svg>
            </div>
            <h2>About Us</h2>
            <p>Learn more about Drive Deals</p>
            <span className={styles.cardArrow}>→</span>
          </Link>
        </div>
      </section>

      {/* WHY CHOOSE US */}
      <section className={styles.whyChooseUs}>
        <h2 className={styles.whyTitle}>Why Choose Drive Deals?</h2>
        <div className={styles.whyGrid}>
          <div className={styles.whyCard}>
            <div className={styles.whyIconWrapper}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 12l2 2 4-4"></path>
                <circle cx="12" cy="12" r="10"></circle>
              </svg>
            </div>
            <h3>Verified Sellers</h3>
            <p>All sellers are verified and trustworthy</p>
          </div>
          <div className={styles.whyCard}>
            <div className={styles.whyIconWrapper}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
              </svg>
            </div>
            <h3>Secure Transactions</h3>
            <p>Safe bidding and payment systems</p>
          </div>
          <div className={styles.whyCard}>
            <div className={styles.whyIconWrapper}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
              </svg>
            </div>
            <h3>Direct Communication</h3>
            <p>Chat directly with sellers in real-time</p>
          </div>
          <div className={styles.whyCard}>
            <div className={styles.whyIconWrapper}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="5" y="2" width="14" height="20" rx="2" ry="2"></rect>
                <path d="M12 18h.01"></path>
              </svg>
            </div>
            <h3>Mobile Friendly</h3>
            <p>Browse and bid on the go</p>
          </div>
        </div>
      </section>
    </main>
  );
};

export default HomePage;
