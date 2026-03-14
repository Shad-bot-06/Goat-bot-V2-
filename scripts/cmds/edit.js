const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports = {
  config: {
    name: "edit",
    version: "1.0",
    author: "AI",
    countDown: 5,
    role: 0,
    shortDescription: "AI image edit",
    longDescription: "Edit images using AI prompt",
    category: "ai",
    guide: {
      en: "{pn} reply image with prompt"
    }
  },

  onStart: async function ({ api, event, args }) {
    try {

      if (!event.messageReply) {
        return api.sendMessage(
          "❌ Please reply to an image\nExample:\n!edit change hair colour",
          event.threadID,
          event.messageID
        );
      }

      const prompt = args.join(" ");
      if (!prompt) {
        return api.sendMessage(
          "❌ Please provide edit prompt",
          event.threadID,
          event.messageID
        );
      }

      const imageUrl = event.messageReply.attachments[0].url;

      const img = (
        await axios.get(imageUrl, { responseType: "arraybuffer" })
      ).data;

      const input = path.join(__dirname, "cache", "input.jpg");
      fs.writeFileSync(input, img);

      const apiUrl =
        `https://api.popcat.xyz/imagine?prompt=${encodeURIComponent(prompt)}`;

      const res = await axios.get(apiUrl);

      const output = (
        await axios.get(res.data.url, { responseType: "arraybuffer" })
      ).data;

      const out = path.join(__dirname, "cache", "edited.jpg");

      fs.writeFileSync(out, output);

      api.sendMessage(
        {
          body: `✨ AI Edited\nPrompt: ${prompt}`,
          attachment: fs.createReadStream(out)
        },
        event.threadID,
        () => {
          fs.unlinkSync(input);
          fs.unlinkSync(out);
        },
        event.messageID
      );

    } catch (e) {
      console.log(e);
      api.sendMessage("❌ AI edit failed", event.threadID);
    }
  }
};
