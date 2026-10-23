import { spawn } from 'node:child_process';
import fs from 'node:fs';

const CLOUDFLARED = 'C:\\Program Files (x86)\\cloudflared\\cloudflared.exe';
const TARGET_PORT = process.env.PORT || 5174;
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '';
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID || '';

console.log(`🚀 Starting Cloudflare Tunnel pointing to https://localhost:${TARGET_PORT}...`);

const proc = spawn(CLOUDFLARED, ['tunnel', '--url', `https://localhost:${TARGET_PORT}`, '--no-tls-verify'], {
  stdio: ['ignore', 'pipe', 'pipe'],
});

let foundUrl = null;

function processOutput(data) {
  const text = data.toString();
  const match = text.match(/https:\/\/[a-zA-Z0-9-]+\.trycloudflare\.com/);
  if (match && !foundUrl) {
    foundUrl = match[0];
    console.log(`\n==================================================`);
    console.log(`🎉 Cloudflare Public Tunnel URL Ready:`);
    console.log(`👉 ${foundUrl}`);
    console.log(`==================================================\n`);
    try {
      fs.writeFileSync('public_url.txt', foundUrl);
    } catch {}

    if (TELEGRAM_BOT_TOKEN && TELEGRAM_CHAT_ID) {
      console.log(`📨 Sending link to Telegram bot @Alqami_Ai_bot...`);
      fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: TELEGRAM_CHAT_ID,
          text: `🏛️ ALQAMI 5 Spatial Museum is Live!\n\n🔗 ${foundUrl}\n\n✨ Real 3D interactive models, 3D surface tracking, visionOS spatial lighting.`,
        }),
      })
        .then((r) => r.json())
        .then((res) => {
          if (res.ok) console.log(`✅ Telegram message sent successfully!`);
          else console.warn(`⚠️ Telegram API response:`, res.description);
        })
        .catch((e) => console.error(`❌ Failed to send to Telegram:`, e.message));
    } else {
      console.log(`ℹ️ Tip: Set TELEGRAM_BOT_TOKEN and TELEGRAM_CHAT_ID in .env to auto-notify @Alqami_Ai_bot`);
    }
  }
}

proc.stdout.on('data', processOutput);
proc.stderr.on('data', processOutput);

proc.on('close', (code) => {
  console.log(`Cloudflare tunnel process exited with code ${code}`);
});
