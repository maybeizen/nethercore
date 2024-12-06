const { openTicket } = require("../../utils/tickets/open-ticket.js");
const handleError = require("../../utils/handle-error.js");
const JSON5 = require("json5");
const fs = require("fs");
const config = JSON5.parse(
  fs.readFileSync("source/config/general.json5", "utf-8")
);

module.exports = async (client, interaction) => {
  if (!interaction.isButton() || interaction.customId !== "open-ticket") return;

  try {
    await openTicket(interaction, client, interaction.user);
  } catch (error) {
    handleError(error);
  }
};
