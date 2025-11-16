// 切換頁面
function showPage(page) {
  // 隱藏所有頁面
  document.querySelectorAll(".page-section").forEach(sec => sec.style.display = "none");

  // 顯示選定頁面
  document.getElementById(page).style.display = "block";

  // 更新導覽列樣式
  document.querySelectorAll(".sub-btn").forEach(btn => btn.classList.remove("active"));
  document.querySelector(`.sub-btn[onclick="showPage('${page}')"]`).classList.add("active");

  // 捲動至頂部
  window.scrollTo(0, 0);
}
