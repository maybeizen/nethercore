// Copyright 2024 Nether Host. All rights reserved.
// Unauthorized use, modification, or distribution of this code is prohibited.

const JSON5 = require("json5");
const fs = require("fs");
const config = JSON5.parse(
  fs.readFileSync("source/config/general.json5", "utf-8")
);
const axios = require("axios");
const handleError = require("./handle-error.js");

const javaApiUrl = "https://api.mcsrvstat.us/3";
const bedrockApiUrl = "https://api.mcsrvstat.us/bedrock/3";

async function getServerStatus(ip, type) {
  try {
    if (type === "java") {
      const res = await axios.get(`${javaApiUrl}/${ip}`);
      return res.data;
    } else if (type === "bedrock") {
      const res = await axios.get(`${bedrockApiUrl}/${ip}`);
      return res.data;
    }
  } catch (error) {
    handleError(error);
  }
}

module.exports = { getServerStatus };
