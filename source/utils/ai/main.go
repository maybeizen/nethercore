package main

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io/ioutil"
	"log"
	"net/http"
	"os"
	"path/filepath"
)

type OpenAIResponse struct {
	Choices []struct {
		Message struct {
			Content string `json:"content"`
		} `json:"message"`
	} `json:"choices"`
}

func generateAIResponse(prompt, language, context string) (string, error) {
	// Get the absolute path to the project root (3 levels up from the current file)
	execPath, err := os.Executable()
	if err != nil {
		return "", fmt.Errorf("failed to get executable path: %v", err)
	}
	
	// Navigate to the project root from the executable location
	projectRoot := filepath.Join(filepath.Dir(execPath), "..", "..", "..")
	
	// Read the config files using absolute paths
	promptPath := filepath.Join(projectRoot, "source", "config", "ai", "prompt.txt")
	infoDBPath := filepath.Join(projectRoot, "source", "config", "ai", "info.db.txt")
	
	systemPrompt, err := ioutil.ReadFile(promptPath)
	if err != nil {
		log.Printf("Failed to read file %s: %v", promptPath, err)
		return "", err
	}

	infoDB, err := ioutil.ReadFile(infoDBPath)
	if err != nil {
		log.Printf("Failed to read file %s: %v", infoDBPath, err)
		return "", err
	}

	apiKey := os.Getenv("openai_key")
	if apiKey == "" {
		return "", fmt.Errorf("OpenAI API key not found in environment")
	}

	url := "https://api.openai.com/v1/chat/completions"
	
	// Prepare the request payload
	payload := map[string]interface{}{
		"model": "gpt-4o-mini",
		"messages": []map[string]string{
			{
				"role":    "system",
				"content": fmt.Sprintf("# System Prompt:\n%s\n\n# Info DB:\n%s", string(systemPrompt), string(infoDB)),
			},
			{
				"role": "user",
				"content": fmt.Sprintf("Below is a rough representation of your past messages with the user you are chatting to:\n%s\n\nAnalyze the prompt provided and provide a response in %s. (Prioritize this language), (If the language is Hindi, respond in romanized Hindi). \n\n%s", context, language, prompt),
			},
		},
		"max_tokens": 512,
	}

	jsonData, err := json.Marshal(payload)
	if err != nil {
		return "", fmt.Errorf("failed to marshal JSON: %v", err)
	}

	// Create the HTTP request
	req, err := http.NewRequest("POST", url, bytes.NewBuffer(jsonData))
	if err != nil {
		return "", fmt.Errorf("failed to create request: %v", err)
	}

	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", "Bearer "+apiKey)

	// Send the request
	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		return "", fmt.Errorf("failed to send request: %v", err)
	}
	defer resp.Body.Close()

	// Read the response
	body, err := ioutil.ReadAll(resp.Body)
	if err != nil {
		return "", fmt.Errorf("failed to read response: %v", err)
	}

	// Parse the response
	var response OpenAIResponse
	if err := json.Unmarshal(body, &response); err != nil {
		return "", fmt.Errorf("failed to parse response: %v", err)
	}

	if len(response.Choices) == 0 {
		return "", fmt.Errorf("no response choices returned")
	}

	return response.Choices[0].Message.Content, nil
}

func main() {
	if len(os.Args) != 4 {
		log.Fatal("Usage: main <prompt> <language> <context>")
	}

	prompt := os.Args[1]
	language := os.Args[2]
	context := os.Args[3]

	response, err := generateAIResponse(prompt, language, context)
	if err != nil {
		log.Printf("Error generating AI response: %s", err)
		os.Exit(1)
	}

	fmt.Print(response)
}
