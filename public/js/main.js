
document.addEventListener('DOMContentLoaded',()=>{
  const loginBtn=document.getElementById('discord-login');
  if(loginBtn) loginBtn.addEventListener('click',()=>{
    const clientId="<DISCORD_CLIENT_ID>";
    const redirectUri=encodeURIComponent("<FRONTEND_URL>/auth/discord/callback");
    const url=`https://discord.com/api/oauth2/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&scope=identify`;
    window.location.href=url;
  });

  const submitBtn=document.getElementById('submitTeam');
  if(submitBtn) submitBtn.addEventListener('click',async()=>{
    const teamName=document.getElementById('teamName').value;
    const members=document.getElementById('members').value.split(',').map(s=>s.trim());
    const token=localStorage.getItem('jwt');
    if(!token) return alert('請先登入 Discord');
    try{
      await fetch('/api/teams/register',{method:'POST',headers:{'Content-Type':'application/json','Authorization':'Bearer '+token},body:JSON.stringify({name:teamName,members})});
      alert('報名送出，請等待管理員審核');
    }catch(e){alert('送出失敗');}
  });
});
