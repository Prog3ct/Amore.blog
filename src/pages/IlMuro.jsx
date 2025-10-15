import { useState, useEffect, useRef } from "react";
import { supabase } from "../supabaseClient";
import EmojiPicker from "emoji-picker-react";

// --- Lista parole vietate ---
const forbiddenWords = [ /* ...la lista che avevi... */ ];

// --- Parole chiave porno ---
const pornKeywords = [ /* ...lista porno... */ ];

// --- Normalizzazione e funzioni nickname (containsForbiddenWord, isNicknameAllowed, levenshteinDistance, normalizeNick) ---
// --- Funzioni YouTube (extractVideoId, fetchVideoData, formatDuration) ---
// --- Funzioni messaggi (censorText, extractGifUrl) ---
// ... Mantieni le stesse funzioni del tuo codice originale ...

export default function Chat() {
  const [messages, setMessages] = useState([]);
  const [nickname, setNickname] = useState("");
  const [password, setPassword] = useState("");
  const [input, setInput] = useState("");
  const [showPicker, setShowPicker] = useState(false);
  const [mode, setMode] = useState(null);
  const [registeredUsers, setRegisteredUsers] = useState([]);
  const [nickWarning, setNickWarning] = useState("");
  const messageBoxRef = useRef(null);

  // --- fetch dati iniziali ---
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

  // --- subscription messaggi in tempo reale ---
  useEffect(() => {
    const channel = supabase.channel("public:messages").on(
      "postgres_changes",
      { event: "INSERT", schema: "public", table: "messages" },
      payload => setMessages(prev => [...prev, payload.new])
    ).subscribe();
    return () => supabase.removeChannel(channel);
  }, []);

  // --- scroll automatico ---
  useEffect(() => {
    const el = messageBoxRef.current;
    if (!el) return;
    requestAnimationFrame(() => { el.scrollTop = 0; });
  }, [messages]);

  // --- invio messaggi ---
  async function sendMessage() {
    const trimmedNick = nickname.trim();
    const trimmedMsg = input.trim();
    if (!trimmedNick) { alert("Devi inserire un nickname!"); return; }
    if (!trimmedMsg) return;
    if (pornKeywords.some(w => trimmedMsg.toLowerCase().includes(w))) { alert("Non puoi inviare contenuti pornografici!"); return; }

    const videoId = extractVideoId(trimmedMsg);
    let videoData = null;
    if (videoId) videoData = await fetchVideoData(videoId);

    const gifUrl = extractGifUrl(trimmedMsg);

    const newMessage = { nickname: trimmedNick, text: trimmedMsg };
    if (videoData) newMessage.video = videoData;
    if (gifUrl) newMessage.gifUrl = gifUrl;

    const { error } = await supabase.from("messages").insert([newMessage]);
    if (error) { console.error("Errore invio messaggio:", error); alert("Errore invio messaggio"); return; }

    setInput("");
  }

  // --- login / guest ---
  async function handleLogin() {
    const trimmedNick = nickname.trim();
    if (!trimmedNick) { alert("Devi inserire un nickname!"); return; }
    if (containsForbiddenWord(trimmedNick)) { alert("Nickname non consentito!"); return; }
    const existingUser = registeredUsers.find(u => u.nickname === trimmedNick);
    if (existingUser) {
      if (existingUser.password === password) { alert("Login riuscito!"); setMode("chat"); }
      else alert("Password errata!");
    } else {
      const { error } = await supabase.from("registered_users").insert([{ nickname: trimmedNick, password }]);
      if (!error) { setRegisteredUsers([...registeredUsers, { nickname: trimmedNick, password }]); alert("Nickname registrato!"); setMode("chat"); }
    }
  }

  function handleGuest() {
    const trimmedNick = nickname.trim();
    if (!trimmedNick) { alert("Devi inserire un nickname!"); return; }
    if (containsForbiddenWord(trimmedNick)) { alert("Nickname non consentito!"); return; }
    if (!isNicknameAllowed(trimmedNick, registeredUsers.map(u => u.nickname))) { alert("Nickname non disponibile (registrato o troppo simile)"); return; }
    setMode("chat"); alert("Accesso come ospite consentito!");
  }

  function addEmoji(emojiData) { setInput(prev => prev + emojiData.emoji); setShowPicker(false); }
  function checkNicknameLive(nick) {
    if (!nick) { setNickWarning(""); return; }
    if (containsForbiddenWord(nick)) { setNickWarning("⚠️ Questo nickname contiene parole non consentite!"); return; }
    if (!isNicknameAllowed(nick, registeredUsers.map(u => u.nickname))) { setNickWarning("⚠️ Nickname già registrato o troppo simile ad un altro!"); return; }
    setNickWarning("");
  }

  // --- stili responsive ---
  const responsiveStyle = `
    * { box-sizing: border-box; }

    @media (max-width: 600px) {
      .chat-container, .login-container {
        width: 100% !important;
        max-width: 100% !important;
        padding: 1rem !important;
      }

      .chat-input {
        width: 100% !important;
        margin-bottom: 0.5rem !important;
      }

      .message-box {
        width: 100% !important;
        max-width: 100% !important;
        padding: 0.5rem !important;
      }

      .message-box img {
        width: 100% !important;
        height: auto !important;
        max-width: 100% !important;
        border-radius: 4px;
      }

      .youtube-container {
        width: 100% !important;
        max-width: 100% !important;
      }
    }
  `;

  // --- Schermata iniziale ---
  if (!mode) return (
    <>
      <style>{responsiveStyle}</style>
      <div className="chat-container" style={{ padding: "2rem", textAlign: "center" }}>
        <h1 style={{ fontSize: "2rem", marginBottom: "1.5rem", color: "#ff4d94", textShadow: "1px 1px 3px #aaa" }}>Benvenuto/a IL Muro</h1>
        <button onClick={() => setMode("loginForm")} style={{ padding: "0.8rem 1.5rem", fontSize: "1rem", backgroundColor: "#1a73e8", color: "#fff", border: "none", borderRadius: "10px", cursor: "pointer", marginRight: "1rem" }}>Registrati / Login</button>
        <button onClick={() => setMode("guestForm")} style={{ padding: "0.8rem 1.5rem", fontSize: "1rem", backgroundColor: "#ff4d94", color: "#fff", border: "none", borderRadius: "10px", cursor: "pointer" }}>Entra come Ospite</button>
      </div>
    </>
  );

  // --- LoginForm / GuestForm ---
  if (mode === "loginForm" || mode === "guestForm") {
    const isGuest = mode === "guestForm";
    return (
      <>
        <style>{responsiveStyle}</style>
        <div className="login-container" style={{ minHeight: "100vh", display: "flex", justifyContent: "center", alignItems: "center", backgroundColor: "#f0f0f0", padding: "2rem" }}>
          <div style={{ borderRadius: "25px", boxShadow: "0 12px 35px rgba(0,0,0,0.35)", width: "95%", maxWidth: "500px", textAlign: "center", backgroundColor: "white", padding: "2.5rem" }}>
            <h2 style={{ marginBottom: "1.5rem", color: "#ff4d94" }}>{isGuest ? "Accesso come Ospite" : "Registrati / Login"}</h2>
            <input
              className="chat-input"
              placeholder="Nickname"
              value={nickname}
              onChange={e => { setNickname(e.target.value); checkNicknameLive(e.target.value); }}
              style={{ marginBottom: "0.5rem", width: "90%", padding: "0.8rem", borderRadius: "8px", border: "1px solid #ccc" }}
            />
            {nickWarning && <p style={{ color: "red" }}>{nickWarning}</p>}
            {!isGuest && (
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                style={{ marginBottom: "0.5rem", width: "90%", padding: "0.8rem", borderRadius: "8px", border: "1px solid #ccc" }}
              />
            )}
            <div style={{ marginTop: "1rem" }}>
              <button
                onClick={isGuest ? handleGuest : handleLogin}
                style={{ padding: "0.8rem 1.5rem", fontSize: "1rem", backgroundColor: isGuest ? "#ff4d94" : "#1a73e8", color: "#fff", border: "none", borderRadius: "10px", cursor: "pointer", marginRight: "0.5rem" }}
              >
                {isGuest ? "Entra" : "Accedi / Registrati"}
              </button>
              <button
                onClick={() => setMode(null)}
                style={{ padding: "0.8rem 1.5rem", fontSize: "1rem", backgroundColor: isGuest ? "#1a73e8" : "#ff4d94", color: "#fff", border: "none", borderRadius: "10px", cursor: "pointer" }}
              >
                Indietro
              </button>
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
      <div className="chat-container" style={{ padding: "2rem", minHeight: "100vh", backgroundColor: "#f0f0f0", display: "flex", flexDirection: "column", alignItems: "center" }}>
        <h2 style={{ marginBottom: "1rem" }}>Chat attiva - Nick: {nickname}</h2>
        <div style={{ marginBottom: "1rem", width: "90%", maxWidth: "900px" }}>
          <input
            className="chat-input"
            placeholder="Scrivi un messaggio o incolla un link YouTube o GIF"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && sendMessage()}
            style={{ width: "70%", padding: "0.8rem", borderRadius: "8px", border: "1px solid #ccc", fontSize: "1rem", marginRight: "0.5rem" }}
          />
          <button onClick={() => setShowPicker(!showPicker)} style={{ padding: "0.8rem", fontSize: "1rem", marginRight: "0.5rem" }}>😀</button>
          <button onClick={sendMessage} style={{ padding: "0.8rem 1.2rem", fontSize: "1rem", backgroundColor: "#ff4d94", color: "#fff", border: "none", borderRadius: "8px", cursor: "pointer" }}>Invia</button>
        </div>
        {showPicker && <EmojiPicker onEmojiClick={addEmoji} />}
        <div ref={messageBoxRef} className="message-box" style={{ border: "1px solid #ccc", padding: "0.5rem", maxHeight: "70vh", overflowY: "auto", fontSize: "1rem", width: "90%", maxWidth: "900px" }}>
          {([...messages].slice().reverse()).map((msg, idx) => (
            <div key={idx} style={{ padding: "0px 0", margin: "0 0 12px 0" }}>
              <div style={{ lineHeight: "1.3", wordBreak: "break-word", margin: 0, padding: 0 }}>
                <strong>{msg.nickname}: </strong>
                {msg.video || msg.gifUrl ? "" : censorText(msg.text)}
              </div>
              {msg.video && (
                <div className="youtube-container" style={{ display: "flex", alignItems: "center", border: "1px solid #ddd", borderRadius: "6px", padding: "4px", backgroundColor: "#fff", marginTop: "4px" }}>
                  <img src={msg.video.thumbnail} alt="Thumbnail" style={{ width: "300px", height: "200px", marginRight: "10px", borderRadius: "4px" }} />
                  <div>
                    <a href={`https://www.youtube.com/watch?v=${msg.video.videoId}`} target="_blank" rel="noopener noreferrer" style={{ fontWeight: "bold", color: "#1a73e8", textDecoration: "none", fontSize: "1.2rem" }}>{msg.video.title}</a>
                    <p style={{ margin: 0, fontSize: "1rem" }}>Canale: {msg.video.channel}</p>
                    <p style={{ margin: 0, fontSize: "1rem" }}>Durata: {formatDuration(msg.video.duration)}</p>
                  </div>
                </div>
              )}
              {msg.gifUrl && <div style={{ marginTop: "4px" }}><img src={msg.gifUrl} alt="GIF" style={{ maxWidth: "300px", borderRadius: "4px" }} /></div>}
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
