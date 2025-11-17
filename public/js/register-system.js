// 模擬是否登入
let isLoggedIn = false;
let username = "訪客";

// DOM
const usernameEl = document.getElementById("username");
const navRight = document.getElementById("nav-right");
const modal = document.getElementById("system-modal");
const modalText = document.getElementById("modal-text");
const modalConfirm = document.getElementById("modal-confirm");

// 模擬賽事資料（之後可由後台 API 注入）
const events = [
  {
    name: "AOV 線上賽 - 第 1 週",
    date: "2025/03/20",
    signup: "2025/03/01 - 2025/03/10",
    status: "報名中"
  }
];

// 初始化
window.onload = () => {
  renderEvents();
  updateUserUI();
};

// 更新導覽列 UI
function updateUserUI() {
  usernameEl.textContent = username;

  if (!isLoggedIn) {
    navRight.innerHTML = `<button class="btn-login" id="login-btn">Discord 登入</button>`;
    document.getElementById("login-btn").onclick = login;
  } else {
    navRight.innerHTML = `
      <button class="btn-login" onclick="goProfile()">個人資訊 / 已報名資訊</button>
      <button class="btn-login" onclick="logout()">登出</button>
    `;
  }
}

// 登入模擬
function login() {
  modal.classList.remove("hidden");
  modalText.textContent = "請先登入";
  modalConfirm.onclick = () => {
    modal.classList.add("hidden");
    isLoggedIn = true;
    username = "玩家1234";
    updateUserUI();
  };
}

// 登出
function logout() {
  isLoggedIn = false;
  username = "訪客";
  updateUserUI();
}

// 前往個人資訊頁（待你建立）
function goProfile() {
  window.location.href = "player.html";
}

// 渲染賽事資訊
function renderEvents() {
  const list = document.getElementById("event-list");
  const noEvent = document.getElementById("no-event");

  if (events.length === 0) {
    noEvent.classList.remove("hidden");
    return;
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
    modalText.textContent = "請先登入";
    modalConfirm.onclick = () => modal.classList.add("hidden");
    return;
  }

  window.location.href = `event-register.html?type=${type}`;
}
