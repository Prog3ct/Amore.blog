import React from "react";

export default function Amore() {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
        backgroundColor: "#f5f5f5",
        padding: "1rem",
      }}
    >
      <div className="amore-card" style={styles.card}>
        <img
          src="https://images.unsplash.com/photo-1504198453319-5ce911bafcde?auto=format&fit=crop&w=800&q=80"
          alt="Cuore"
          style={styles.image}
        />
        <h2 style={styles.title}>💗 Benvenuti su Chat Amore 💗</h2>
        <p style={styles.text}>
          Benvenuti nel nostro angolo di serenità! ❤️
          <br />
          Chat Amore è la chat giusta dove ogni voce trova ascolto e ogni cuore
          trova un posto in cui sentirsi accolto.
        </p>
      </div>

      {/* Stili responsive */}
      <style>{`
        @media (max-width: 768px) {
          .amore-card {
            width: 100vw !important;
            margin: 0 calc(-1 * (100vw - 100%) / 2) !important;
            border-radius: 0 !important;
            box-shadow: none !important;
            border: none !important;
          }

          .amore-card img {
            width: 100% !important;
            height: auto !important;
            border-radius: 0 !important;
          }

          .amore-card h2 {
            font-size: 1.5rem !important;
          }

          .amore-card p {
            font-size: 1rem !important;
            padding: 0 1rem;
          }
        }
      `}</style>
    </div>
  );
}

const styles = {
  card: {
    backgroundColor: "#fff",
    borderRadius: "25px",
    boxShadow: "0 10px 25px rgba(0, 0, 0, 0.15)",
    padding: "2rem",
    maxWidth: "500px",
    textAlign: "center",
    transition: "all 0.3s ease",
  },
  image: {
    width: "100%",
    height: "auto",
    borderRadius: "15px",
    marginBottom: "1.5rem",
  },
  title: {
    color: "#ff4d94",
    marginBottom: "1rem",
  },
  text: {
    fontSize: "1.1rem",
    lineHeight: "1.6",
    color: "#333",
  },
};
