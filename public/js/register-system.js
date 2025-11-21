// ---------- 全域變數 ----------
let isLoggedIn = false;
let username = "訪客";
let savedProfile = {}; // 儲存已填寫資料
let token = null;

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
window.onload = async () => {
  // 取得 URL token
  const urlParams = new URLSearchParams(window.location.search);
  token = urlParams.get("token");
  if (token) {
    handleToken(token);
    await loadProfile(); // 從後端載入已填資料
  }

  updateUserUI();
  renderEvents();

  // ---------- 綁定按鈕事件 ----------
  document.getElementById("save-profile")?.addEventListener("click", saveProfile);
  document.getElementById("cancel-profile")?.addEventListener("click", goEventHome);
  document.getElementById("cancel-leader")?.addEventListener("click", goEventHome);
  document.getElementById("next-leader")?.addEventListener("click", () => switchPage("member-page"));
  document.getElementById("cancel-member")?.addEventListener("click", goEventHome);
  document.getElementById("confirm-member")?.addEventListener("click", () => { alert("報名完成"); goEventHome(); });
};

// ---------- 更新 UI ----------
function updateUserUI() {
  usernameEl.textContent = username;

  // 隊長報名自動帶入
  const leaderDiscord = document.getElementById("leader-discord");
  if (leaderDiscord) leaderDiscord.textContent = username;

  if (!isLoggedIn) {
    navRight.innerHTML = `<button class="btn-login" id="login-btn">Discord 登入</button>`;
    document.getElementById("login-btn").onclick = login;
  } else {
    navRight.innerHTML = `
      <button class="btn-login" onclick="goProfile()">個人資料 / 已報名資訊</button>
      <button class="btn-login" onclick="logout()">登出</button>
    `;
  }

  // Discord 名稱自動帶入
  const discordSpan = document.getElementById("p-discord");
  if (discordSpan) discordSpan.textContent = username;

  // 如果已經填寫過暱稱或排位，就禁止修改
  const nicknameInput = document.getElementById("p-nickname");
  const rankInput = document.getElementById("p-rank");
  if (savedProfile.nickname) {
    nicknameInput.value = savedProfile.nickname;
    nicknameInput.disabled = true;
  }
  if (savedProfile.rank) {
    rankInput.value = savedProfile.rank;
    rankInput.disabled = true;
  }

  // 其他欄位帶入
  document.getElementById("p-realname").value = savedProfile.realname || "";
  document.getElementById("p-phone").value = savedProfile.phone || "";
  document.getElementById("p-email").value = savedProfile.email || "";
  document.getElementById("p-birthday").value = savedProfile.birthday || "";
  document.getElementById("p-taiwan").value = savedProfile.taiwan || "是";
  document.getElementById("p-id").value = savedProfile.idNumber || "";
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
  savedProfile = {};
  switchPage("event-home");
  updateUserUI();
}

// ---------- 處理 JWT ----------
function handleToken(t) {
  try {
    const payload = JSON.parse(atob(t.split('.')[1]));
    username = payload.username || "Discord使用者";
    isLoggedIn = true;

    // 清除 URL token
    history.replaceState(null, "", "register-system.html");

    updateUserUI();
  } catch (err) {
    console.error("JWT 解析錯誤:", err);
  }
}

// ---------- 頁面切換 ----------
function switchPage(pageId) {
  const pages = ["event-home","profile-page","leader-page","member-page"];
  pages.forEach(id => { const el = document.getElementById(id); if(el) el.style.display="none"; });
  const target = document.getElementById(pageId);
  if(target) target.style.display="block";
}

// ---------- Modal ----------
function showModal(msg){ modalText.textContent=msg; modal.classList.remove("hidden"); }
modalConfirm.onclick = ()=> modal.classList.add("hidden");

// ---------- 假賽事列表 ----------
function renderEvents() {
  const list = document.getElementById("event-list");
  const noEvent = document.getElementById("no-event");
  list.innerHTML = "";
  const events = [
    { name: "AOV 線上賽 - 測試賽事", date: "2025/11/30", signup: "2025/11/20 - 2025/11/25", status: "報名中" }
  ];
  if(events.length===0){ noEvent.classList.remove("hidden"); return; } else { noEvent.classList.add("hidden"); }
  events.forEach(ev=>{
    const div=document.createElement("div");
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

// ---------- 報名 & 個人頁 ----------
function goSignup(type){ 
  if(!isLoggedIn){ showModal("請先登入 Discord"); return; }
  type==="team"?switchPage("leader-page"):switchPage("member-page");
}
function goProfile(){ if(!isLoggedIn){ showModal("請先登入 Discord"); return; } switchPage("profile-page"); }
function goEventHome(){ switchPage("event-home"); }

// ---------- 載入個人資料 ----------
async function loadProfile() {
  if (!token) return;
  try {
    const res = await fetch("/api/profile", {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (res.ok) {
      savedProfile = await res.json();
      updateUserUI();
    }
  } catch(err) {
    console.error(err);
  }
}

// ---------- 儲存個人資料 ----------
async function saveProfile() {
  const data = {
    nickname: document.getElementById("p-nickname").value,
    rank: document.getElementById("p-rank").value,
    realname: document.getElementById("p-realname").value,
    phone: document.getElementById("p-phone").value,
    email: document.getElementById("p-email").value,
    birthday: document.getElementById("p-birthday").value,
    taiwan: document.getElementById("p-taiwan").value,
    idNumber: document.getElementById("p-id").value
  };

  if (!token) { showModal("請先登入 Discord"); return; }

  try {
    const res = await fetch("/api/profile", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify(data)
    });
    if (res.ok) {
      savedProfile = await res.json();
      alert("個人資料已儲存");
      updateUserUI();
      goEventHome();
    } else {
      alert("儲存失敗");
    }
  } catch(err) {
    console.error(err);
    alert("儲存失敗");
  }
}
