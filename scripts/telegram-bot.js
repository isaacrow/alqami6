import fs from 'node:fs';

const TOKEN = '8815969878:AAFKPauCPpR3_vKCQ8JkeIGn0hEtGivURZU';
const TUNNEL_URL = 'https://somerset-definitely-dive-thirty.trycloudflare.com';
const CONFIG_FILE = 'telegram_config.json';

let knownChatIds = new Set();

// Load cached chat IDs if available
try {
  if (fs.existsSync(CONFIG_FILE)) {
    const data = JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf8'));
    if (Array.isArray(data.chatIds)) {
      data.chatIds.forEach((id) => knownChatIds.add(id));
    }
  }
} catch (e) {
  console.warn('Error reading telegram_config.json:', e);
}

async function sendWelcomeMessage(chatId, firstName = 'User') {
  let publicUrl = TUNNEL_URL;
  try {
    if (fs.existsSync('public_url.txt')) {
      const u = fs.readFileSync('public_url.txt', 'utf8').trim();
      if (u) publicUrl = u;
    }
  } catch {}

  const text = `🏛️ *مرحباً بك يا ${firstName} في متحف علقمي المكاني (ALQAMI 5)*!\n\n` +
    `🚀 *المشروع يعمل ومتاح للمعاينة المباشرة عبر الرابط التالي:*\n` +
    `🔗 ${publicUrl}\n\n` +
    `✨ *أبرز المميزات المفعلة:*\n` +
    `• مجسمات 3D تفاعلية حقيقية بالكامل (WebGL & Three.js)\n` +
    `• تتبع ذكي لنقاط الفحص ثلاثية الأبعاد على أسطح المقتنيات\n` +
    `• تجربة فحص مكانية (Spatial Pop-Out) ومحاكاة visionOS\n` +
    `• تحكم كامل بالإضاءة وتغيير عشوائي للمقتنيات النادرة`;

  try {
    const res = await fetch(`https://api.telegram.org/bot${TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: text,
        parse_mode: 'Markdown',
      }),
    });
    const json = await res.json();
    if (json.ok) {
      console.log(`✅ Link sent successfully to Telegram user (${chatId})!`);
    } else {
      console.warn(`⚠️ Telegram error:`, json.description);
    }
  } catch (err) {
    console.error(`❌ Failed to send message:`, err.message);
  }
}

// Send to all known chats immediately
for (const cid of knownChatIds) {
  sendWelcomeMessage(cid);
}

let lastUpdateId = 0;

async function pollUpdates() {
  try {
    const res = await fetch(`https://api.telegram.org/bot${TOKEN}/getUpdates?offset=${lastUpdateId + 1}&timeout=30`);
    const data = await res.json();

    if (data.ok && Array.isArray(data.result)) {
      for (const update of data.result) {
        lastUpdateId = Math.max(lastUpdateId, update.update_id);
        const msg = update.message;
        if (msg && msg.chat && msg.chat.id) {
          const chatId = msg.chat.id;
          const firstName = msg.from?.first_name || 'صديقنا';
          console.log(`📩 New message received from ${firstName} (${chatId}): "${msg.text || ''}"`);

          knownChatIds.add(chatId);
          fs.writeFileSync(CONFIG_FILE, JSON.stringify({ chatIds: Array.from(knownChatIds) }, null, 2));

          await sendWelcomeMessage(chatId, firstName);
        }
      }
    }
  } catch (e) {
    // network or timeout, continue
  }

  setTimeout(pollUpdates, 2000);
}

console.log('🤖 Telegram bot listener is active! Waiting for messages at @Alqami_Ai_bot...');
pollUpdates();
