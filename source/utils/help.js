// Copyright 2024 Nether Host. All rights reserved.
// Unauthorized use, modification, or distribution of this code is prohibited.

const handleError = require("./handle-error.js");

async function getCommands(client) {
  try {
    const commands = await client.application.commands.fetch();

    const formattedCommands = commands.map((command) => {
      const subcommands =
        command.options?.filter((option) => option.type === 1) || [];

      return {
        name: command.name,
        description: command.description || "No description provided.",
        id: command.id,
        subcommands: subcommands.map((subcommand) => ({
          name: subcommand.name,
          description: subcommand.description || "No description provided.",
          id: subcommand.name,
        })),
      };
    });

    return formattedCommands;
  } catch (error) {
    handleError(error);
  }
}

module.exports = { getCommands };
