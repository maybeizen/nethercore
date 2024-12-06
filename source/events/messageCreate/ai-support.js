// Copyright 2024 Nether Host. All rights reserved.
// Unauthorized use, modification, or distribution of this code is prohibited.

const { EmbedBuilder } = require("discord.js");
const { generateAiResponse } = require("../../utils/ai.js");
const JSON5 = require("json5");
const fs = require("fs");
const config = JSON5.parse(
  fs.readFileSync("source/config/general.json5", "utf-8")
);
const User = require("../../models/User.js");
const handleError = require("../../utils/handle-error.js");
const {
  addMessageToMemory,
  getConversationContext,
} = require("../../utils/memory.js");

module.exports = async (client, message) => {
  if (message.author.bot) return;
  if (message.channel.id !== config.channels.aiSupportChannelId) return;
  if (message.channel.type !== 0) return;

  try {
    const user = await User.findOne({ "user.id": message.author.id });
    if (!user) return;

    await message.channel.sendTyping();

    const language = user.language.value;

    const contextMessages = getConversationContext(message.author, 5);
    const context = contextMessages
      .map((msg) => `${msg.sent_by}: ${msg.content}`)
      .join("\n");

    const response = await generateAiResponse(
      message.content,
      language,
      context
    );

    await message.reply(response.content);

    addMessageToMemory(message.author, "user", message.content);
    addMessageToMemory(message.author, "bot", response.content);
  } catch (error) {
    handleError(error);
  }
};

function requiresResponse(response) {
  return response.includes("No response required");
}
