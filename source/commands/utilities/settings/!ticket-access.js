// Copyright 2024 Nether Host. All rights reserved.
// Unauthorized use, modification, or distribution of this code is prohibited.

const { getSettings } = require("../../../utils/settings.js");
const handleError = require("../../../utils/handle-error.js");

async function ticketAccess(interaction, value) {
  try {
    const settings = await getSettings(interaction);

    settings.tickets.access = value;
    settings.markModified("tickets.access");
    await settings.save();
  } catch (error) {
    handleError(error, interaction);
  }
}

module.exports = { ticketAccess };
