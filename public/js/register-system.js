let isLoggedIn = false; 
let username = "訪客";

const usernameEl = document.getElementById("username");
const navRight = document.getElementById("nav-right");
const modal = document.getElementById("system-modal");
const modalText = document.getElementById("modal-text");
const modalConfirm = document.getElementById("modal-confirm");

// 測試賽事資料
const events = [
  {
    name: "AOV 線上賽 - 測試賽事",
    date: "2025/11/30",
    signup: "2025/11/20 - 2025/11/25",
    status: "報名中"
  }
];

// Discord OAuth 設定
const clientId = "1403970810762363013";
const redirectUri = encodeURIComponent(`${window.location.origin}/auth/discord/callback`); // 指向後端 callback
const scope = "identify";

window.onload = () => {
  renderEvents();
  updateUserUI();

  // OAuth callback 檢查 URL code
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

// 導向 Discord 登入頁
function login() {
  const redirectUri = encodeURIComponent("https://esportsmoba.dpdns.org/auth/discord/callback");
  const oauthUrl = `https://discord.com/api/oauth2/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&scope=${scope}`;
  window.location.href = oauthUrl;
}

// 登出
function logout() {
  isLoggedIn = false;
  username = "訪客";
  switchPage("event-home");
  updateUserUI();
}

// 收到 JWT 後處理
function handleToken(token) {
  // 解 JWT (可用 jwt-decode 或自己解析)
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    username = payload.username || "Discord使用者";
    isLoggedIn = true;
    updateUserUI();
    history.replaceState(null, '', 'register-system.html'); // 清掉 URL token
  } catch (err) {
    console.error(err);
  }
}

// 頁面切換
function switchPage(pageId) {
  const pages = ["event-home", "profile-page", "leader-page", "member-page"];
  pages.forEach(id => {
    const el = document.getElementById(id);
    if(el) el.style.display = "none";
  });
  const target = document.getElementById(pageId);
  if(target) target.style.display = "block";
}

// 渲染賽事資訊
function renderEvents() {
  const list = document.getElementById("event-list");
  const noEvent = document.getElementById("no-event");
  list.innerHTML = "";

  if (events.length === 0) {
    noEvent.classList.remove("hidden");
    return;
  } else {
    noEvent.classList.add("hidden");
  }

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

// 點擊報名
function goSignup(type) {
  if (!isLoggedIn) {
    modal.classList.remove("hidden");
    modalText.textContent = "請先登入 Discord";
    modalConfirm.onclick = () => modal.classList.add("hidden");
    return;
  }

  if(type === "team") switchPage("leader-page");
  else switchPage("member-page");
}

// 前往個人資訊頁
function goProfile() {
  if(!isLoggedIn){
    modal.classList.remove("hidden");
    modalText.textContent = "請先登入 Discord";
    modalConfirm.onclick = () => modal.classList.add("hidden");
    return;
  }
  switchPage("profile-page");
}

// 返回賽事首頁
function goEventHome() {
  switchPage("event-home");
}

// 綁定按鈕事件
document.getElementById("save-profile")?.addEventListener("click",()=>{ alert("個人資料已更新"); goEventHome(); });
document.getElementById("cancel-profile")?.addEventListener("click", goEventHome);
document.getElementById("cancel-leader")?.addEventListener("click", goEventHome);
document.getElementById("next-leader")?.addEventListener("click", ()=> switchPage("member-page"));
document.getElementById("cancel-member")?.addEventListener("click", goEventHome);
document.getElementById("confirm-member")?.addEventListener("click", ()=> { alert("報名完成！"); goEventHome(); });

// Modal 確認
modalConfirm.onclick = ()=> modal.classList.add("hidden");
