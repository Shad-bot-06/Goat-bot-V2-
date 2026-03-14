const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports = {
  config: {
    name: "edit",
    version: "2.0",
    author: "AI",
    countDown: 5,
    role: 0,
    shortDescription: "AI image edit",
    longDescription: "Edit image using prompt",
    category: "ai",
    guide: "{pn} reply photo | {pn} change hair colour"
  },

  onStart: async function ({ api, event, args }) {

    try {

      if (!event.messageReply) {
        return api.sendMessage(
          "❌ Reply to an image\nExample:\n!edit change hair colour",
          event.threadID,
          event.messageID
        );
      }

      const prompt = args.join(" ");
      if (!prompt) {
        return api.sendMessage(
          "❌ Write what you want to edit",
          event.threadID
        );
      }

      const attachment = event.messageReply.attachments[0];

      if (attachment.type !== "photo") {
        return api.sendMessage("❌ Please reply to a photo", event.threadID);
      }

      const imgURL = attachment.url;

      const apiURL =
        `https://api.popcat.xyz/imagine?prompt=${encodeURIComponent(prompt)}`;

      const response = await axios.get(apiURL);

      const img = await axios.get(response.data.url, {
        responseType: "arraybuffer"
      });

      const filePath = path.join(__dirname, "cache", "edit.png");

      fs.writeFileSync(filePath, img.data);

      api.sendMessage(
        {
          body: `✨ AI Edited\n🧠 Prompt: ${prompt}`,
          attachment: fs.createReadStream(filePath)
        },
        event.threadID,
        () => fs.unlinkSync(filePath),
        event.messageID
      );

    } catch (err) {

      console.log(err);

      api.sendMessage(
        "❌ AI server error\nTry again later",
        event.threadID,
        event.messageID
      );

    }
  }
};
