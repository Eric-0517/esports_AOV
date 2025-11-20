let isLoggedIn = false;
let username = "訪客";
let discordId = null; // JWT 解析後用來綁定 MongoDB

const usernameEl = document.getElementById("username");
const navRight = document.getElementById("nav-right");
const modal = document.getElementById("system-modal");
const modalText = document.getElementById("modal-text");
const modalConfirm = document.getElementById("modal-confirm");

const clientId = "1403970810762363013";
const backendCallback = "https://esportsmoba.dpdns.org/auth/discord/callback";
const scope = "identify";

const events = [
  { name: "AOV 線上賽 - 測試賽事", date: "2025/11/30", signup: "2025/11/20 - 2025/11/25", status: "報名中" }
];

window.onload = () => {
  renderEvents();
  updateUserUI();

  const urlParams = new URLSearchParams(window.location.search);
  const token = urlParams.get("token");
  if(token) handleToken(token);
};

// 更新 UI
function updateUserUI() {
  usernameEl.textContent = username;

  const leaderDiscord = document.getElementById("leader-discord");
  if(leaderDiscord) leaderDiscord.textContent = username;

  if(!isLoggedIn){
    navRight.innerHTML = `<button class="btn-login" id="login-btn">Discord 登入</button>`;
    document.getElementById("login-btn").onclick = login;
  } else {
    navRight.innerHTML = `
      <button class="btn-login" onclick="goProfile()">個人資訊/已報名資訊</button>
      <button class="btn-login" onclick="logout()">登出</button>
    `;
  }
}

// Discord 登入
function login(){
  const oauthUrl =
    `https://discord.com/oauth2/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(backendCallback)}&response_type=code&scope=${encodeURIComponent(scope)}`;
  window.location.href = oauthUrl;
}

// 登出
function logout(){
  isLoggedIn = false;
  username = "訪客";
  discordId = null;
  switchPage("event-home");
  updateUserUI();
}

// 處理 JWT
function handleToken(token){
  try{
    const payload = JSON.parse(atob(token.split('.')[1]));
    username = payload.username || "Discord使用者";
    discordId = payload.sub; // Discord ID
    isLoggedIn = true;
    updateUserUI();
    loadProfile();
    history.replaceState(null, "", "register-system.html");
  } catch(err){
    console.error("JWT 解析錯誤:", err);
  }
}

// 載入個人資料
async function loadProfile(){
  if(!discordId) return;
  try{
    const res = await fetch(`/api/profile?discordId=${discordId}`);
    const data = await res.json();
    if(!data) return;
    ['nickname','rank','realname','phone','email','birthday','taiwan','id'].forEach(key => {
      const el = document.getElementById('p-'+key);
      if(el && data[key]) el.value = data[key];
    });
  } catch(err){
    console.error("讀取資料失敗", err);
  }
}

// 存個人資料
document.getElementById("save-profile")?.addEventListener("click", async ()=>{
  if(!discordId){ alert("請先登入"); return; }
  const profileData = {
    discordId,
    nickname: document.getElementById("p-nickname").value,
    rank: document.getElementById("p-rank").value,
    realname: document.getElementById("p-realname").value,
    phone: document.getElementById("p-phone").value,
    email: document.getElementById("p-email").value,
    birthday: document.getElementById("p-birthday").value,
    taiwan: document.getElementById("p-taiwan").value,
    id: document.getElementById("p-id").value
  };
  try{
    await fetch('/api/profile', {
      method: 'POST',
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(profileData)
    });
    alert("個人資料已更新");
    goEventHome();
  } catch(err){
    console.error(err);
    alert("更新失敗");
  }
});

// 頁面切換
function switchPage(pageId){
  const pages = ["event-home", "profile-page", "leader-page", "member-page"];
  pages.forEach(id => { const el = document.getElementById(id); if(el) el.style.display="none"; });
  const target = document.getElementById(pageId);
  if(target) target.style.display="block";
}

// 渲染賽事
function renderEvents(){
  const list = document.getElementById("event-list");
  const noEvent = document.getElementById("no-event");
  list.innerHTML="";
  if(events.length===0){ noEvent.classList.remove("hidden"); return; } else { noEvent.classList.add("hidden"); }

  events.forEach(ev=>{
    const div = document.createElement("div");
    div.className="event-card";
    div.innerHTML=`
      <div class="event-name">${ev.name}</div>
      <div class="event-info">比賽日期：${ev.date}</div>
      <div class="event-info">報名時間：${ev.signup}</div>
      <div class="event-info">狀態：${ev.status}</div>
      <div class="card-btn-row">
        <div class="card-btn" onclick="goSignup('team')">團體報名</div>
        <div class="card-btn" onclick="goSignup('solo')">個人報名</div>
      </div>
    `;
    list.appendChild(div);
  });
}

// 報名 & 個人頁
function goSignup(type){ if(!isLoggedIn){ showModal("請先登入 Discord"); return; } type==='team'?switchPage('leader-page'):switchPage('member-page'); }
function goProfile(){ if(!isLoggedIn){ showModal("請先登入 Discord"); return; } switchPage('profile-page'); }
function goEventHome(){ switchPage("event-home"); }

// Modal
function showModal(msg){ modalText.textContent=msg; modal.classList.remove("hidden"); }
modalConfirm.onclick = ()=> modal.classList.add("hidden");

// 其他按鈕事件
document.getElementById("cancel-profile")?.addEventListener("click", goEventHome);
document.getElementById("cancel-leader")?.addEventListener("click", goEventHome);
document.getElementById("next-leader")?.addEventListener("click", ()=> switchPage("member-page"));
document.getElementById("cancel-member")?.addEventListener("click", goEventHome);
document.getElementById("confirm-member")?.addEventListener("click", ()=> { alert("報名完成"); goEventHome(); });
