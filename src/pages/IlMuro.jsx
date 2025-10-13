import { useState, useEffect, useRef } from "react";
import { supabase } from "../supabaseClient";
import EmojiPicker from "emoji-picker-react";

// --- Lista parole vietate ---
const forbiddenWords = [
  "cazzo","cazz","merda","stronzo","idiota","stupido","cretino","bastardo",
  "frocio","puttana","troia","cornuto","figliodiputtana",
  "vaffanculo","scemo","scemotto","zoccola","piscione","bocchino",
  "pappone","mignotta","culattone","fichetto",
  "merdina","stronzetto","puttanella","cazzetto","cazzone","frociotto",
  "cornutello","vaffanculino","scemino","zoccoletta","mignottina",
  "fuck","shit","bitch","asshole","dumb","stupid","idiot","faggot",
  "bastard","slut","cunt",
  "fck","sh1t","b1tch","a$$hole","p-uttana","p_uttana","_puttana_","c-azzo",
  "coglione","coglioni","coglionazzo","coglioncello",
  "andicappato","handicap","handicappato","handicapped","disabile",
  "pedofilo","pedofilia","pedofili","pedofilo/a",
  "puttane","brutta vacca"
];

// --- Parole chiave porno ---
const pornKeywords = ["porn","xxx","adult","sex","pene","vagina","sesso","tette","porno"];

// --- Normalizzazione nickname ---
function normalizeNick(nick) {
  return nick
    .toLowerCase()
    .replace(/[\s\-_\.!@\$*0-9]+/g,"")
    .replace(/0/g,"o")
    .replace(/1/g,"i")
    .replace(/3/g,"e")
    .replace(/4/g,"a")
    .replace(/@/g,"a")
    .replace(/!/g,"i")
    .replace(/\$/g,"s");
}

// --- Controllo nickname proibiti ---
function containsForbiddenWord(nick) {
  const normalized = normalizeNick(nick);
  return forbiddenWords.some(word => {
    const pattern = word.toLowerCase().replace(/\s+/g,"").split("").join("[\\s\\-_\\W]*");
    const regex = new RegExp(pattern, "i");
    return regex.test(normalized);
  });
}

// --- Verifica nickname già registrati / simili ---
function levenshteinDistance(a,b){
  const matrix = Array.from({length:a.length+1},()=>Array(b.length+1).fill(0));
  for(let i=0;i<=a.length;i++) matrix[i][0]=i;
  for(let j=0;j<=b.length;j++) matrix[0][j]=j;
  for(let i=1;i<=a.length;i++){
    for(let j=1;j<=b.length;j++){
      if(a[i-1]===b[j-1]) matrix[i][j]=matrix[i-1][j-1];
      else matrix[i][j]=1+Math.min(matrix[i-1][j],matrix[i][j-1],matrix[i-1][j-1]);
    }
  }
  return matrix[a.length][b.length];
}

function isNicknameAllowed(nick, registeredNicks){
  const normalized = nick.toLowerCase();
  for(let reg of registeredNicks){
    const regNormalized = reg.toLowerCase();
    if(normalized===regNormalized) return false;
    if(levenshteinDistance(normalized,regNormalized)<=2) return false;
  }
  return true;
}

// --- Funzioni YouTube ---
function extractVideoId(url){
  const regex=/(?:https?:\/\/(?:www\.)?youtube.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu.be\/)([a-zA-Z0-9_-]{11})/;
  const match = url.match(regex);
  return match?match[1]:null;
}

async function fetchVideoData(videoId){
  const API_KEY="AIzaSyAJrVSyR6xOU1quVCXWAYzq3_DTkFMilhw"; 
  try{
    const res = await fetch(`https://www.googleapis.com/youtube/v3/videos?id=${videoId}&key=${API_KEY}&part=snippet,contentDetails`);
    const data = await res.json();
    if(data.items && data.items.length>0){
      const video = data.items[0];
      return {
        title: video.snippet.title,
        channel: video.snippet.channelTitle,
        thumbnail: video.snippet.thumbnails.medium.url,
        duration: video.contentDetails.duration,
        videoId
      };
    }
  }catch(err){console.error("Errore fetch YouTube API:",err);}
  return null;
}

function formatDuration(iso){
  if(!iso) return "";
  const match = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if(!match) return "";
  const hours=parseInt(match[1]||0);
  const minutes=parseInt(match[2]||0);
  const seconds=parseInt(match[3]||0);
  const hStr = hours>0?`${hours}:`:"";
  const mStr = minutes<10 && hours>0?`0${minutes}`:minutes;
  const sStr = seconds<10?`0${seconds}`:seconds;
  return hours>0?`${hStr}${mStr}:${sStr}`:`${mStr}:${sStr}`;
}

// --- Censura dei messaggi ---
function censorText(text){
  let censored = text;
  const makeRegex = (word) => {
    return new RegExp(word.toLowerCase().replace(/\s+/g,"").split("").join("[\\s\\-_\\W]*"), "gi");
  };
  forbiddenWords.forEach(word => { censored = censored.replace(makeRegex(word), "***"); });
  pornKeywords.forEach(word => { censored = censored.replace(makeRegex(word), "***"); });
  return censored;
}

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

  // Scroll automatico in alto
  useEffect(()=>{
    const el = messageBoxRef.current;
    if (!el) return;
    requestAnimationFrame(() => {
      el.scrollTop = 0;
    });
  }, [messages]);

  async function sendMessage(){
    const trimmedNick=nickname.trim();
    const trimmedMsg=input.trim();
    if(!trimmedNick){alert("Devi inserire un nickname!"); return;}
    if(!trimmedMsg) return;
    if(pornKeywords.some(w=>trimmedMsg.toLowerCase().includes(w))){alert("Non puoi inviare contenuti pornografici!"); return;}
    const videoId=extractVideoId(trimmedMsg);
    let videoData=null;
    if(videoId) videoData=await fetchVideoData(videoId);
    const {error}=await supabase.from("messages").insert([{nickname:trimmedNick,text:trimmedMsg,video:videoData}]);
    if(!error) setInput("");
  }

  async function handleLogin(){
    const trimmedNick=nickname.trim();
    if(!trimmedNick){alert("Devi inserire un nickname!"); return;}
    if(containsForbiddenWord(trimmedNick)){alert("Nickname non consentito!"); return;}
    const existingUser=registeredUsers.find(u=>u.nickname===trimmedNick);
    if(existingUser){
      if(existingUser.password===password){alert("Login riuscito!"); setMode("chat");}
      else alert("Password errata!");
    }else{
      const {error}=await supabase.from("registered_users").insert([{nickname:trimmedNick,password}]);
      if(!error){setRegisteredUsers([...registeredUsers,{nickname:trimmedNick,password}]); alert("Nickname registrato!"); setMode("chat");}
    }
  }

  function handleGuest(){
    const trimmedNick=nickname.trim();
    if(!trimmedNick){alert("Devi inserire un nickname!"); return;}
    if(containsForbiddenWord(trimmedNick)){alert("Nickname non consentito!"); return;}
    if(!isNicknameAllowed(trimmedNick,registeredUsers.map(u=>u.nickname))){alert("Nickname non disponibile (registrato o troppo simile)"); return;}
    setMode("chat"); alert("Accesso come ospite consentito!");
  }

  function addEmoji(emojiData){setInput(prev=>prev+emojiData.emoji); setShowPicker(false);}

  function checkNicknameLive(nick) {
    if (!nick) { setNickWarning(""); return; }
    if (containsForbiddenWord(nick)) { setNickWarning("⚠️ Questo nickname contiene parole non consentite!"); return; }
    if (!isNicknameAllowed(nick, registeredUsers.map(u => u.nickname))) { setNickWarning("⚠️ Nickname già registrato o troppo simile ad un altro!"); return; }
    setNickWarning("");
  }

  // --- Stili responsive ---
  const responsiveStyle = `
    @media (max-width: 768px) {
      h1, h2 { font-size: 1.5rem !important; }
      input, button { font-size: 1rem !important; width: 100% !important; margin-bottom: 0.7rem !important; }
      div[style*="maxWidth:900px"] { width: 100% !important; max-width: 100% !important; }
      img[alt="Thumbnail"] { width: 100% !important; height: auto !important; margin-bottom: 8px !important; }
      div[style*="display:flex"][style*="alignItems:center"] { flex-direction: column !important; align-items: flex-start !important; }
      div[style*="padding:2rem"] { padding: 1rem !important; }
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
        <div style={{
          minHeight: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#f0f0f0",
          padding: "2rem"
        }}>
          <div style={{
            borderRadius: "25px",
            boxShadow: "0 12px 35px rgba(0,0,0,0.35)",
            width: "95%",
            maxWidth: "500px",
            textAlign: "center",
            backgroundColor: "white",
            padding: "2.5rem"
          }}>
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
                style={{
                  padding:"0.8rem 1.5rem",
                  fontSize:"1rem",
                  backgroundColor: isGuest ? "#ff4d94" : "#1a73e8",
                  color:"#fff",
                  border:"none",
                  borderRadius:"10px",
                  cursor:"pointer",
                  marginRight:"0.5rem"
                }}
              >
                {isGuest ? "Entra" : "Accedi / Registrati"}
              </button>
              <button 
                onClick={()=>setMode(null)} 
                style={{
                  padding:"0.8rem 1.5rem",
                  fontSize:"1rem",
                  backgroundColor: isGuest ? "#1a73e8" : "#ff4d94",
                  color:"#fff",
                  border:"none",
                  borderRadius:"10px",
                  cursor:"pointer"
                }}
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
      <div style={{padding:"2rem",minHeight:"100vh",backgroundColor:"#f0f0f0",display:"flex",flexDirection:"column",alignItems:"center"}}>
        <h2 style={{marginBottom:"1rem"}}>Chat attiva - Nick: {nickname}</h2>

        <div style={{marginBottom:"1rem",width:"90%",maxWidth:"900px"}}>
          <input
            placeholder="Scrivi un messaggio o incolla un link YouTube"
            value={input}
            onChange={e=>setInput(e.target.value)}
            onKeyDown={e=>e.key==="Enter"&&sendMessage()}
            style={{width:"70%",padding:"0.8rem",borderRadius:"8px",border:"1px solid #ccc",fontSize:"1rem",marginRight:"0.5rem"}}
          />
          <button onClick={()=>setShowPicker(!showPicker)} style={{padding:"0.8rem",fontSize:"1rem",marginRight:"0.5rem"}}>😀</button>
          <button onClick={sendMessage} style={{padding:"0.8rem 1.2rem",fontSize:"1rem",backgroundColor:"#ff4d94",color:"#fff",border:"none",borderRadius:"8px",cursor:"pointer"}}>Invia</button>
        </div>

        {showPicker && <EmojiPicker onEmojiClick={addEmoji}/>}

        <div
          ref={messageBoxRef}
          style={{
            border:"1px solid #ccc",
            padding:"0.5rem",
            maxHeight:"70vh",
            overflowY:"auto",
            fontSize:"1rem",
            width:"90%",
            maxWidth:"900px",
            display:"block"
          }}
        >
          {([...messages].slice().reverse()).map((msg, idx) => (
            <div key={idx} style={{padding:"0px 0",margin:"0 0 12px 0"}}>
              <div style={{lineHeight:"1.3",wordBreak:"break-word",margin:0,padding:0}}>
                <strong>{msg.nickname}: </strong>
                {msg.video ? "" : censorText(msg.text)}
              </div>
              {msg.video && (
                <div style={{display:"flex",alignItems:"center",border:"1px solid #ddd",borderRadius:"6px",padding:"4px",backgroundColor:"#fff",marginTop:"4px"}}>
                  <img src={msg.video.thumbnail} alt="Thumbnail" style={{width:"300px",height:"200px",marginRight:"10px",borderRadius:"4px"}}/>
                  <div>
                    <a href={`https://www.youtube.com/watch?v=${extractVideoId(msg.text)}`} target="_blank" rel="noopener noreferrer" style={{fontWeight:"bold",color:"#1a73e8",textDecoration:"none",fontSize:"1.2rem"}}>
                      {msg.video.title}
                    </a>
                    <p style={{margin:0,fontSize:"1rem"}}>Canale: {msg.video.channel}</p>
                    <p style={{margin:0,fontSize:"1rem"}}>Durata: {formatDuration(msg.video.duration)}</p>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
