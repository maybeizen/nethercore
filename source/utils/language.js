// Copyright 2024 Nether Host. All rights reserved.
// Unauthorized use, modification, or distribution of this code is prohibited.

const fs = require("fs");
const JSON5 = require("json5");
const handleError = require("./handle-error.js");

const loadMessages = (language) => {
  try {
    return JSON5.parse(
      fs.readFileSync(`source/config/messages/${language}.json5`, "utf-8")
    );
  } catch (error) {
    handleError(error);
    return {};
  }
};

const languageChoices = {
  "en-US": "English (United States)",
  "en-GB": "English (United Kingdom)",
  "es-ES": "Español",
  ar: "العربية",
  "hi-IN": "Hindi",
  "id-ID": "Bahasa Indonesia",
  "nl-NL": "Nederlands",
  "pt-PT": "Português",
  "zh-CN": "中文",
};

const shortLanguageCodes = {
  "en-US": "en",
  "en-GB": "en",
  "es-ES": "es",
  ar: "ar",
  "hi-IN": "hi",
  "id-ID": "id",
  "nl-NL": "nl",
  "pt-PT": "pt",
  "zh-CN": "zh",
};

module.exports = { loadMessages, languageChoices, shortLanguageCodes };
