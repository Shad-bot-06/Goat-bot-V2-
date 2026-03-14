const axios = require("axios");
const fs = require("fs");
const path = require("path");

module.exports = {
  name: "edit",
  description: "AI image edit: upscale, add objects, remove objects, enhance",

  /**
   * @param api   - messenger api object
   * @param event - message event
   * @param args  - prompt array
   */
  async execute(api, event, args) {
    try {
      const prompt = args.join(" ").trim();

      // ❗ Must reply to an image
      if (!event.messageReply || !event.messageReply.attachments || !event.messageReply.attachments[0].type.includes("photo")) {
        return api.sendMessage(
          "❗ Please reply to a photo and type `!edit <instructions>`!",
          event.threadID,
          event.messageID
        );
      }

      if (!prompt) {
        return api.sendMessage(
          "❗ Provide what you want to change, like:\n`!edit make sky golden`",
          event.threadID,
          event.messageID
        );
      }

      // 📷 Fetch the replied photo
      const imageUrl = event.messageReply.attachments[0].url;
      const imageBuffer = (await axios.get(imageUrl, { responseType: "arraybuffer" })).data;
      const tempInput = path.join(__dirname, "cache", `input_${Date.now()}.png`);
      fs.writeFileSync(tempInput, imageBuffer);

      // 🧠 Call OpenAI Image Edit API
      const openaiKey = process.env.OPENAI_API_KEY;
      if (!openaiKey) {
        return api.sendMessage("❌ OpenAI API key not configured!", event.threadID);
      }

      const formData = new FormData();
      formData.append("image", fs.createReadStream(tempInput));
      formData.append("prompt", prompt);
      formData.append("size", "1024x1024");

      // (Optional) add Mask if user wants specific region
      // formData.append("mask", fs.createReadStream(maskPath));

      const res = await axios.post(
        "https://api.openai.com/v1/images/edits",
        formData,
        {
          headers: {
            Authorization: `Bearer ${openaiKey}`,
            ...formData.getHeaders(),
          },
        }
      );

      // 🖼️ Download returned image
      const resultUrl = res.data.data[0].url;
      const finalImg = (await axios.get(resultUrl, { responseType: "arraybuffer" })).data;
      const tempOut = path.join(__dirname, "cache", `output_${Date.now()}.png`);
      fs.writeFileSync(tempOut, finalImg);

      // 📤 Send the edited image
      api.sendMessage(
        {
          body: `✨ Edited by AI\n🧠 Prompt: ${prompt}`,
          attachment: fs.createReadStream(tempOut),
        },
        event.threadID,
        () => {
          // cleanup temp files
          fs.unlinkSync(tempInput);
          fs.unlinkSync(tempOut);
        },
        event.messageID
      );

    } catch (err) {
      console.error(err);
      api.sendMessage("❌ Failed to edit image with AI.", event.threadID, event.messageID);
    }
  },
};
