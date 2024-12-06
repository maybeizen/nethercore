const User = require("../../models/User.js");
const handleError = require("../../utils/handle-error.js");
const embed = require("../../config/embed.config.js");
const { loadMessages } = require("../language.js");

async function deleteTicket(interaction, channel) {
  try {
    const users = await User.find();

    const user = users.find((user) =>
      user.tickets.some((ticket) => ticket.id === channel.id)
    );

    if (!user) {
      return await interaction.reply(
        "400 Bad Request. Please try again later."
      );
    }

    const language = user.language.value;
    const messages = loadMessages(language);

    const ticketData = user.tickets.find((ticket) => ticket.id === channel.id);

    if (!ticketData) {
      return await interaction.reply(embed.error(messages.ticketClosedError));
    }

    if (ticketData.status === "open") {
      return await interaction.reply({
        content: messages.ticketCannotDeleteOpenError,
        ephemeral: true,
      });
    }

    if (ticketData.status === "deleted") {
      return await interaction.reply({
        content: messages.ticketAlreadyDeletedError,
        ephemeral: true,
      });
    }

    ticketData.status = "deleted";
    user.markModified("tickets");
    await user.save();

    await channel.delete();
  } catch (error) {
    handleError(error);
    await interaction.reply({
      embeds: [embed.error(error)],
    });
  }
}

module.exports = {
  deleteTicket,
};
