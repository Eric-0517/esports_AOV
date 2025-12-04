// 全域變數
let isLoggedIn = false;
let username = "訪客";
let token = null;

// Discord OAuth 設定
const clientId = "1403970810762363013";
const backendCallback = "https://esportsmoba.dpdns.org/auth/discord/callback";
const scope = "identify";

// Modal 工具
function showModal(title, text) {
  const modal = document.getElementById("system-modal");
  const modalText = document.getElementById("modal-text");
  const modalTitle = modal.querySelector(".modal-title");
  const modalBtn = document.getElementById("modal-confirm");

  modalTitle.textContent = title;
  modalText.textContent = text;
  modal.classList.remove("hidden");

  return new Promise(resolve => {
    modalBtn.onclick = () => {
      modal.classList.add("hidden");
      resolve(true);
    };
  });
}

// 讀取 URL Token
function readTokenFromURL() {
  const urlParams = new URLSearchParams(window.location.search);
  const t = urlParams.get("token");
  if (t) {
    localStorage.setItem("userToken", t);
    window.history.replaceState({}, document.title, window.location.pathname);
  }
}

// 從後端驗證 token
async function loadUserFromToken() {
  const saved = localStorage.getItem("userToken");
  if (!saved) return;

  try {
    const res = await fetch(`https://esportsmoba.dpdns.org/auth/me?ts=${Date.now()}`, {
      headers: { "Authorization": `Bearer ${saved}` }
    });

    const data = await res.json();

    if (!data.ok) {
      throw new Error("Token 過期或無效");
    }

    username = data.username;
    isLoggedIn = true;

  } catch (err) {
    console.error("Token 驗證失敗：", err);
    showModal("系統通知", "登入已過期，請重新登入");
    isLoggedIn = false;
    username = "訪客";
    localStorage.removeItem("userToken");
  }
}

// OAuth 登入
function login() {
  const oauthUrl =
    `https://discord.com/oauth2/authorize?client_id=${clientId}` +
    `&redirect_uri=${encodeURIComponent(backendCallback)}` +
    `&response_type=code&scope=${encodeURIComponent(scope)}`;
  window.location.href = oauthUrl;
}

// UI 更新
function updateUserUI() {
  const usernameSpan = document.getElementById("username");
  if (usernameSpan) usernameSpan.textContent = username;

  const leader = document.getElementById("leader-discord");
  if (leader) leader.textContent = username;

  const loginBtn = document.getElementById("login-btn");
  if (loginBtn) loginBtn.style.display = isLoggedIn ? "none" : "inline-block";
}

// 渲染賽事
async function renderEvents() {
  const list = document.getElementById("event-list");
  const noEvent = document.getElementById("no-event");
  if (!list) return;

  list.innerHTML = "";

  try {
    // 加亂數避免快取
    const res = await fetch(`/events.json?ts=${Date.now()}`);
    if (!res.ok) throw new Error("讀取 events.json 失敗");
    const events = await res.json();

    if (!events || events.length === 0) {
      noEvent.classList.remove("hidden");
      return;
    } else {
      noEvent.classList.add("hidden");
    }

    events.forEach(ev => {
      const div = document.createElement("div");
      div.className = "event-card";

      const btnClass = ev.status === "報名中" ? "btn-active" : "btn-disabled";
      const btnText = ev.status === "報名中" ? "前往報名" : "報名結束";
      const scheduleClass = ev.hasSchedule ? "btn-active" : "btn-disabled";

      div.innerHTML = `
        <div class="event-name">${ev.name}</div>
        <div class="event-info">比賽日期：${ev.date}</div>
        <div class="event-info">報名時間：${ev.signup}</div>
        <div class="event-info">狀態：${ev.status}</div>
        <div class="card-btn-row">
          <div class="card-btn ${btnClass}" ${ev.status==="報名中" ? `onclick="window.location.href='${ev.signupUrl}'"` : ""}>${btnText}</div>
          <div class="card-btn ${scheduleClass}" ${ev.hasSchedule ? `onclick="window.open('/schedule','_blank')"` : ""}>賽程表</div>
        </div>
      `;
      list.appendChild(div);
    });

  } catch (err) {
    console.error("載入賽事失敗:", err);
    if (noEvent) noEvent.classList.remove("hidden");
  }
}

// 前往隊長報名
function goSignup() {
  if (!isLoggedIn) {
    showModal("系統通知", "請先登入");
    return;
  }
  alert("前往隊長報名頁");
}

// 初始化
document.addEventListener("DOMContentLoaded", async () => {
  readTokenFromURL();
  await loadUserFromToken(); // 等待驗證完成
  updateUserUI();
  renderEvents();

  const loginBtn = document.getElementById("login-btn");
  if (loginBtn) loginBtn.addEventListener("click", login);
});
