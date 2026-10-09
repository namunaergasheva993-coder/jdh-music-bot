const { Telegraf, Markup } = require('telegraf');
const express = require('express');

const BOT_TOKEN = '8826250953:AAHW0pqJrUorqBXBnrq-vJYAEMGWNFnm95g';
const CHANNEL_USERNAME = '@jdhchannel_it';

const bot = new Telegraf(BOT_TOKEN);

// 1. Express serverni birinchi ishga tushiramiz (Render o'chib qolmasligi uchun)
const app = express();
const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.send('Bot muvaffaqiyatli ishlamoqda!');
});

app.listen(PORT, () => {
  console.log(`Server ${PORT}-portda ishga tushdi.`);
});

// 2. Majburiy obunani tekshirish funksiyasi
async function checkSub(ctx) {
  try {
    const member = await ctx.telegram.getChatMember(CHANNEL_USERNAME, ctx.from.id);
    return ['creator', 'administrator', 'member'].includes(member.status);
  } catch (e) {
    console.error("Obuna tekshirishda xato:", e);
    return false;
  }
}

bot.use(async (ctx, next) => {
  if (!ctx.from) return next();
  
  const isSubbed = await checkSub(ctx);
  if (!isSubbed) {
    const channelLink = `https://t.me/${CHANNEL_USERNAME.replace('@', '')}`;
    return ctx.reply(
      `👋 Salom!\n\nBotdan foydalanish uchun rasmiy kanalimizga obuna bo'ling:`,
      Markup.inlineKeyboard([
        [Markup.button.url("📢 Kanalga obuna bo'lish", channelLink)],
        [Markup.button.callback("✅ Obunani tekshirish", "check_subscription")]
      ])
    );
  }
  return next();
});

bot.action('check_subscription', async (ctx) => {
  const isSubbed = await checkSub(ctx);
  if (isSubbed) {
    await ctx.answerCbQuery("✅ Rahmat! Obuna tasdiqlandi.");
    await ctx.reply("🎶 Qo'shiq nomini yuboring:");
  } else {
    await ctx.answerCbQuery("❌ Siz hali kanalga obuna bo'lmadingiz!", { show_alert: true });
  }
});

bot.on('text', (ctx) => {
  ctx.reply(`🔍 "${ctx.message.text}" bo'yicha musiqa qidirilmoqda...`);
});

// 3. Botni ishga tushirish
bot.launch().then(() => {
  console.log("Bot Telegram'ga muvaffaqiyatli ulandi!");
}).catch((err) => {
  console.error("Botni ishga tushirishda xatolik:", err);
});

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
