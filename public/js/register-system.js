// ---------- 全域變數 ----------
let isLoggedIn = false;
let username = "訪客";
let savedProfile = {}; // 必須宣告

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

// ---------- 初始化 ----------
window.onload = () => {

  // 1. 先取得 token
  const urlParams = new URLSearchParams(window.location.search);
  const token = urlParams.get("token");
  if (token) handleToken(token);

  // 2. 再更新 UI
  updateUserUI();

  // 3. 再畫面內容
  renderEvents();

  // 4. 再處理 savedProfile
  document.getElementById('p-discord').textContent = username;
  const nicknameEl = document.getElementById('p-nickname');
  const rankEl = document.getElementById('p-rank');

  if(savedProfile){
    if(savedProfile.nickname){
      nicknameEl.value = savedProfile.nickname;
      nicknameEl.disabled = true;
    }
    if(savedProfile.rank){
      rankEl.value = savedProfile.rank;
      rankEl.disabled = true;
    }
  }
};

// ---------- 更新 UI ----------
function updateUserUI() {
  usernameEl.textContent = username;

  const leaderDiscord = document.getElementById("leader-discord");
  if (leaderDiscord) leaderDiscord.textContent = username;

  if (!isLoggedIn) {
    navRight.innerHTML = `<button class="btn-login" id="login-btn">Discord 登入</button>`;
    document.getElementById("login-btn").onclick = login;
  } else {
    navRight.innerHTML = `
      <button class="btn-login" onclick="goProfile()">個人資訊/已報名資訊</button>
      <button class="btn-login" onclick="logout()">登出</button>
    `;
  }
}

// ---------- Discord OAuth ----------
function login() {
  const oauthUrl =
    `https://discord.com/oauth2/authorize` +
    `?client_id=${clientId}` +
    `&redirect_uri=${encodeURIComponent(backendCallback)}` +
    `&response_type=code` +
    `&scope=${encodeURIComponent(scope)}`;
  window.location.href = oauthUrl;
}

function logout() {
  isLoggedIn = false;
  username = "訪客";
  switchPage("event-home");
  updateUserUI();
}

// ---------- token 解析 ----------
function handleToken(token) {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    username = payload.username || "Discord使用者";
    isLoggedIn = true;

    updateUserUI();

    // 清除 URL token
    history.replaceState(null, "", "register-system.html");
  } catch (err) {
    console.error("JWT 解析錯誤:", err);
  }
}

// ---------- 頁面切換 ----------
function switchPage(pageId) {
  const pages = ["event-home","profile-page","leader-page","member-page"];
  pages.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.style.display = "none";
  });

  const target = document.getElementById(pageId);
  if (target) target.style.display = "block";
}

// ---------- 賽事列表 ----------
function renderEvents() {
  const list = document.getElementById("event-list");
  const noEvent = document.getElementById("no-event");
  list.innerHTML = "";
  if(events.length===0){
    noEvent.classList.remove("hidden");
    return;
  } else {
    noEvent.classList.add("hidden");
  }
  events.forEach(ev=>{
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

// ---------- 報名 ----------
function goSignup(type){
  if(!isLoggedIn){ showModal("請先登入 Discord"); return; }
  type==="team" ? switchPage("leader-page") : switchPage("member-page");
}

function goProfile(){
  if(!isLoggedIn){ showModal("請先登入 Discord"); return; }
  switchPage("profile-page");
}

function goEventHome(){ switchPage("event-home"); }

// ---------- Modal ----------
function showModal(msg){
  modalText.textContent = msg;
  modal.classList.remove("hidden");
}
modalConfirm.onclick = () => modal.classList.add("hidden");
