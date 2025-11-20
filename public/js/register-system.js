// ---------- 全域變數 ----------
let isLoggedIn = false;
let username = "訪客";
let discordId = null;
let savedProfile = {}; // 從後端讀取或儲存的資料

const usernameEl = document.getElementById("username");
const navRight = document.getElementById("nav-right");
const modal = document.getElementById("system-modal");
const modalText = document.getElementById("modal-text");
const modalConfirm = document.getElementById("modal-confirm");

// Discord OAuth 設定
const clientId = "1403970810762363013";
const backendCallback = "https://esportsmoba.dpdns.org/auth/discord/callback";
const scope = "identify";

// ---------- 初始化 ----------
window.onload = () => {
  const urlParams = new URLSearchParams(window.location.search);
  const token = urlParams.get("token");
  if (token) handleToken(token);
  updateUserUI();
  renderEvents();
};

// ---------- 更新 UI ----------
function updateUserUI() {
  usernameEl.textContent = username;

  if (!isLoggedIn) {
    navRight.innerHTML = `<button class="btn-login" id="login-btn">Discord 登入</button>`;
    document.getElementById("login-btn").onclick = login;
  } else {
    navRight.innerHTML = `
      <button class="btn-login" onclick="goProfile()">個人資料 / 已報名資訊</button>
      <button class="btn-login" onclick="logout()">登出</button>
    `;
  }

  // 自動帶入 Discord 名稱
  const discordSpan = document.getElementById("p-discord");
  if (discordSpan) discordSpan.textContent = username;

  // 帶入已存資料
  const fields = ["nickname","rank","realname","phone","email","birthday","taiwan","id"];
  fields.forEach(f => {
    const el = document.getElementById(`p-${f}`);
    if(el && savedProfile[f]){
      el.value = savedProfile[f];
      if(f==="nickname" || f==="rank") el.disabled = true;
    }
  });
}

// ---------- Discord 登入 ----------
function login() {
  const oauthUrl =
    `https://discord.com/oauth2/authorize` +
    `?client_id=${clientId}` +
    `&redirect_uri=${encodeURIComponent(backendCallback)}` +
    `&response_type=code` +
    `&scope=${encodeURIComponent(scope)}`;
  window.location.href = oauthUrl;
}

// ---------- 登出 ----------
function logout() {
  isLoggedIn = false;
  username = "訪客";
  discordId = null;
  savedProfile = {};
  switchPage("event-home");
  updateUserUI();
}

// ---------- 處理 JWT ----------
function handleToken(token) {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    username = payload.username || "Discord使用者";
    discordId = payload.sub; // 用 Discord ID 當唯一識別
    isLoggedIn = true;

    history.replaceState(null, "", "register-system.html");
    updateUserUI();
    loadProfile();
  } catch (err) {
    console.error("JWT 解析錯誤:", err);
  }
}

// ---------- 頁面切換 ----------
function switchPage(pageId) {
  const pages = ["event-home", "profile-page", "leader-page", "member-page"];
  pages.forEach(id => document.getElementById(id)?.classList.add("hidden"));
  document.getElementById(pageId)?.classList.remove("hidden");
}

// ---------- Modal ----------
function showModal(msg){ modalText.textContent = msg; modal.classList.remove("hidden"); }
modalConfirm.onclick = () => modal.classList.add("hidden");

// ---------- 假賽事列表 ----------
function renderEvents() {
  const list = document.getElementById("event-list");
  const noEvent = document.getElementById("no-event");
  list.innerHTML = "";
  if (!list) return;
  const events = [
    { name: "AOV 線上賽 - 測試賽事", date: "2025/11/30", signup: "2025/11/20 - 2025/11/25", status: "報名中" }
  ];
  if (events.length === 0) noEvent?.classList.remove("hidden"); else noEvent?.classList.add("hidden");
  events.forEach(ev => {
    const div = document.createElement("div");
    div.className = "event-card";
    div.innerHTML = `
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

// ---------- 個人資料操作 ----------

// 讀取後端資料
async function loadProfile(){
  if(!discordId) return;
  try{
    const res = await fetch(`/api/profile/${discordId}`);
    if(!res.ok) return;
    const data = await res.json();
    savedProfile = data;
    updateUserUI();
  } catch(err){ console.error(err); }
}

// 儲存資料到後端
document.getElementById("save-profile")?.addEventListener("click", async ()=>{
  if(!discordId){ showModal("請先登入 Discord"); return; }

  const data = {
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
    const res = await fetch(`/api/profile/${discordId}`,{
      method:"POST",
      headers: {"Content-Type":"application/json"},
      body: JSON.stringify(data)
    });
    if(!res.ok) throw new Error("更新失敗");
    savedProfile = data;
    alert("個人資料已更新");
    updateUserUI();
    goEventHome();
  } catch(err){
    console.error(err);
    showModal("資料儲存失敗");
  }
});

// ---------- 其他按鈕 ----------
document.getElementById("cancel-profile")?.addEventListener("click", goEventHome);
document.getElementById("cancel-leader")?.addEventListener("click", goEventHome);
document.getElementById("next-leader")?.addEventListener("click", ()=> switchPage("member-page"));
document.getElementById("cancel-member")?.addEventListener("click", goEventHome);
document.getElementById("confirm-member")?.addEventListener("click", ()=> { alert("報名完成"); goEventHome(); });
