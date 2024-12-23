// Copyright 2024 Nether Host. All rights reserved.
// Unauthorized use, modification, or distribution of this code is prohibited.

const { isStaff, updateStaffTicketMessages } = require("../../utils/staff.js");
const handleError = require("../../utils/handle-error.js");

module.exports = async (client, message) => {
  try {
    if (
      !isStaff(message.author.id) ||
      !message.channel.name.toLowerCase().includes("ticket-") ||
      message.author.bot
    )
      return;

    await updateStaffTicketMessages(message.author, 1);
  } catch (error) {
    handleError(error);
  }
};
