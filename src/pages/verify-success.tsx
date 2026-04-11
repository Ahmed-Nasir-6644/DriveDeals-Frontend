export default function VerifiedSuccess() {
  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.icon}>✅</div>
        <h1 style={styles.title}>Email Verified!</h1>
        <p style={styles.subtitle}>
          Your email has been verified successfully. You can now log in and start
          using <span style={styles.brand}>DriveDeals</span>.
        </p>
        <a href="/login" style={styles.loginButton}>
          Go to Login
        </a>
      </div>
    </div>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    minHeight: "100vh",
    background: "linear-gradient(135deg, #0f0c29, #302b63, #24243e)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    padding: "1rem",
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
  },
  card: {
    background: "#fff",
    borderRadius: "16px",
    padding: "2.5rem",
    maxWidth: "420px",
    width: "100%",
    textAlign: "center",
    boxShadow: "0 6px 20px rgba(0, 0, 0, 0.1)",
  },
  icon: {
    fontSize: "3rem",
    background: "#dcfce7",
    color: "#16a34a",
    borderRadius: "50%",
    width: "90px",
    height: "90px",
    margin: "0 auto 1.5rem",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: "1.8rem",
    fontWeight: 700,
    color: "#166534",
    marginBottom: "1rem",
  },
  subtitle: {
    fontSize: "1rem",
    color: "#374151",
    lineHeight: 1.6,
  },
  brand: {
    fontWeight: "bold",
    color: "#059669",
  },
  loginButton: {
    display: "inline-block",
    marginTop: "2rem",
    padding: "0.9rem 1.5rem",
    background: "#16a34a",
    color: "white",
    fontSize: "1.1rem",
    fontWeight: 600,
    borderRadius: "10px",
    textDecoration: "none",
    boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
    transition: "all 0.3s ease",
  },
};
