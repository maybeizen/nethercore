// Copyright 2024 Nether Host. All rights reserved.
// Unauthorized use, modification, or distribution of this code is prohibited.

const {
  ActionRowBuilder,
  EmbedBuilder,
  ButtonBuilder,
  ButtonStyle,
} = require("discord.js");
const User = require("../../models/User.js");
const handleError = require("../../utils/handle-error.js");
const color = require("chalk");
const embed = require("../../config/embed.config.js");
const JSON5 = require("json5");
const fs = require("fs");
const config = JSON5.parse(
  fs.readFileSync("source/config/general.json5", "utf-8"),
);
const { loadMessages } = require("../language.js");

async function closeTicket(interaction, client, channel) {
  try {
    const users = await User.find();

    const user = users.find((user) =>
      user.tickets.some((ticket) => ticket.id === channel.id),
    );

    if (!user) {
      return await interaction.reply(
        "400 Bad Request. Please try again later.",
      );
    }

    const language = user.language.value;
    const messages = loadMessages(language);

    const ticketData = user.tickets.find((ticket) => ticket.id === channel.id);

    if (!ticketData) {
      return await interaction.reply(
        "400 Bad Request. Please try again later.",
      );
    }

    if (ticketData.status === "closed" || ticketData.status === "deleted") {
      return await interaction.reply({
        content: messages.ticketAlreadyClosedError,
        ephemeral: true,
      });
    }

    await interaction.channel.permissionOverwrites.edit(ticketData.user.id, {
      SendMessages: false,
      AddReactions: false,
    });

    ticketData.status = "closed";
    ticketData.closed.closedBy = interaction.user.id;
    ticketData.closed.closedAt = Date.now();
    user.markModified("tickets");
    await user.save();

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setLabel(" ")
        .setCustomId("delete-ticket")
        .setStyle(ButtonStyle.Danger)
        .setEmoji("1289589546153017405"),

      new ButtonBuilder()
        .setLabel(" ")
        .setCustomId("get-transcript")
        .setStyle(ButtonStyle.Secondary)
        .setEmoji("1289589545121091614"),

      new ButtonBuilder()
        .setLabel(" ")
        .setCustomId("unlock-ticket")
        .setStyle(ButtonStyle.Secondary)
        .setEmoji("1289589547541205032"),
    );

    await interaction.reply({
      embeds: [
        new EmbedBuilder()
          .setTitle(messages.ticketClosedTitle)
          .setDescription(messages.ticketClosedDescription)
          .setColor(config.general.botColor)
          .addFields(
            {
              name: messages.ticketClosedFields.field1.name,
              value: messages.ticketClosedFields.field1.value,
              inline: true,
            },
            {
              name: messages.ticketClosedFields.field2.name,
              value: messages.ticketClosedFields.field2.value,
              inline: true,
            },
            {
              name: messages.ticketClosedFields.field3.name,
              value: messages.ticketClosedFields.field3.value,
              inline: true,
            },
            {
              name: messages.ticketClosedFields.field4.name,
              value: messages.ticketClosedFields.field4.value.replace(
                "{ticket_closedBy}",
                `<@${ticketData.closed.closedBy}>`,
              ),
              inline: true,
            },
          )
          .setFooter({
            text: "Nether Host | nether.host",
            iconURL: client.user.displayAvatarURL({ dynamic: true }),
          }),
      ],
      components: [row],
    });
  } catch (error) {
    handleError(error);
    await interaction.reply({
      embeds: [embed.error(error)],
    });
  }
}

module.exports = { closeTicket };
