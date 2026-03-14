const axios = require("axios");
const fs = require("fs");

module.exports = {
 config: {
  name: "installcmd",
  version: "1.0",
  author: "auto",
  role: 2,
  shortDescription: "Install command from url",
  longDescription: "Install command using raw github link",
  category: "owner",
  guide: "{pn} [raw github link]"
 },

 onStart: async function ({ message, args }) {

  if (!args[0]) return message.reply("⚠️ | Please provide raw command link");

  try {

   const url = args[0];

   const response = await axios.get(url);

   const fileName = url.split("/").pop();

   fs.writeFileSync(`scripts/cmds/${fileName}`, response.data);

   message.reply(`✅ | Command installed: ${fileName}`);

  } catch (err) {
   message.reply("❌ | Failed to install command");
  }
 }
};
