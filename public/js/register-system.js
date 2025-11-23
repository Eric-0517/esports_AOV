//全域變數
let isLoggedIn = false;
let username = "訪客";
let token = null;

// Discord OAuth 設定
const clientId = "1403970810762363013";
const backendCallback = "https://esportsmoba.dpdns.org/auth/discord/callback";
const scope = "identify";

//OAuth 登入
function login() {
  const oauthUrl = `https://discord.com/oauth2/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(backendCallback)}&response_type=code&scope=${encodeURIComponent(scope)}`;
  window.location.href = oauthUrl;
}

//更新 UI
function updateUserUI() {
  const usernameSpan = document.getElementById("username");
  if (usernameSpan) usernameSpan.textContent = username;

  const leader = document.getElementById("leader-discord");
  if (leader) leader.textContent = username;

  const loginBtn = document.getElementById("login-btn");
  if (loginBtn) loginBtn.style.display = isLoggedIn ? "none" : "inline-block";
}

//渲染賽事
function renderEvents() {
  const list = document.getElementById("event-list");
  const noEvent = document.getElementById("no-event");
  if (!list) return;

  list.innerHTML = "";

  const events = [
    { name: "AOV 線上賽 - 測試賽事", date:"2025/11/30", signup:"2025/11/20 - 2025/11/25", status:"報名中", hasSchedule:true },
    { name: "AOV 線上賽 - 測試賽事2", date:"2025/12/05", signup:"2025/11/25 - 2025/11/30", status:"報名結束", hasSchedule:false }
  ];

  if(events.length === 0){
    if(noEvent) noEvent.classList.remove("hidden");
    return;
  } else {
    if(noEvent) noEvent.classList.add("hidden");
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
        <div class="card-btn ${btnClass}" ${ev.status==="報名中"?'onclick="goSignup()"':''}>${btnText}</div>
        <div class="card-btn ${scheduleClass}" ${ev.hasSchedule?'onclick="window.open(\'/schedule\',\'_blank\')"':''}>賽程表</div>
      </div>
    `;
    list.appendChild(div);
  });
}

//前往隊長報名
function goSignup() {
  if(!isLoggedIn){
    alert("請先登入 Discord");
    return;
  }
  alert("前往隊長報名頁");
}

//初始化
document.addEventListener("DOMContentLoaded", () => {
  renderEvents();
  updateUserUI();

  // 綁定登入按鈕
  const loginBtn = document.getElementById("login-btn");
  if(loginBtn){
    loginBtn.addEventListener("click", login);
  }
});
