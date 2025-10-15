import { useState, useEffect, useRef } from "react";
import { supabase } from "../supabaseClient";
import EmojiPicker from "emoji-picker-react";

// --- Lista parole vietate ---
const forbiddenWords = [/* lista completa come nel tuo codice originale */];

// --- Parole chiave porno ---
const pornKeywords = ["porn","xxx","adult","sex","pene","vagina","sesso","tette","porno"];

// --- Normalizzazione nickname ---
function normalizeNick(nick) { /* funzione originale */ }
function containsForbiddenWord(nick) { /* funzione originale */ }
function levenshteinDistance(a,b){ /* funzione originale */ }
function isNicknameAllowed(nick, registeredNicks){ /* funzione originale */ }

// --- Funzioni YouTube ---
function extractVideoId(url){ /* funzione originale */ }
async function fetchVideoData(videoId){ /* funzione originale */ }
function formatDuration(iso){ /* funzione originale */ }

// --- Censura dei messaggi ---
function censorText(text){ /* funzione originale */ }

// --- Estrazione GIF ---
function extractGifUrl(text){ /* funzione originale */ }

// --- Componente principale ---
export default function Chat(){
  const [messages,setMessages]=useState([]);
  const [nickname,setNickname]=useState("");
  const [password,setPassword]=useState("");
  const [input,setInput]=useState("");
  const [showPicker,setShowPicker]=useState(false);
  const [mode,setMode]=useState(null);
  const [registeredUsers,setRegisteredUsers]=useState([]);
  const [nickWarning, setNickWarning] = useState("");
  const messageBoxRef = useRef(null);

  useEffect(()=>{
    async function fetchData(){
      const [msgsResp,usersResp] = await Promise.all([
        supabase.from("messages").select("*").order("created_at",{ascending:true}),
        supabase.from("registered_users").select("*")
      ]);
      setMessages(msgsResp.data||[]);
      setRegisteredUsers(usersResp.data||[]);
    }
    fetchData();
  },[]);

  useEffect(()=>{
    const channel = supabase.channel("public:messages").on(
      "postgres_changes",
      {event:"INSERT",schema:"public",table:"messages"},
      payload => setMessages(prev => [...prev, payload.new])
    ).subscribe();
    return () => supabase.removeChannel(channel);
  },[]);

  useEffect(()=>{
    const el = messageBoxRef.current;
    if (!el) return;
    requestAnimationFrame(() => { el.scrollTop = 0; });
  }, [messages]);

  async function sendMessage(){ /* funzione originale */ }
  async function handleLogin(){ /* funzione originale */ }
  function handleGuest(){ /* funzione originale */ }
  function addEmoji(emojiData){ setInput(prev=>prev+emojiData.emoji); setShowPicker(false); }
  function checkNicknameLive(nick){ /* funzione originale */ }

  const responsiveStyle = `
    html, body, #root {
      margin: 0; padding: 0; width: 100%; overflow-x: hidden; font-family: Arial, sans-serif;
    }
    input, button { box-sizing: border-box; }

    /* CONTENITORE PRINCIPALE */
    .chat-container {
      padding: 2rem;
      min-height: 100vh;
      background-color: #f0f0f0;
      display: flex;
      flex-direction: column;
      align-items: center;
      width: 100%;
      overflow-x: hidden;
    }

    /* MESSAGGI */
    .messages-box {
      border: 1px solid #ccc;
      padding: 0.5rem;
      max-height: 70vh;
      overflow-y: auto;
      font-size: 1rem;
      width: 100%;
      max-width: 900px;
      display: block;
      box-sizing: border-box;
    }

    .message-item { padding: 0; margin-bottom: 12px; word-break: break-word; line-height: 1.3; }

    /* VIDEO E GIF */
    .video-container, .gif-container {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      border: 1px solid #ddd;
      border-radius: 6px;
      padding: 4px;
      background-color: #fff;
      margin-top: 4px;
    }

    .video-container img, .gif-container img {
      width: 100%;
      max-width: 300px;
      height: auto;
      margin-right: 10px;
      border-radius: 4px;
    }

    .video-info { flex: 1; min-width: 0; }

    /* INPUT E BUTTON */
    .input-group {
      display: flex;
      flex-wrap: wrap;
      width: 100%;
      max-width: 900px;
      margin-bottom: 1rem;
    }

    .input-group input {
      flex: 1 1 100%;
      padding: 0.8rem;
      border-radius: 8px;
      border: 1px solid #ccc;
      font-size: 1rem;
      margin-bottom: 0.5rem;
    }

    .input-group button {
      padding: 0.8rem 1.2rem;
      font-size: 1rem;
      margin-right: 0.5rem;
      margin-bottom: 0.5rem;
      border-radius: 8px;
      border: none;
      cursor: pointer;
    }

    @media (min-width: 600px) {
      .input-group input { flex: 1 1 auto; margin-bottom: 0; }
    }

    /* --- SOLO MOBILE: CENTRATO --- */
    @media (max-width: 600px) {
      .chat-container { padding: 1rem; align-items: center; }
      .messages-box { max-width: 450px; margin: 0 auto; }
      .input-group { flex-direction: column; align-items: center; max-width: 450px; }
      .input-group input, .input-group button { width: 100%; margin-bottom: 0.5rem; }
      .video-container, .gif-container { flex-direction: column; align-items: center; width: 100%; max-width: 450px; margin: 0 auto 0.5rem; }
      .video-container img, .gif-container img { width: 100%; height: auto; }
      .video-info { width: 100%; text-align: center; }
    }
  `;

  if(!mode) return (
    <>
      <style>{responsiveStyle}</style>
      <div style={{padding:"2rem",textAlign:"center"}}>
        <h1 style={{fontSize:"2rem", marginBottom:"1.5rem", color:"#ff4d94", textShadow:"1px 1px 3px #aaa"}}>Benvenuto/a IL Muro</h1>
        <button onClick={()=>setMode("loginForm")} style={{padding:"0.8rem 1.5rem",fontSize:"1rem",backgroundColor:"#1a73e8",color:"#fff",border:"none",borderRadius:"10px",cursor:"pointer",marginRight:"1rem"}}>Registrati / Login</button>
        <button onClick={()=>setMode("guestForm")} style={{padding:"0.8rem 1.5rem",fontSize:"1rem",backgroundColor:"#ff4d94",color:"#fff",border:"none",borderRadius:"10px",cursor:"pointer"}}>Entra come Ospite</button>
      </div>
    </>
  );

  if(mode==="loginForm" || mode==="guestForm") {
    const isGuest = mode==="guestForm";
    return (
      <>
        <style>{responsiveStyle}</style>
        <div style={{minHeight:"100vh",display:"flex",justifyContent:"center",alignItems:"center",backgroundColor:"#f0f0f0",padding:"2rem"}}>
          <div style={{borderRadius:"25px",boxShadow:"0 12px 35px rgba(0,0,0,0.35)",width:"95%",maxWidth:"500px",textAlign:"center",backgroundColor:"white",padding:"2.5rem"}}>
            <h2 style={{marginBottom:"1.5rem", color:"#ff4d94"}}>{isGuest ? "Accesso come Ospite" : "Registrati / Login"}</h2>
            <input 
              placeholder="Nickname" 
              value={nickname} 
              onChange={e=>{setNickname(e.target.value); checkNicknameLive(e.target.value);}} 
              style={{marginBottom:"0.5rem", width:"90%", padding:"0.8rem", borderRadius:"8px", border:"1px solid #ccc"}}
            />
            {nickWarning && <p style={{color:"red"}}>{nickWarning}</p>}
            {!isGuest && (
              <input 
                type="password" 
                placeholder="Password" 
                value={password} 
                onChange={e=>setPassword(e.target.value)} 
                style={{marginBottom:"0.5rem", width:"90%", padding:"0.8rem", borderRadius:"8px", border:"1px solid #ccc"}}
              />
            )}
            <div style={{marginTop:"1rem"}}>
              <button 
                onClick={isGuest ? handleGuest : handleLogin}
                style={{padding:"0.8rem 1.5rem",fontSize:"1rem",backgroundColor: isGuest ? "#ff4d94" : "#1a73e8",color:"#fff",border:"none",borderRadius:"10px",cursor:"pointer",marginRight:"0.5rem"}}
              >
                {isGuest ? "Entra" : "Accedi / Registrati"}
              </button>
              <button 
                onClick={()=>setMode(null)} 
                style={{padding:"0.8rem 1.5rem",fontSize:"1rem",backgroundColor: isGuest ? "#1a73e8" : "#ff4d94",color:"#fff",border:"none",borderRadius:"10px",cursor:"pointer"}}
              >
                Indietro
              </button>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <style>{responsiveStyle}</style>
      <div className="chat-container">
        <h2 style={{marginBottom:"1rem"}}>Chat attiva - Nick: {nickname}</h2>

        <div className="input-group">
          <input
            placeholder="Scrivi un messaggio o incolla un link YouTube o GIF"
            value={input}
            onChange={e=>setInput(e.target.value)}
            onKeyDown={e=>e.key==="Enter"&&sendMessage()}
          />
          <button onClick={()=>setShowPicker(!showPicker)}>😀</button>
          <button onClick={sendMessage} style={{backgroundColor:"#ff4d94", color:"#fff"}}>Invia</button>
        </div>

        {showPicker && <EmojiPicker onEmojiClick={addEmoji}/>}

        <div className="messages-box" ref={messageBoxRef}>
          {([...messages].slice().reverse()).map((msg, idx) => (
            <div key={idx} className="message-item">
              <strong>{msg.nickname}: </strong>
              {msg.video || msg.gifUrl ? "" : censorText(msg.text)}

              {msg.video && (
                <div className="video-container">
                  <img src={msg.video.thumbnail} alt="Thumbnail"/>
                  <div className="video-info">
                    <a href={`https://www.youtube.com/watch?v=${extractVideoId(msg.text)}`} target="_blank" rel="noopener noreferrer" style={{fontWeight:"bold",color:"#1a73e8",textDecoration:"none",fontSize:"1.2rem"}}>
                      {msg.video.title}
                    </a>
                    <p style={{margin:0,fontSize:"1rem"}}>Canale: {msg.video.channel}</p>
                    <p style={{margin:0,fontSize:"1rem"}}>Durata: {formatDuration(msg.video.duration)}</p>
                  </div>
                </div>
              )}

              {msg.gifUrl && (
                <div className="gif-container">
                  <img src={msg.gifUrl} alt="GIF"/>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
