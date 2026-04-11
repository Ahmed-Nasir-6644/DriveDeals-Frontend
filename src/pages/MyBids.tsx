import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import styles from "../styles/BrowseCars.module.css";

interface Ad {
  id: number;
  make: string;
  model: string;
  variant: string;
  color: string;
  engine_capacity: number;
  fuel_type: string;
  transmission: string;
  mileage: number;
  body_type: string;
  features: string;
  images: string[];
  location: string;
  registered_in: string;
  model_year: number;
  description: string;
  price: number;
  created_at: string;
  updated_at: string;
  owner: {
    id: number;
    first_name: string;
    last_name: string;
  };
}

const MyBids = () => {
  const [ads, setAds] = useState<Ad[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
  const token = localStorage.getItem("token");
    fetch(`${import.meta.env.VITE_BACKEND_URL}/bids/getMyBids`, {
      method: "GET",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => setAds(data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading)
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinnerWrapper}>
          <div className={styles.spinner}></div>
          <p className={styles.loadingText}>Loading your bids...</p>
        </div>
      </div>
    );
  if (error) return <div>Error: {error}</div>;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>My Bids</h1>
      </div>
      <div className={styles.list}>
        {ads.length === 0 ? (
          <div>No ads found.</div>
        ) : (
          ads.map((ad) => (
            <div key={ad.id} className={styles.card}>
              <img
                src={ad.images?.[0] || "/placeholder-car.jpg"}
                alt={`${ad.make} ${ad.model}`}
                className={styles.image}
              />
              <div className={styles.info}>
                <h2 className={styles.carTitle}>
                  {ad.make} {ad.model} {ad.variant}
                </h2>
                <p className={styles.price}>PKR {ad.price} lacs</p>
                <p className={styles.details}>
                  {ad.model_year} • {ad.mileage} km • {ad.color}
                </p>
                <p className={styles.location}>
                  📍 {ad.location}, Registered in {ad.registered_in}
                </p>
                <p className={styles.desc}>{ad.description}</p>
                <Link to={`/ad/${ad.id}`} className={styles.button}>
                  View Details
                </Link>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default MyBids;
