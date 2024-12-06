// Copyright 2024 Nether Host. All rights reserved.
// Unauthorized use, modification, or distribution of this code is prohibited.

const color = require("chalk");

function handleError(error) {
  console.log(color.red("[ERROR] ") + color.white(error.message));
  console.log(color.red("[ERROR] ") + color.gray(error.stack));
}

module.exports = handleError;
