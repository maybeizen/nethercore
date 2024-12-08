const { updateLeftAt } = require("../../utils/leave-server");
const handleError = require("../../utils/handle-error");
const color = require("chalk");

module.exports = async (client, user) => {
  try {
    await updateLeftAt(user);
  } catch (error) {
    handleError(error);
  }
};
