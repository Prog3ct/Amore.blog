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
        padding: "2rem",
      }}
    >
      {/* Card centrale */}
      <div
        style={{
          borderRadius: "25px",
          overflow: "hidden",
          boxShadow: "0 12px 35px rgba(0,0,0,0.35)",
          width: "95%",
          maxWidth: "1000px",
          textAlign: "center",
          backgroundColor: "white",
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

        {/* Contenuto della card */}
        <div
          style={{
            padding: "2.5rem",
            maxHeight: "600px",
            overflowY: "auto",
          }}
        >
          <h1
            style={{
              fontSize: "3rem",
              fontWeight: "bold",
              marginBottom: "1rem",
            }}
          >
            ❤️ Benvenuti su Chat Amore ❤️
          </h1>

          {/* --- NUOVO PARAGRAFO INSERITO QUI --- */}
          <p
            style={{
              fontSize: "1.3rem",
              marginBottom: "2rem",
              lineHeight: "1.6",
              textAlign: "justify",
              color: "#444",
              fontStyle: "italic",
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
          {/* --- FINE NUOVO PARAGRAFO --- */}

          <p
            style={{
              fontSize: "1.3rem",
              marginBottom: "1.5rem",
              lineHeight: "1.6",
              textAlign: "justify",
            }}
          >
            Se stai cercando un posto dove fare nuove conoscenze, chiacchierare
            in libertà e – perché no – trovare l’amore, sei nel posto giusto!
            <br />
            <br />
            Chat Amore è il canale Orixon, creato per accogliere persone di ogni
            età e provenienza che desiderano incontrarsi, condividere momenti e
            costruire nuove amicizie o relazioni speciali.
            <br />
            <br />
            <strong>Perché entrare in Chat Amore?</strong>
            <ul style={{ textAlign: "left", marginLeft: "2rem" }}>
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
            utilizzando il tasto che si trova in basso. Non servono complicate
            iscrizioni: in pochi secondi sarai parte della community!
            <br />
            <br />
            ✨ Non perdere l’occasione di incontrare persone simpatiche,
            disponibili e magari anche la tua dolce metà. Clicca sul pulsante di
            accesso ed entra subito in Amore! Il tuo prossimo incontro speciale
            ti sta aspettando!
          </p>

          {/* Pulsante */}
          <a
            href="https://webchat.orixon.org/"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              padding: "1rem 3rem",
              fontSize: "1.2rem",
              backgroundColor: "#ff4d94",
              color: "#fff",
              borderRadius: "30px",
              textDecoration: "none",
              boxShadow: "0 5px 12px rgba(0,0,0,0.25)",
              transition: "background-color 0.3s",
              display: "inline-block",
              fontWeight: "600",
              marginTop: "1.5rem",
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
