import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation } from "react-router-dom";
import Amore from "./pages/Amore";
import ILMuro from "./pages/IlMuro";

function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();

  const buttons = [
    { name: "Amore", path: "/amore", color: "#ff4d94" },
    { name: "IL MURO", path: "/il-muro", color: "#1a73e8" },
  ];

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        padding: "1rem 2rem",
        backgroundColor: "#282c34",
        position: "sticky",
        top: 0,
        zIndex: 1000,
      }}
    >
      {buttons.map((btn) => {
        const isActive = location.pathname === btn.path;
        return (
          <button
            key={btn.name}
            onClick={() => navigate(btn.path)}
            style={{
              padding: "0.7rem 2rem",
              borderRadius: "50px",
              border: "none",
              fontSize: "1rem",
              fontWeight: "bold",
              cursor: "pointer",
              color: isActive ? btn.color : "#fff",
              backgroundColor: isActive ? "#fff" : btn.color,
              boxShadow: isActive ? `0 0 10px ${btn.color}` : "0 3px 6px rgba(0,0,0,0.2)",
              transition: "all 0.3s",
            }}
            onMouseOver={(e) => (e.currentTarget.style.transform = "scale(1.05)")}
            onMouseOut={(e) => (e.currentTarget.style.transform = "scale(1)")}
          >
            {btn.name}
          </button>
        );
      })}
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <Navbar />
      <div style={{ padding: "2rem" }}>
        <Routes>
          <Route path="/amore" element={<Amore />} />
          <Route path="/il-muro" element={<ILMuro />} />
          <Route path="/" element={<Amore />} />
          <Route path="*" element={<Amore />} />
        </Routes>
      </div>
    </Router>
  );
}
