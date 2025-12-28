import React from "react";

export default function Amore() {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#f0f0f0",
        padding: "1rem 0.5rem", // 🔹 aggiunto per margine ai lati su mobile
        width: "100%",
        boxSizing: "border-box",
      }}
    >
      <style>
        {`
          /* --- Layout mobile migliorato --- */
          @media (max-width: 768px) {
            .amore-card {
              width: 100% !important; /* 🔹 ora occupa tutta la larghezza */
              min-width: 320px !important; /* 🔹 evita che si stringa troppo */
              margin: 0 auto !important;
              border-radius: 20px !important;
              box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2) !important;
              border: none !important;
              padding: 0 !important;
            }

            /* margine interno del contenuto */
            .amore-card > div {
              padding: 1.2rem !important;
            }

            h1 {
              font-size: 1.6rem !important;
              margin-top: 1rem !important;
              line-height: 1.3 !important;
            }

            p {
              font-size: 1.05rem !important;
              line-height: 1.6 !important;
              text-align: left !important;
            }

            ul {
              margin-left: 1rem !important;
            }

            a {
              font-size: 1rem !important;
              padding: 0.8rem 1.6rem !important;
            }

            img {
              width: 100% !important;
              max-height: 260px !important;
              object-fit: cover !important;
            }

            div::-webkit-scrollbar {
              width: 0; /* Nasconde scrollbar su mobile */
            }
          }

          /* --- Smartphone molto piccoli --- */
          @media (max-width: 480px) {
            h1 {
              font-size: 1.4rem !important;
            }
            p {
              font-size: 0.95rem !important;
            }
          }
        `}
      </style>

      {/* Card centrale */}
      <div
        className="amore-card"
        style={{
          borderRadius: "25px",
          overflow: "hidden",
          boxShadow: "0 12px 35px rgba(0,0,0,0.35)",
          width: "95%",
          maxWidth: "900px",
          textAlign: "center",
          backgroundColor: "white",
          transition: "all 0.3s ease",
          boxSizing: "border-box",
        }}
      >
        {/* Immagine Amore */}
        <img
          src="/Amore.png"
          alt="Amore"
          style={{
            width: "100%",
            height: "auto",
            display: "block",
          }}
        />

        {/* Contenuto */}
        <div
          style={{
            padding: "1.8rem",
            maxHeight: "600px",
            overflowY: "auto",
          }}
        >
          <h1
            style={{
              fontSize: "2rem",
              fontWeight: "bold",
              marginBottom: "1rem",
              color: "#ff4d94",
              lineHeight: "1.2",
            }}
          >
            ❤️ Benvenuti su Chat Amore ❤️
          </h1>

          <p
            style={{
              fontSize: "1.1rem",
              marginBottom: "2rem",
              lineHeight: "1.6",
              textAlign: "justify",
              color: "#444",
              fontStyle: "italic",
              wordBreak: "break-word",
            }}
          >
            Benvenuti nel nostro angolo di serenità! ❤️ <br />
            Chat Amore è la chat giusta dove ogni voce trova ascolto e ogni
            cuore trova un posto in cui sentirsi accolto. Questo è uno spazio
            dove regnano rispetto, amicizia e armonia: un rifugio lontano dalla
            negatività, dove puoi essere semplicemente te stesso.
            <br />
            <br />
            Entra, lasciati avvolgere dall’energia di una famiglia scelta, e vivi
            con noi un’esperienza autentica, fatta di condivisione, calore e
            piccoli momenti che sanno di casa.
          </p>

          <p
            style={{
              fontSize: "1.1rem",
              marginBottom: "1.5rem",
              lineHeight: "1.6",
              textAlign: "justify",
              color: "#333",
              wordBreak: "break-word",
            }}
          >
            Se stai cercando un posto dove fare nuove conoscenze, chiacchierare
            in libertà e – perché no – trovare l’amore, sei nel posto giusto!
            <br />
            <br />
            Chat Amore è il canale Simosnap, creato per accogliere persone di ogni
            età e provenienza che desiderano incontrarsi, condividere momenti e
            costruire nuove amicizie o relazioni speciali.
            <br />
            <br />
            <strong>Perché entrare in Chat Amore?</strong>
            <ul style={{ textAlign: "left", marginLeft: "1.5rem" }}>
              <li>Conoscere nuove persone da tutta Italia</li>
              <li>❤️ Fare amicizia o trovare l’amore in un ambiente accogliente</li>
              <li>Chiacchierare liberamente di musica, passioni e vita quotidiana</li>
              <li>
                Nessuna registrazione obbligatoria, tutto in modo semplice e
                sicuro
              </li>
            </ul>
            <br />
            <strong>Come partecipare</strong>
            <br />
            Accedere è facilissimo: ti basta entrare nella nostra webchat
            utilizzando il tasto qui sotto. Non servono complicate iscrizioni:
            in pochi secondi sarai parte della community!
            <br />
            <br />
            ✨ Non perdere l’occasione di incontrare persone simpatiche,
            disponibili e magari anche la tua dolce metà. Clicca sul pulsante di
            accesso ed entra subito in Amore! Il tuo prossimo incontro speciale
            ti sta aspettando!
          </p>

          {/* Pulsante */}
          <a
            href="https://www.simosnap.org/chat"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              padding: "1rem 2rem",
              fontSize: "1.1rem",
              backgroundColor: "#ff4d94",
              color: "#fff",
              borderRadius: "30px",
              textDecoration: "none",
              boxShadow: "0 5px 12px rgba(0,0,0,0.25)",
              transition: "background-color 0.3s, transform 0.2s",
              display: "inline-block",
              fontWeight: "600",
            }}
            onMouseEnter={(e) => (e.target.style.backgroundColor = "#ff3385")}
            onMouseLeave={(e) => (e.target.style.backgroundColor = "#ff4d94")}
          >
            Entra in Chat
          </a>
        </div>
      </div>
    </div>
  );
}


