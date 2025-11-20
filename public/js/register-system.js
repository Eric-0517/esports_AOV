let isLoggedIn = false;
let username = "訪客";

const usernameEl = document.getElementById("username");
const navRight = document.getElementById("nav-right");
const modal = document.getElementById("system-modal");
const modalText = document.getElementById("modal-text");
const modalConfirm = document.getElementById("modal-confirm");

// Discord OAuth 設定
const clientId = "1403970810762363013";
const backendCallback = "https://esportsmoba.dpdns.org/auth/discord/callback"; // 後端 callback
const scope = "identify";

// 假資料
const events = [
  { name: "AOV 線上賽 - 測試賽事", date: "2025/11/30", signup: "2025/11/20 - 2025/11/25", status: "報名中" }
];

window.onload = () => {
  renderEvents();
  updateUserUI();

  // 取得 JWT
  const urlParams = new URLSearchParams(window.location.search);
  const token = urlParams.get("token");
  if (token) handleToken(token);
};

// 更新 UI
function updateUserUI() {
  usernameEl.textContent = username;

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

// Discord OAuth 登入
function login() {
  const oauthUrl =
    `https://discord.com/oauth2/authorize` +
    `?client_id=${clientId}` +
    `&redirect_uri=${encodeURIComponent(backendCallback)}` +
    `&response_type=code` +
    `&scope=${encodeURIComponent(scope)}`;
  window.location.href = oauthUrl;
}

// 登出
function logout() {
  isLoggedIn = false;
  username = "訪客";
  switchPage("event-home");
  updateUserUI();
}

// 處理 JWT
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

// 頁面切換
function switchPage(pageId) {
  const pages = ["event-home", "profile-page", "leader-page", "member-page"];
  pages.forEach(id => { const el = document.getElementById(id); if(el) el.style.display = "none"; });
  const target = document.getElementById(pageId);
  if(target) target.style.display = "block";
}

// 渲染賽事
function renderEvents() {
  const list = document.getElementById("event-list");
  const noEvent = document.getElementById("no-event");
  list.innerHTML = "";
  if (events.length === 0) { noEvent.classList.remove("hidden"); return; } else { noEvent.classList.add("hidden"); }

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

// 報名 & 個人頁
function goSignup(type) { if(!isLoggedIn){ showModal("請先登入 Discord"); return; } type==='team'?switchPage('leader-page'):switchPage('member-page'); }
function goProfile() { if(!isLoggedIn){ showModal("請先登入 Discord"); return; } switchPage('profile-page'); }
function goEventHome() { switchPage("event-home"); }

// Modal
function showModal(msg){ modalText.textContent = msg; modal.classList.remove("hidden"); }
modalConfirm.onclick = ()=> modal.classList.add("hidden");

// 按鈕事件
document.getElementById("save-profile")?.addEventListener("click",()=>{ alert("個人資料已更新"); goEventHome(); });
document.getElementById("cancel-profile")?.addEventListener("click", goEventHome);
document.getElementById("cancel-leader")?.addEventListener("click", goEventHome);
document.getElementById("next-leader")?.addEventListener("click", ()=> switchPage("member-page"));
document.getElementById("cancel-member")?.addEventListener("click", goEventHome);
document.getElementById("confirm-member")?.addEventListener("click", ()=> { alert("報名完成"); goEventHome(); });
