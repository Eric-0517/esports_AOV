// === SPA：分頁切換 ===
document.querySelectorAll('.page-nav a').forEach(btn => {
  btn.addEventListener('click', () => {
    const target = btn.getAttribute('data-page');

    // 隱藏所有頁面
    document.querySelectorAll('.page').forEach(page => {
      page.style.display = 'none';
    });

    // 顯示對應頁面
    document.getElementById(target).style.display = 'block';

    // 捲動到導覽列位置
    window.scrollTo({
      top: document.querySelector('.page-nav').offsetTop,
      behavior: "smooth"
    });
  });
});



// === 功能：Discord登入 & 隊伍報名 ===
document.addEventListener('DOMContentLoaded', () => {

  // --- Discord 登入 ---
  const loginBtn = document.getElementById('discord-login');
  
  if (loginBtn) {
    loginBtn.addEventListener('click', () => {
      const clientId = "<DISCORD_CLIENT_ID>";
      const redirectUri = encodeURIComponent("<FRONTEND_URL>/auth/discord/callback");

      const url = `https://discord.com/api/oauth2/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&scope=identify`;
      window.location.href = url;
    });
  }


  // --- 報名送出 ---
  const submitBtn = document.getElementById('submitTeam');

  if (submitBtn) {
    submitBtn.addEventListener('click', async () => {

      const teamName = document.getElementById('teamName').value;
      const members = document.getElementById('members').value
        .split(',')
        .map(s => s.trim());

      const token = localStorage.getItem('jwt');

      if (!token) {
        return alert('請先登入 Discord');
      }

      try {
        await fetch('/api/teams/register', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + token
          },
          body: JSON.stringify({
            name: teamName,
            members
          })
        });

        alert('報名送出，請等待管理員審核');

      } catch (e) {
        alert('送出失敗');
      }
    });
  }

});
