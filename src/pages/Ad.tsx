import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom"; // <-- React Router
import styles from "../styles/AdDetail.module.css";
import ImageSlider from "../components/ImageSlider";
import ChatButton from "../components/chatButton";
import { useAuth } from "../context/AuthContext";
// socket client
import { io, Socket } from "socket.io-client";

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

interface Recommendation {
  id: number;
  make: string;
  model: string;
  variant: string;
  model_year: number;
  mileage: number;
  price: number;
  location: string;
  description: string;
  features: string;
  pictures: string;
  score: number;
}

export default function AdDetailPage() {
  const { id } = useParams(); // <-- Works in React now
  const [ad, setAd] = useState<Ad | null>(null);
  const [features, setFeatures] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  // Bidding state
  const [bids, setBids] = useState<
    Array<{ user: string; amount: number; time: string }>
  >([]);
  const [newBid, setNewBid] = useState<number | "">("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState<string>("");
  const [bidsLoading, setBidsLoading] = useState(false);
  const [showNewBidBanner, setShowNewBidBanner] = useState(false);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [recsLoading, setRecsLoading] = useState(false);

  const [loggedInUserId, setLoggedInUserId] = useState<number | null>(null);
  const { email } = useAuth();
  const [auctionEnded, setAuctionEnded] = useState(false);
  const [placingBid, setPlacingBid] = useState(false);
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    if (!email) return;

    fetch(`${import.meta.env.VITE_BACKEND_URL}/users/get-by-email?email=${email}`)
      .then((res) => res.json())
      .then((user) => setLoggedInUserId(user.id))
      .catch((err) => console.error("Error fetching logged-in user:", err));
  }, [email]);

  // Initialize socket connection on component mount
  useEffect(() => {
    const isProduction = import.meta.env.VITE_BACKEND_URL?.includes('.vercel.app');
    const newSocket = io(`${import.meta.env.VITE_BACKEND_URL}/bids`, {
      transports: isProduction ? ['polling', 'websocket'] : ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 10,
    });
    setSocket(newSocket);
    return () => {
      newSocket.close();
    };
  }, []);

  useEffect(() => {
    async function fetchAd() {
      try {
        const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/ads/get/adById/${id}`);
        if (!res.ok) throw new Error("Failed to fetch ad");
        const data = await res.json();
        let parsedFeatures: string[] = [];
        if (typeof data.features === "string") {
          try {
            parsedFeatures = JSON.parse(data.features);
          } catch {
            parsedFeatures = data.features
              .replace("[", "")
              .replace("]", "")
              .replaceAll('"', "")
              .split(",")
              .map((f: string) => f.trim());
          }
        } else if (Array.isArray(data.features)) {
          parsedFeatures = data.features;
        }
        setAd(data);
        setFeatures(parsedFeatures);

        // Fetch recommendations
        await fetchRecommendations(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    async function fetchRecommendations(adData: Ad) {
      try {
        setRecsLoading(true);
        const payload = {
          ad: {
            make: adData.make,
            model: adData.model,
            variant: adData.variant,
            model_year: adData.model_year,
            mileage: adData.mileage,
            price: adData.price * 100000, // Convert lacs to full price
            location: adData.location,
          },
          top_k: 5,
          limit: 200,
        };

        console.log("Sending payload to recommendation API:", payload);

        const res = await fetch(`${import.meta.env.VITE_RECOMMEND_SERVICE_URL}/recommend`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        console.log("Recommendations API response status:", res.status);

        if (!res.ok) {
          const errorText = await res.text();
          console.error("API error response:", errorText);
          throw new Error(`Failed to fetch recommendations: ${res.status}`);
        }

        const data = await res.json();
        console.log("Recommendations data received:", data);
        // Filter out the current ad from recommendations
        const filteredResults = (data.results || []).filter(
          (rec: Recommendation) => rec.id !== adData.id
        );
        setRecommendations(filteredResults);
      } catch (err) {
        console.error("Error fetching recommendations:", err);
        setRecommendations([]);
      } finally {
        setRecsLoading(false);
      }
    }

    if (id) fetchAd();
    async function fetchBids() {
      if (!id) return;
      setBidsLoading(true);
      try {
        const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/bids/get/byAd/${id}`);
        if (!res.ok) throw new Error("Failed to fetch bids");
        const data = await res.json();
        // Expecting array of { user, amount, time }
        setBids(Array.isArray(data) ? data : []);
      } catch (err) {
        setBids([]);
      } finally {
        setBidsLoading(false);
      }
    }
    function joinRoom() {
      socket?.emit("joinRoom", { adId: id });
    }
    if (id) {
      fetchAd();
      fetchBids();
      joinRoom();
    }
  }, [id]);

  useEffect(() => {
    if (!socket) return;
    function handleNewBid(_bid: {
      user: string;
      amount: number;
      time: string;
    }) {
      // Optionally update bids instantly here if you want real-time
      setShowNewBidBanner(true);
      setTimeout(() => setShowNewBidBanner(false), 10000);
      setBids((prevBids) => [...prevBids, _bid]);
      console.log(_bid);
    }
    socket.on("new_bid", handleNewBid);
    return () => {
      socket.off("new_bid", handleNewBid);
    };
  }, [socket]);

  // Setup a default auction end time: try ad.auction_ends_at else 24 hours after created_at
  useEffect(() => {
    if (!ad) return;

    let end = null as Date | null;
    // If API provides an auction end field, use it (assumption). Otherwise, default to 24 hours after created_at
    // Assumption: ad.auction_ends_at may be present as ISO string. If not, fallback.
    // Note: If you have a server-provided auction end, replace this logic to use that value.
    // @ts-ignore
    if (ad.auction_ends_at) {
      // @ts-ignore
      end = new Date(ad.auction_ends_at);
    } else {
      end = new Date(ad.created_at);
      end.setHours(end.getHours() + 24);
    }

    function update() {
      const diff = end!.getTime() - Date.now();
      if (diff <= 0) {
        setTimeLeft("Auction ended");
        setAuctionEnded(true);
        return;
      }
      setAuctionEnded(false);
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((diff / (1000 * 60)) % 60);
      const seconds = Math.floor((diff / 1000) % 60);
      setTimeLeft(
        `${days}d ${String(hours).padStart(2, "0")}h:${String(minutes).padStart(
          2,
          "0"
        )}m:${String(seconds).padStart(2, "0")}s`
      );
    }

    update();
    const t = setInterval(update, 1000);
    return () => clearInterval(t);
  }, [ad]);

  // Helpers for bidding
  const highestBid =
    bids.length > 0 ? Math.max(...bids.map((b) => b.amount)) : ad?.price ?? 0;
  const minIncrement = 0.1; // minimum increment (in same units as `ad.price`, e.g., lacs)
  const minBid = parseFloat(
    (Math.max(highestBid, ad?.price ?? 0) + minIncrement).toFixed(2)
  );

  async function handlePlaceBid(e: React.FormEvent) {
    e.preventDefault();
    const token = localStorage.getItem("token");
    if (!token) return alert("You must be logged in to place a bid");
    
    if (!ad) return;
    
  setError(null);
  setSuccess(null);
  setPlacingBid(true);

    // Check if auction has ended
    let end = null as Date | null;
    // @ts-ignore
    if (ad.auction_ends_at) { 
      // @ts-ignore
      end = new Date(ad.auction_ends_at);
    } else {
      end = new Date(ad.created_at);
      end.setHours(end.getHours() + 24);
    }
    
    if (end && end.getTime() <= Date.now()) {
      setError("This auction has ended. No new bids can be placed.");
      return;
    }

    if (newBid === "") {
      setError(`Please enter a bid of at least ${minBid}`);
      return;
    }

    const val = Number(newBid);
    if (isNaN(val) || val < minBid) {
      setError(`Bid must be a number and at least ${minBid}`);
      return;
    }

    const user = "You"; // Placeholder: replace with logged-in user's name when available
    try {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/bids/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ adId: Number(id), token, amount: val })
      });
      if (!res.ok) {
        const errorData = await res.json();
        console.error("Bid creation error:", errorData);
        throw new Error(errorData.message || "Failed to place bid");
      }
      setSuccess("Bid placed successfully");
      setNewBid("");
      // Update bids
      socket?.emit("place_bid", {
        adId: Number(id),
        user,
        amount: val,
        time: Date.now(),
      });
      // Refresh bids
      const bidsRes = await fetch(`${import.meta.env.VITE_BACKEND_URL}/bids/get/byAd/${id}`);
      if (bidsRes.ok) {
        const data = await bidsRes.json();
        setBids(Array.isArray(data) ? data : []);
      }
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error("Bid error:", err);
      setError(err instanceof Error ? err.message : "Failed to place bid. Try again.");
    } finally {
      setPlacingBid(false);
    }
  }

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinnerWrapper}>
          <div className={styles.spinner}></div>
          <p className={styles.loadingText}>Loading ad details...</p>
        </div>
      </div>
    );
  }
  if (!ad) return <p className={styles.message}>Ad not found.</p>;

  const downloadPDF = async () => {
    const { jsPDF } = await import("jspdf");
    const html2canvas = (await import("html2canvas")).default;

    const pdf = new jsPDF("p", "mm", "a4");

    pdf.setFont("Helvetica");

    let y = 10;

    // ---- Title ----
    pdf.setFontSize(20);
    pdf.text(`${ad.make} ${ad.model} ${ad.variant}`, 10, y);
    y += 10;

    // ---- Price ----
    pdf.setFontSize(14);
    pdf.text(`Price: PKR ${ad.price} lacs`, 10, y);
    y += 10;

    // ---- Car Images ----
    for (const img of ad.images) {
      try {
        const imgElement = new Image();
        imgElement.crossOrigin = "anonymous";
        imgElement.src = img;

        await new Promise((resolve) => (imgElement.onload = resolve));

        const canvas = await html2canvas(imgElement);
        const imgData = canvas.toDataURL("image/jpeg");

        const imgWidth = 180;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;

        if (y + imgHeight > 280) {
          pdf.addPage();
          y = 10;
        }

        pdf.addImage(imgData, "JPEG", 10, y, imgWidth, imgHeight);
        y += imgHeight + 10;
      } catch (err) {
        console.error("Error loading image:", err);
      }
    }

    // ---- Text Details ----
    const text = `
Mileage: ${ad.mileage} km
Model Year: ${ad.model_year}
Transmission: ${ad.transmission}
Fuel Type: ${ad.fuel_type}
Color: ${ad.color}
Location: ${ad.location}
Registered In: ${ad.registered_in}
Posted By: ${ad.owner?.first_name ?? "Unknown"} ${ad.owner?.last_name}
Posted On: ${new Date(ad.created_at).toDateString()}
  `;

    pdf.setFontSize(12);

    const lines = pdf.splitTextToSize(text, 180);
    if (y + lines.length * 7 > 280) {
      pdf.addPage();
      y = 10;
    }

    pdf.text(lines, 10, y);
    y += lines.length * 7 + 10;

    // ---- Description ----
    const descLines = pdf.splitTextToSize(
      `Description:\n${ad.description}`,
      180
    );

    if (y + descLines.length * 7 > 280) {
      pdf.addPage();
      y = 10;
    }

    pdf.text(descLines, 10, y);

    // ---- Save ----
    pdf.save(`${ad.make}-${ad.model}-${ad.model_year}.pdf`);
  };

  return (
    <div className={styles.container}>
      {/* Header */}
      <section className={styles.header}>
        <h1 className={styles.title}>
          {ad.make} {ad.model} {ad.variant}
        </h1>
        <p className={styles.price}>Price: PKR {ad.price} lacs</p>
      </section>

      {/* Image slider */}
      {ad.images && ad.images.length > 0 && <ImageSlider images={ad.images} />}

      {/* Bidding Section */}
      <section className={styles.bidSection}>
        {/* NEW BID Banner */}
        {showNewBidBanner && (
          <div className={styles.newBidBanner}>
            <span className={styles.newBidText}>NEW BID!</span>
          </div>
        )}
        
        {/* AUCTION ENDED Banner */}
        {auctionEnded && bids.length > 0 && (
          <div className={styles.auctionEndedBanner}>
            <div className={styles.auctionEndedContent}>
              <h2 className={styles.auctionEndedTitle}>🎉 Auction Ended 🎉</h2>
              <p className={styles.auctionEndedText}>Highest Bid</p>
              <p className={styles.winningBid}>PKR {highestBid} lacs</p>
              <p className={styles.auctionEndedSubtext}>Congratulations to the winner!</p>
            </div>
          </div>
        )}
        
        <div className={styles.bidHeader}>
          <h2>Live Auction</h2>
          <div className={styles.timer} aria-live="polite">
            {timeLeft}
          </div>
        </div>

        <div className={styles.bidContent}>
          <div className={styles.topBids}>
            <h3>Top Bids</h3>
            <table className={styles.bidsTable}>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Bidder</th>
                  <th>Amount (lacs)</th>
                  <th>Time</th>
                </tr>
              </thead>
              <tbody>
                {bidsLoading ? (
                  <tr>
                    <td colSpan={4} className={styles.noBids}>
                      Loading bids...
                    </td>
                  </tr>
                ) : bids.length === 0 ? (
                  <tr>
                    <td colSpan={4} className={styles.noBids}>
                      No bids yet
                    </td>
                  </tr>
                ) : (
                  bids
                    .slice()
                    .sort((a, b) => b.amount - a.amount)
                    .slice(0, 3)
                    .map((b, idx) => (
                      <tr key={idx}>
                        <td>{idx + 1}</td>
                        <td>{b.user}</td>
                        <td>{b.amount}</td>
                        <td>{new Date(b.time).toLocaleString()}</td>
                      </tr>
                    ))
                )}
              </tbody>
            </table>
          </div>

          <div className={styles.placeBid}>
            <h3>Place a New Bid</h3>
            {auctionEnded ? (
              <div className={styles.auctionClosedMessage}>
                <p className={styles.closedText}>This auction has ended</p>
              </div>
            ) : (
              <form onSubmit={handlePlaceBid} className={styles.bidForm}>
                <label className={styles.minNote}>
                  Minimum bid: <strong>{minBid} lacs</strong>
                </label>
                <input
                  type="number"
                  step={0.1}
                  // min={minBid}
                  // value={newBid}
                  onChange={(e) => setNewBid(e.target.value === "" ? "" : Number(e.target.value))}
                  className={styles.bidInput}
                  aria-label="Enter your bid in lacs"
                />

                <div className={styles.formRow}>
                  <button type="submit" className={styles.bidButton} disabled={placingBid}>
                    {placingBid ? "Placing Bid..." : "Place bid"}
                  </button>
                </div>

                {error && <div className={styles.error}>{error}</div>}
                {success && <div className={styles.success}>{success}</div>}
              </form>
            )}
          </div>
        </div>
      </section>

      {/* Details Table */}
      <div className={styles.details}>
        <table className={styles.table}>
          <tbody>
            <tr>
              <td>
                <strong>Mileage: </strong> {ad.mileage} km
              </td>
              <td>
                <strong>Model year: </strong> {ad.model_year}
              </td>
              <td>
                <strong>Transmission: </strong> {ad.transmission}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Additional Details */}
      <div className={styles.details2}>
        <strong>Additional Details:</strong>
        <ul>
          <li>Location:</li>
          <li>{ad.location}</li>

          <li>Color:</li>
          <li>{ad.color}</li>

          <li>Fuel Type:</li>
          <li>{ad.fuel_type}</li>

          <li>Last Updated:</li>
          <li>{new Date(ad.updated_at).toDateString()}</li>

          <li>Ad Id:</li>
          <li>#{ad.id}</li>
        </ul>
      </div>

      {/* Features */}
      <div className={styles.details3}>
        <strong>Features:</strong>
        {Array.isArray(features) && features.length > 0 ? (
          <ul>
            {features.map((feature, index) => (
              <li key={index}>{feature}</li>
            ))}
          </ul>
        ) : (
          <p>No features available</p>
        )}
      </div>

      {/* Description */}
      <div className={styles.description}>
        <strong>
          Seller Comments:
          <br />
        </strong>
        {ad.description}
      </div>

      {/* User Info */}
      <div className={styles.userBox}>
        <h2 className={styles.subtitle}>Posted By</h2>
        <p>
          Owner: {ad.owner?.first_name ?? "Unknown"} {ad.owner?.last_name}
        </p>
        <p className={styles.date}>
          Posted on {new Date(ad.created_at).toDateString()}
        </p>
        <button className={styles.pdfButton} onClick={downloadPDF}>
         ⬇️ Download Ad
        </button>
        {loggedInUserId && ad.owner.id !== loggedInUserId && (
          <ChatButton ownerId={ad.owner.id} />
        )}
      </div>

      {/* Recommendations Section */}
      <div className={styles.recommendationsSection}>
        <h2 className={styles.subtitle}>Recommended Cars</h2>
        {recsLoading ? (
          <p className={styles.message}>Loading recommendations...</p>
        ) : recommendations.length > 0 ? (
          <div className={styles.recommendationsGrid}>
            {recommendations.map((rec) => (
              <div key={rec.id} className={styles.recCard}>
                {rec.pictures && (
                  <img
                    src={rec.pictures.split(",")[0]}
                    alt={`${rec.make} ${rec.model}`}
                    className={styles.recImage}
                  />
                )}
                <div className={styles.recContent}>
                  <h3 className={styles.recTitle}>
                    {rec.make} {rec.model} {rec.variant}
                  </h3>
                  <p className={styles.recPrice}>PKR {rec.price} lacs</p>
                  <p className={styles.recDetails}>
                    {rec.model_year} • {rec.mileage} km
                  </p>
                  <p className={styles.recLocation}>📍 {rec.location}</p>
                  {/* <p className={styles.recScore}>
                    Match Score: {(rec.score * 100).toFixed(0)}%
                  </p> */}
                  <Link to={`/ad/${rec.id}`} className={styles.recButton}>
                    View Details
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className={styles.message}>No recommendations available</p>
        )}
      </div>
    </div>
  );
}