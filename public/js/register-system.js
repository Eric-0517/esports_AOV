let isLoggedIn = false;
let username = "訪客";
let token = null; // JWT
let savedProfile = {};

const usernameEl = document.getElementById("username");
const navRight = document.getElementById("nav-right");

window.onload = async () => {
  // 取得 URL token
  const urlParams = new URLSearchParams(window.location.search);
  const t = urlParams.get("token");
  if (t) {
    token = t;
    handleToken(token);
    await loadProfile();
  }

  updateUserUI();
  renderEvents();
};

function updateUserUI() {
  usernameEl.textContent = username;

  const loginBtnHtml = isLoggedIn ?
    `<button class="btn-login" onclick="goProfile()">個人資料 / 已報名資訊</button>
     <button class="btn-login" onclick="logout()">登出</button>` :
    `<button class="btn-login" id="login-btn">Discord 登入</button>`;
  navRight.innerHTML = loginBtnHtml;
  if (!isLoggedIn) document.getElementById("login-btn")?.addEventListener("click", login);

  document.getElementById("p-discord").textContent = username;
  document.getElementById("leader-discord").textContent = username;

  // 遊戲暱稱 / 排位
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

  // 其他欄位
  ["p-realname","p-phone","p-email","p-birthday","p-taiwan","p-id"].forEach(id => {
    const el = document.getElementById(id);
    if (el && savedProfile[id]) el.value = savedProfile[id];
  });
}

// 取得個人資料
async function loadProfile() {
  try {
    const res = await fetch("/api/profile", { headers: { Authorization: `Bearer ${token}` } });
    if (res.ok) savedProfile = await res.json();
    else savedProfile = {};
  } catch(err) {
    console.error(err);
    savedProfile = {};
  }
}

// 儲存個人資料
document.getElementById("save-profile")?.addEventListener("click", async () => {
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
    } else alert("儲存失敗");
  } catch(err) {
    console.error(err);
    alert("儲存失敗");
  }
});

// 登入 / 登出
function login() {
  window.location.href =
    `https://discord.com/oauth2/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(backendCallback)}&response_type=code&scope=${encodeURIComponent(scope)}`;
}
function logout() {
  isLoggedIn = false;
  username = "訪客";
  token = null;
  savedProfile = {};
  switchPage("event-home");
  updateUserUI();
}

function handleToken(t) {
  try {
    const payload = JSON.parse(atob(t.split('.')[1]));
    username = payload.username || "Discord使用者";
    isLoggedIn = true;
  } catch(err) {
    console.error(err);
    username = "訪客";
    isLoggedIn = false;
  }
}
