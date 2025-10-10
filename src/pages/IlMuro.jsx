import { useState, useEffect, useRef } from "react";
import { supabase } from "../supabaseClient";
import EmojiPicker from "emoji-picker-react";

// --- Lista parole vietate e porn ---
const forbiddenWords = [ /* ...tutte le parole vietate... */ ];
const pornKeywords = ["porn","xxx","adult","sex","pene","vagina","sesso","tette","porno"];

// --- Funzioni di utilità (normalize, levenshtein, censorText, extractVideoId, fetchVideoData, formatDuration) ---
// Puoi mantenere tutte le funzioni che avevi prima

export default function Chat() {
  const [messages, setMessages] = useState([]);
  const [nickname, setNickname] = useState("");
  const [password, setPassword] = useState("");
  const [input, setInput] = useState("");
  const [showPicker, setShowPicker] = useState(false);
  const [mode, setMode] = useState(null);
  const [registeredUsers, setRegisteredUsers] = useState([]);
  const [nickWarning, setNickWarning] = useState("");

  const messagesEndRef = useRef(null);

  // --- Fetch iniziale ---
  useEffect(() => {
    async function fetchData() {
      const [msgsResp, usersResp] = await Promise.all([
        supabase.from("messages").select("*").order("created_at", { ascending: true }),
        supabase.from("registered_users").select("*")
      ]);
      setMessages(msgsResp.data || []);
      setRegisteredUsers(usersResp.data || []);
    }
    fetchData();
  }, []);

  // --- Supabase Realtime ---
  useEffect(() => {
    const channel = supabase.channel("public:messages").on(
      "postgres_changes",
      { event: "INSERT", schema: "public", table: "messages" },
      payload => setMessages(prev => [...prev, payload.new])
    ).subscribe();
    return () => supabase.removeChannel(channel);
  }, []);

  // --- Scroll automatico ---
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // --- Funzioni invio messaggio e login/guest ---
  async function sendMessage() { /* mantieni la logica che avevi */ }
  async function handleLogin() { /* mantieni la logica che avevi */ }
  function handleGuest() { /* mantieni la logica che avevi */ }
  function addEmoji(emojiData){ setInput(prev => prev + emojiData.emoji); setShowPicker(false); }
  function checkNicknameLive(nick) { /* mantieni la logica che avevi */ }

  // --- STILI RESPONSIVE come Amore ---
  const responsiveStyle = `
    @media (max-width: 768px) {
      .ilmuro-card {
        width: 100% !important;
        min-width: 320px !important;
        margin: 0 auto !important;
        border-radius: 20px !important;
        box-shadow: 0 8px 25px rgba(0,0,0,0.2) !important;
        padding: 0 !important;
      }
      .ilmuro-card > div {
        padding: 1.2rem !important;
      }
      input, button {
        width: 100% !important;
        margin-bottom: 0.7rem !important;
      }
      div[style*="display:flex"][style*="alignItems:center"] {
        flex-direction: column !important;
        align-items: flex-start !important;
      }
      div::-webkit-scrollbar { width: 0; }
    }
    @media (max-width: 480px) {
      h2 { font-size: 1.4rem !important; }
    }
  `;

  if (!mode) return (
    <>
      <style>{responsiveStyle}</style>
      <div style={{ padding: "2rem", textAlign: "center" }}>
        <h1 style={{ fontSize: "2rem", marginBottom: "1.5rem", color: "#ff4d94", textShadow: "1px 1px 3px #aaa" }}>Benvenuto/a IL Muro</h1>
        <button onClick={() => setMode("loginForm")} style={{padding:"0.8rem 1.5rem",backgroundColor:"#1a73e8",color:"#fff",borderRadius:"10px",marginRight:"1rem"}}>Registrati / Login</button>
        <button onClick={() => setMode("guestForm")} style={{padding:"0.8rem 1.5rem",backgroundColor:"#ff4d94",color:"#fff",borderRadius:"10px"}}>Entra come Ospite</button>
      </div>
    </>
  );

  if (mode==="loginForm" || mode==="guestForm") {
    const isGuest = mode==="guestForm";
    return (
      <>
        <style>{responsiveStyle}</style>
        <div style={{
          minHeight: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#f0f0f0",
          padding: "1rem 0.5rem",
          width: "100%",
          boxSizing: "border-box"
        }}>
          <div className="ilmuro-card" style={{
            borderRadius: "25px",
            boxShadow: "0 12px 35px rgba(0,0,0,0.35)",
            width: "95%",
            maxWidth: "500px",
            textAlign: "center",
            backgroundColor: "white",
            padding: "2.5rem"
          }}>
            <h2 style={{ marginBottom: "1.5rem", color: "#ff4d94" }}>{isGuest ? "Accesso come Ospite" : "Registrati / Login"}</h2>
            <input placeholder="Nickname" value={nickname} onChange={e => { setNickname(e.target.value); checkNicknameLive(e.target.value); }} />
            {nickWarning && <p style={{ color: "red" }}>{nickWarning}</p>}
            {!isGuest && <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} />}
            <div style={{ marginTop: "1rem" }}>
              <button onClick={isGuest ? handleGuest : handleLogin}>{isGuest ? "Entra" : "Accedi / Registrati"}</button>
              <button onClick={() => setMode(null)}>Indietro</button>
            </div>
          </div>
        </div>
      </>
    );
  }

  // --- Chat attiva ---
  return (
    <>
      <style>{responsiveStyle}</style>
      <div style={{
        padding: "1rem 0.5rem",
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        backgroundColor: "#f0f0f0",
        boxSizing: "border-box"
      }}>
        <div className="ilmuro-card" style={{
          borderRadius: "25px",
          overflow: "hidden",
          boxShadow: "0 12px 35px rgba(0,0,0,0.35)",
          width: "95%",
          maxWidth: "900px",
          backgroundColor: "white",
          display: "flex",
          flexDirection: "column",
          padding: "1.5rem",
          boxSizing: "border-box"
        }}>
          <h2 style={{ marginBottom: "1rem" }}>Chat attiva - Nick: {nickname}</h2>

          <div style={{ marginBottom: "1rem", display: "flex", flexWrap: "wrap", alignItems: "center" }}>
            <input placeholder="Scrivi un messaggio o incolla un link YouTube" value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key==="Enter"&&sendMessage()} style={{ flex: 1, padding: "0.8rem", borderRadius: "8px", border: "1px solid #ccc", marginBottom: "0.5rem" }} />
            <button onClick={() => setShowPicker(!showPicker)} style={{ padding: "0.8rem", marginRight: "0.5rem", marginBottom: "0.5rem" }}>😀</button>
            <button onClick={sendMessage} style={{ padding: "0.8rem 1.2rem", backgroundColor: "#ff4d94", color: "#fff", border: "none", borderRadius: "8px", cursor: "pointer", marginBottom: "0.5rem" }}>Invia</button>
          </div>

          {showPicker && <EmojiPicker onEmojiClick={addEmoji}/>}

          <div style={{ border: "1px solid #ccc", padding: "0.5rem", maxHeight: "60vh", overflowY: "auto", fontSize: "1rem" }}>
            {messages.map((msg, idx) => (
              <div key={idx} style={{ padding: "0 0", margin: "0 0 12px 0" }}>
                <div style={{ lineHeight: "1.3", wordBreak: "break-word" }}>
                  <strong>{msg.nickname}: </strong>
                  {msg.video ? "" : censorText(msg.text)}
                </div>
                {msg.video && (
                  <div style={{ display: "flex", alignItems: "center", border: "1px solid #ddd", borderRadius: "6px", padding: "4px", backgroundColor: "#fff", marginTop: "4px", flexWrap: "wrap" }}>
                    <img src={msg.video.thumbnail} alt="Thumbnail" style={{ width: "300px", height: "200px", marginRight: "10px", borderRadius: "4px" }}/>
                    <div>
                      <a href={`https://www.youtube.com/watch?v=${extractVideoId(msg.text)}`} target="_blank" rel="noopener noreferrer" style={{ fontWeight: "bold", color: "#1a73e8", textDecoration: "none", fontSize: "1.2rem" }}>{msg.video.title}</a>
                      <p style={{ margin: 0, fontSize: "1rem" }}>Canale: {msg.video.channel}</p>
                      <p style={{ margin: 0, fontSize: "1rem" }}>Durata: {formatDuration(msg.video.duration)}</p>
                    </div>
                  </div>
                )}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        </div>
      </div>
    </>
  );
}
