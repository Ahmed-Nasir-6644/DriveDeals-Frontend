import styles from "../styles/AboutUs.module.css";
import { FaInstagram, FaLinkedin, FaBullseye, FaRocket, FaLightbulb, FaSearch, FaMobileAlt, FaBrain, FaComments, FaChartBar, FaCheckCircle } from "react-icons/fa";
import { SiGmail } from "react-icons/si";

export default function AboutUs() {
  return (
    <main className={styles.container}>
      {/* Hero Header */}
      <section className={styles.header}>
        <div className={styles.headerContent}>
          <h1 className={styles.title}>About Drive Deals</h1>
          <p className={styles.subtitle}>Your trusted platform for buying and selling cars in Pakistan</p>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className={styles.missionSection}>
        <div className={styles.missionGrid}>
          <div className={styles.missionCard}>
            <div className={styles.missionIcon}><FaBullseye /></div>
            <h3>Our Mission</h3>
            <p>To revolutionize the used car market in Pakistan by providing a transparent, secure, and user-friendly platform where buyers and sellers can connect and transact with confidence.</p>
          </div>
          <div className={styles.missionCard}>
            <div className={styles.missionIcon}><FaRocket /></div>
            <h3>Our Vision</h3>
            <p>To become the leading automotive marketplace in Pakistan, connecting millions of buyers and sellers through innovation, trust, and exceptional customer service.</p>
          </div>
          <div className={styles.missionCard}>
            <div className={styles.missionIcon}><FaLightbulb /></div>
            <h3>Our Values</h3>
            <p>We believe in transparency, security, and customer-first approach. Every interaction is designed to build trust and deliver unparalleled value to our community.</p>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className={styles.statsSection}>
        <h2 className={styles.statsTitle}>By The Numbers</h2>
        <div className={styles.statsGrid}>
          <div className={styles.statCard}>
            <div className={styles.statNumber}>5000+</div>
            <div className={styles.statLabel}>Cars Listed</div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statNumber}>10K+</div>
            <div className={styles.statLabel}>Happy Users</div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statNumber}>24/7</div>
            <div className={styles.statLabel}>Support Available</div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statNumber}>100%</div>
            <div className={styles.statLabel}>Secure Transactions</div>
          </div>
        </div>
      </section>

      {/* Services */}
      <section className={styles.services}>
        <h2>Why Choose Drive Deals?</h2>
        <div className={styles.servicesList}>
          <div className={styles.serviceItem}>
            <div className={styles.serviceIcon}><FaSearch /></div>
            <h3>Browse Listings</h3>
            <p>Explore thousands of verified car listings with detailed specifications and high-quality images.</p>
          </div>
          <div className={styles.serviceItem}>
            <div className={styles.serviceIcon}><FaMobileAlt /></div>
            <h3>Easy Posting</h3>
            <p>Post your car for sale in minutes with detailed specifications, multiple images, and pricing.</p>
          </div>
          <div className={styles.serviceItem}>
            <div className={styles.serviceIcon}><FaBrain /></div>
            <h3>AI Recommendations</h3>
            <p>Get AI-powered car recommendations based on your preferences and browsing history.</p>
          </div>
          <div className={styles.serviceItem}>
            <div className={styles.serviceIcon}><FaComments /></div>
            <h3>Secure Messaging</h3>
            <p>Direct messaging between buyers and sellers with encrypted, secure communication.</p>
          </div>
          <div className={styles.serviceItem}>
            <div className={styles.serviceIcon}><FaChartBar /></div>
            <h3>Track Progress</h3>
            <p>Monitor your ads, bids, and messages easily with real-time notifications and updates.</p>
          </div>
          <div className={styles.serviceItem}>
            <div className={styles.serviceIcon}><FaCheckCircle /></div>
            <h3>Verified Sellers</h3>
            <p>All sellers are verified to ensure safe and trustworthy transactions for every buyer.</p>
          </div>
        </div>
      </section>

      {/* Location */}
      <section className={styles.location}>
        <h2>Visit Us</h2>
        <p className={styles.locationDesc}>Our head office is located at FAST NUCES Lahore. Feel free to visit us or reach out anytime.</p>
        <div className={styles.mapContainer}>
          <iframe
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d13610.206625981898!2d74.29717394075784!3d31.481517229016166!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x391903f08ebc7e8b%3A0x47e934f4cd34790!2sFAST%20NUCES%20Lahore!5e0!3m2!1sen!2sus!4v1765091897280!5m2!1sen!2sus"
            width="100%"
            height="450"
            loading="lazy"
          ></iframe>
        </div>
      </section>

      {/* Team Section */}
      <section className={styles.team}>
        <h2>Meet Our Developers</h2>
        <p className={styles.teamDescription}>Talented developers passionate about creating the best car marketplace experience.</p>
        <div className={styles.teamGrid}>

          {/* Ahmed */}
          <div className={styles.teamMember}>
            <div className={styles.memberAvatar}>
              <div className={styles.avatarInitial}>AN</div>
            </div>
            <h3>Ahmed Nasir</h3>
            <p className={styles.role}>Full Stack Developer</p>
            <div className={styles.socialLinks}>
              <a href="mailto:ahmednasir1212a@gmail.com" target="_blank" rel="noreferrer" title="Email">
                <SiGmail />
              </a>
              <a href="https://www.instagram.com/ahmednasir2003?igsh=MmZhZDQ1b3AwcDd6" target="_blank" rel="noreferrer" title="Instagram">
                <FaInstagram />
              </a>
              <a href="https://linkedin.com/" target="_blank" rel="noreferrer" title="LinkedIn">
                <FaLinkedin />
              </a>
            </div>
          </div>

          {/* Shahzaib */}
          <div className={styles.teamMember}>
            <div className={styles.memberAvatar}>
              <div className={styles.avatarInitial}>SB</div>
            </div>
            <h3>Shahzaib Bukhari</h3>
            <p className={styles.role}>Full Stack Developer</p>
            <div className={styles.socialLinks}>
              <a href="mailto:shahzaibbukhari2004@gmail.com" target="_blank" rel="noreferrer" title="Email">
                <SiGmail />
              </a>
              <a href="https://www.instagram.com/syed_shahzaib_sh?igsh=MXY5dTcyM3JkN2FxZw==" target="_blank" rel="noreferrer" title="Instagram">
                <FaInstagram />
              </a>
              <a href="https://linkedin.com/" target="_blank" rel="noreferrer" title="LinkedIn">
                <FaLinkedin />
              </a>
            </div>
          </div>

          {/* Aanish */}
          <div className={styles.teamMember}>
            <div className={styles.memberAvatar}>
              <div className={styles.avatarInitial}>AW</div>
            </div>
            <h3>Aanish Waseem</h3>
            <p className={styles.role}>Full Stack Developer</p>
            <div className={styles.socialLinks}>
              <a href="mailto:aanish.waseem116@gmail.com" target="_blank" rel="noreferrer" title="Email">
                <SiGmail />
              </a>
              <a href="https://www.instagram.com/aanish808._?igsh=MXB6ZGt2N2hieHhmaQ==" target="_blank" rel="noreferrer" title="Instagram">
                <FaInstagram />
              </a>
              <a href="https://linkedin.com/" target="_blank" rel="noreferrer" title="LinkedIn">
                <FaLinkedin />
              </a>
            </div>
          </div>

        </div>
      </section>
    </main>
  );
}
