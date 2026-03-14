const axios = require("axios");
const fs = require("fs");
const path = require("path");

module.exports = {
 config: {
  name: "installcmd",
  version: "2.0",
  author: "AI",
  role: 2,
  shortDescription: "Install command from raw link",
  longDescription: "Download and install command file from URL",
  category: "owner",
  guide: "{pn} raw_link"
 },

 onStart: async function ({ message, args }) {

  if (!args[0]) {
   return message.reply("⚠️ | Please provide raw command link");
  }

  try {

   const url = args[0];

   const res = await axios.get(url);

   const fileName = url.split("/").pop();

   const filePath = path.join(__dirname, fileName);

   fs.writeFileSync(filePath, res.data);

   message.reply(`✅ Command installed: ${fileName}`);

  } catch (err) {
   console.log(err);
   message.reply("❌ Failed to install command");
  }

 }
};
