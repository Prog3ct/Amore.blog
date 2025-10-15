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

// --- Estrazione GIF ---
function extractGifUrl(text){
  const regex = /(https?:\/\/\S+\.gif)/i;
  const match = text.match(regex);
  return match ? match[1] : null;
}

// --- Stili responsive incluso mobile ---
const responsiveStyle = `
/* --- Mobile --- */
@media (max-width: 600px) {
  * {
    box-sizing: border-box;
  }

  div[style*="flex-direction:column"] {
    width: 100% !important;
    padding: 1rem !important;
    overflow-x: hidden !important;
  }

  input, button {
    width: 100% !important;
    font-size: 1rem;
    margin-bottom: 0.5rem;
  }

  .message-box {
    max-width: 100% !important;
    width: 100% !important;
    overflow-x: hidden !important;
    word-break: break-word;
    max-height: 70vh !important; /* riquadro più grande */
  }

  .message-box img {
    max-width: 100% !important;
    height: auto !important;
  }

  .emoji-picker-react {
    width: 90% !important;
    max-width: 300px !important;
    left: 50% !important;
    transform: translateX(-50%) !important;
  }
}
`;

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

  // --- Scroll verso l'alto per nuovi messaggi ---
  useEffect(()=>{
    const el = messageBoxRef.current;
    if (!el) return;
    requestAnimationFrame(() => {
      el.scrollTop = 0; // scroll verso l'alto
    });
  }, [messages]);

  async function sendMessage(){
    const trimmedNick = nickname.trim();
    const trimmedMsg = input.trim();
    if(!trimmedNick){ alert("Devi inserire un nickname!"); return; }
    if(!trimmedMsg) return;
    if(pornKeywords.some(w=>trimmedMsg.toLowerCase().includes(w))){ alert("Non puoi inviare contenuti pornografici!"); return; }

    const videoId = extractVideoId(trimmedMsg);
    let videoData = null;
    if(videoId) videoData = await fetchVideoData(videoId);

    const gifUrl = extractGifUrl(trimmedMsg);

    const newMessage = { nickname: trimmedNick, text: trimmedMsg };
    if(videoData) newMessage.video = videoData;
    if(gifUrl) newMessage.gifUrl = gifUrl;

    const { error } = await supabase.from("messages").insert([newMessage]);
    if(error){ console.error("Errore invio messaggio:", error); alert("Errore invio messaggio"); return; }

    setInput("");
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

  // --- Restante JSX identico a prima ---
