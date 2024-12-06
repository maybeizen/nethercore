// Copyright 2024 Nether Host. All rights reserved.
// Unauthorized use, modification, or distribution of this code is prohibited.

const { closeTicket } = require("../../utils/tickets/close-ticket.js");
const handleError = require("../../utils/handle-error.js");
const JSON5 = require("json5");
const fs = require("fs");
const config = JSON5.parse(
  fs.readFileSync("source/config/general.json5", "utf-8")
);

module.exports = async (client, interaction) => {
  if (!interaction.isButton() || interaction.customId !== "close-ticket")
    return;

  try {
    await closeTicket(interaction, client, interaction.channel);
  } catch (error) {
    handleError(error);
  }
};
