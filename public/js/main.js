function showPage(page) {
  const isLoggedIn = !!localStorage.getItem("userToken");

  // 隱藏所有頁面
  document.querySelectorAll(".page-section").forEach(sec => sec.style.display = "none");

  // 如果未登入且嘗試進入個人資料頁，跳回首頁
  if (!isLoggedIn && page === "profile-page") {
    page = "home-page"; // 或你想要的預設頁
  }

  // 顯示選定頁面
  const target = document.getElementById(page);
  if (target) target.style.display = "block";

  // 更新導覽列樣式
  document.querySelectorAll(".sub-btn").forEach(btn => btn.classList.remove("active"));
  const activeBtn = document.querySelector(`.sub-btn[onclick="showPage('${page}')"]`);
  if (activeBtn) activeBtn.classList.add("active");

  // 捲動至頂部
  window.scrollTo(0, 0);
}
