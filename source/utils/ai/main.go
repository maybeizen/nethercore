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
    apiKey := os.Getenv("openai_key")
    url := "https://api.openai.com/v1/chat/completions"

    projectRoot := filepath.Join("..", "..", "..")
    
    promptFile := filepath.Join(projectRoot, "source", "config", "ai", "prompt.txt")
    infoFile := filepath.Join(projectRoot, "source", "config", "ai", "info.db.txt")

    data := map[string]interface{}{
        "model": "gpt-4o-mini",
        "messages": []map[string]string{
            {
                "role": "system",
                "content": fmt.Sprintf("# System Prompt:\n%s\n\n# Info DB:\n%s", readFile(promptFile), readFile(infoFile)),
            },
            {
                "role": "user",
                "content": fmt.Sprintf("Below is a rough representation of your past messages with the user you are chatting to:\n%s\n\nAnalyze the prompt provided and provide a response in %s. (Prioritize this language), (If the language is Hindi, respond in romanized Hindi). \n\n%s", context, language, prompt),
            },
        },
        "max_tokens": 512,
    }

    jsonData, _ := json.Marshal(data)

    req, err := http.NewRequest("POST", url, bytes.NewReader(jsonData))
    if err != nil {
        return "", err
    }
    req.Header.Set("Authorization", "Bearer "+apiKey)
    req.Header.Set("Content-Type", "application/json")

    client := &http.Client{}
    resp, err := client.Do(req)
    if err != nil {
        return "", err
    }
    defer resp.Body.Close()

    var response OpenAIResponse
    if err := json.NewDecoder(resp.Body).Decode(&response); err != nil {
        return "", err
    }

    return response.Choices[0].Message.Content, nil
}

func readFile(filePath string) string {
    content, err := ioutil.ReadFile(filePath)
    if err != nil {
        log.Printf("Failed to read file %s: %v", filePath, err)
        return "" 
    }
    return string(content)
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
