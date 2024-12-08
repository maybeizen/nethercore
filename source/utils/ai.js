// Copyright 2024 Nether Host. All rights reserved.
// Unauthorized use, modification, or distribution of this code is prohibited.

const handleError = require("./handle-error.js");
const JSON5 = require("json5");
const fs = require("fs");
const OpenAI = require("openai");
const openai = new OpenAI({
  apiKey: process.env.openai_key,
});
const systemPrompt = fs.readFileSync("source/config/ai/prompt.txt", "utf-8");
const infoDB = fs.readFileSync("source/config/ai/info.db.txt", "utf-8");
const translatePrompt = fs.readFileSync(
  "source/config/ai/translate.txt",
  "utf-8"
);
const { exec } = require("child_process");
const path = require("path");

async function generateAiResponse(prompt, language, context = "") {
  try {
    const goExePath = path.join(__dirname, "ai", "main");

    const escapedPrompt = JSON.stringify(prompt);
    const escapedLanguage = JSON.stringify(language);
    const escapedContext = JSON.stringify(context);

    return new Promise((resolve, reject) => {
      exec(
        `${goExePath} ${escapedPrompt} ${escapedLanguage} ${escapedContext}`,
        { maxBuffer: 1024 * 1024 },
        (error, stdout, stderr) => {
          if (error) {
            console.error(`Go execution error: ${error}`);
            return fallbackToOpenAI(prompt, language, context)
              .then(resolve)
              .catch(reject);
          }
          if (stderr) {
            console.warn(`Go stderr: ${stderr}`);
          }
          try {
            resolve({ content: stdout.trim() });
          } catch (e) {
            console.error(`Error parsing Go output: ${e}`);
            fallbackToOpenAI(prompt, language, context)
              .then(resolve)
              .catch(reject);
          }
        }
      );
    });
  } catch (error) {
    handleError(error);
    return fallbackToOpenAI(prompt, language, context);
  }
}

async function fallbackToOpenAI(prompt, language, context = "") {
  try {
    const data = [
      {
        role: "system",
        content: `# System Prompt:\n${systemPrompt}\n\n# Info DB:\n${infoDB}`,
      },
      {
        role: "user",
        content: `Below is a rough representation of your past messages with the user you are chatting to:\n${context}\n\nAnalyze the prompt provided and provide a response in ${language}. (Prioritize this language), (If the language is Hindi, respond in romanized Hindi). \n\n${prompt}`,
      },
    ];

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: data,
      max_tokens: 512,
    });

    return response.choices[0].message;
  } catch (error) {
    handleError(error);
    return {
      content:
        "Failed to generate a response from OpenAI. Please try again later.",
    };
  }
}

async function translate(text, language) {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: translatePrompt,
        },
        {
          role: "user",
          content: `Translate the following text into ${language}: ${text}`,
        },
      ],
      max_tokens: 512,
    });
    return response.choices[0].message.content.trim().replace(/"/g, "");
  } catch (error) {
    handleError(error);
    return "Failed to generate a response from OpenAI. Please try again later.";
  }
}

module.exports = {
  generateAiResponse,
  translate,
};
