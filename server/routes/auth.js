// ======================
//   全域變數
// ======================
let userToken = null;
let isLoggedIn = false;
let username = "訪客";

// ======================
//   從 URL 取得 token
// ======================
function readTokenFromURL() {
  const url = new URLSearchParams(window.location.search);
  const t = url.get("token");

  if (t) {
    localStorage.setItem("userToken", t);
    userToken = t;

    // 清掉 token 避免重複認證
    window.history.replaceState({}, document.title, window.location.pathname);
  } else {
    userToken = localStorage.getItem("userToken");
  }
}

// ======================
//   呼叫後端 /auth/me
// ======================
async function loadUserInfo() {
  if (!userToken) {
    isLoggedIn = false;
    username = "訪客";
    return;
  }

  try {
    const res = await fetch("https://esportsmoba.dpdns.org/auth/me", {
      headers: {
        "Authorization": `Bearer ${userToken}`
      }
    });

    const data = await res.json();

    if (!data.ok) {
      // token 無效
      localStorage.removeItem("userToken");
      isLoggedIn = false;
      username = "訪客";
      return;
    }

    // 成功登入
    isLoggedIn = true;
    username = data.username;

  } catch (e) {
    console.error("loadUserInfo error:", e);
    isLoggedIn = false;
  }
}

// ======================
//   更新 UI
// ======================
function updateUserUI() {
  const nameSpan = document.getElementById("username");
  if (nameSpan) nameSpan.textContent = username;

  const pDiscord = document.getElementById("p-discord");
  if (pDiscord) pDiscord.textContent = username;

  const loginBtn = document.getElementById("login-btn");
  const logoutBtn = document.getElementById("logout-btn");
  const profileBtn = document.getElementById("profile-btn");

  if (isLoggedIn) {
    if (loginBtn) loginBtn.classList.add("hidden");
    if (logoutBtn) logoutBtn.classList.remove("hidden");
    if (profileBtn) profileBtn.classList.remove("hidden");
  } else {
    if (loginBtn) loginBtn.classList.remove("hidden");
    if (logoutBtn) logoutBtn.classList.add("hidden");
    if (profileBtn) profileBtn.classList.add("hidden");
  }
}

// ======================
//   登入（導向 Discord）
// ======================
function login() {
  const clientId = "1403970810762363013";
  const redirect = "https://esportsmoba.dpdns.org/auth/discord/callback";

  const url =
    `https://discord.com/oauth2/authorize?client_id=${clientId}` +
    `&redirect_uri=${encodeURIComponent(redirect)}` +
    `&response_type=code&scope=identify`;

  window.location.href = url;
}

// ======================
//   登出
// ======================
function logout() {
  localStorage.removeItem("userToken");
  userToken = null;
  isLoggedIn = false;
  username = "訪客";
  updateUserUI();
  window.location.reload();
}

// ======================
//   個人資料頁
// ======================
function openProfile() {
  if (!isLoggedIn) {
    alert("請先登入");
    return;
  }
  document.getElementById("profile-page").classList.remove("hidden");
}

function closeProfile() {
  document.getElementById("profile-page").classList.add("hidden");
}

// ======================
//   初始化
// ======================
document.addEventListener("DOMContentLoaded", async () => {
  readTokenFromURL();
  await loadUserInfo();
  updateUserUI();

  // 綁定按鈕事件
  const loginBtn = document.getElementById("login-btn");
  if (loginBtn) loginBtn.onclick = login;

  const logoutBtn = document.getElementById("logout-btn");
  if (logoutBtn) logoutBtn.onclick = logout;

  const profileBtn = document.getElementById("profile-btn");
  if (profileBtn) profileBtn.onclick = openProfile;

  const cancelProfile = document.getElementById("cancel-profile");
  if (cancelProfile) cancelProfile.onclick = closeProfile;

  const saveProfile = document.getElementById("save-profile");
  if (saveProfile) {
    saveProfile.onclick = () => {
      alert("目前尚未與後端連接儲存機制");
      closeProfile();
    };
  }
});
