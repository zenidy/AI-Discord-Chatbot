require("dotenv").config();
const {Client, GatewayIntentBits} = require("discord.js");
const {OpenAI} = require("openai");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});


const openai = new OpenAI({
  apiKey: process.env.DEEPSEEK_API_KEY,
  baseURL: "https://api.deepseek.com",
});

client.once("ready", () => {console.log(`Logged in as ${client.user.tag}`);});

client.on("messageCreate", async (message) => {
  if (message.author.bot) return;
  //console.log(`[${message.author.username}] said: ${message.content}`);  // Logs discord messages for debugging

  if (message.mentions.has(client.user)) {
    const userInput = message.content.replace(/<@!?(\d+)>/, "").trim();

    try {
      const response = await openai.chat.completions.create({
        model: "deepseek-chat",
        messages: [
          { role: "system", content: "You are a helpful assistant." },
          { role: "user", content: userInput },
        ],
      }); 

      let reply = response.choices[0].message.content;
      const DISCORD_MAX = 2000

      if (reply.length > DISCORD_MAX) {
        for (i = 0; i < reply.length; i += DISCORD_MAX) {
          let chunk = reply.substring(i, i + DISCORD_MAX);
          await message.reply(chunk);
        }
      }
      else {
        await message.reply(reply);
      }
    } catch (err) {
      console.error("DeepSeek API error:", err);
      message.reply("⚠️ I couldn’t reach the AI.");
    }
  }
});

client.login(process.env.DISCORD_TOKEN);
