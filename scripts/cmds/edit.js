const axios = require("axios");
const fs = require("fs");
const path = require("path");

module.exports = {
  name: "edit",
  author: "AI",
  version: "1.0",
  description: "AI image edit",
  usage: "!edit <prompt>",
  cooldown: 5,

  async run({ api, event, args }) {

    try {

      if (!event.messageReply)
        return api.sendMessage(
          "Reply to an image\nExample: !edit change hair colour",
          event.threadID
        );

      const prompt = args.join(" ");

      if (!prompt)
        return api.sendMessage("Write what to edit", event.threadID);

      const imgURL = event.messageReply.attachments[0].url;

      const response = await axios.get(
        `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}`
      );

      const img = await axios.get(response.request.res.responseUrl, {
        responseType: "arraybuffer"
      });

      const filePath = path.join(__dirname, "cache_edit.png");

      fs.writeFileSync(filePath, img.data);

      api.sendMessage(
        {
          body: `✨ AI Edit\nPrompt: ${prompt}`,
          attachment: fs.createReadStream(filePath)
        },
        event.threadID,
        () => fs.unlinkSync(filePath)
      );

    } catch (e) {

      console.log(e);

      api.sendMessage(
        "❌ AI edit failed",
        event.threadID
      );

    }
  }
};
