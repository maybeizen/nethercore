const {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} = require("discord.js");
const path = require("path");
const fs = require("fs");
const handleError = require("../handle-error.js");
const JSON5 = require("json5");
const config = JSON5.parse(
  fs.readFileSync("source/config/general.json5", "utf-8")
);
const { loadMessages } = require("../language.js");

async function saveTranscript(content, channel, languageCode) {
  const transcriptDir = path.resolve("./transcripts");
  await fs.promises.mkdir(transcriptDir, { recursive: true });
  const filePath = path.join(
    transcriptDir,
    `${channel.name}-${channel.id}.txt`
  );

  await fs.promises.writeFile(filePath, content);
  return filePath;
}

async function fetchMessages(channel) {
  let messages = [];
  let lastMessageId;

  while (true) {
    const fetchedMessages = await channel.messages.fetch({
      limit: 100,
      before: lastMessageId,
    });

    if (fetchedMessages.size === 0) break;

    messages.push(...fetchedMessages.values());
    lastMessageId = fetchedMessages.last().id;
  }

  return messages;
}

function formatMessages(messages) {
  let lastDate = "";

  return messages.reverse().reduce((transcript, msg) => {
    if (msg.author.bot) return transcript;

    const messageDate = new Date(msg.createdAt);
    const currentDate = messageDate.toLocaleDateString("en-US", {
      timeZone: "America/New_York",
      month: "2-digit",
      day: "2-digit",
      year: "numeric",
    });

    if (currentDate !== lastDate) {
      transcript += `\n=== ${currentDate} ===\n`;
      lastDate = currentDate;
    }

    const time = messageDate.toLocaleTimeString("en-US", {
      timeZone: "America/New_York",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });

    const attachments = msg.attachments.map((att) => att.url).join("\n");

    transcript += `[${time}] ${msg.author.username}: ${msg.content}\n${
      attachments ? attachments + "\n" : ""
    }`;

    return transcript;
  }, "");
}

async function sendTranscript(user, transcript, client, languageCode) {
  try {
    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setLabel(" ")
        .setURL("https://trustpilot.com/evaluate/nether.host")
        .setStyle(ButtonStyle.Link)
        .setEmoji("1289603836360523907")
    );

    const messages = loadMessages(languageCode);

    await user.send({
      embeds: [
        new EmbedBuilder()
          .setTitle(messages.ticketTranscriptUserEmbedTitle)
          .setColor(config.general.botColor)
          .setDescription(messages.ticketTranscriptUserEmbedDesription)
          .setFooter({
            text: "Nether Host | nether.host",
            iconURL: client.user.displayAvatarURL({ dynamic: true }),
          }),
      ],
      files: [transcript],
      components: [row],
    });

    return true;
  } catch (error) {
    handleError(error);
    return false;
  }
}

module.exports = {
  saveTranscript,
  fetchMessages,
  formatMessages,
  sendTranscript,
};
