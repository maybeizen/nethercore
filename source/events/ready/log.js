const color = require("chalk");

module.exports = (client) => {
  console.log(
    color.green("[INFO] ") + color.white(`${client.user.username} is online`)
  );
};
