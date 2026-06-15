package main

import (
	"encoding/json"
	"log"
	"os"
)

type InitConfig struct {
	forceOverride bool
}

func HandleInit(initConfig InitConfig) {
	configDir := GetConfigDir()
	if _, err := os.Stat(configDir); err == nil && !initConfig.forceOverride {
		res := Prompt("Config file already exists. Do you wish to override it? [y/N] ")
		if res != "y" {
			os.Exit(0)
		}
	}

	apiUrl := Prompt("Enter API URL: ")
	authToken := Prompt("Enter auth token: ")
	config := &Config{
		ApiUrl:    apiUrl,
		AuthToken: authToken,
	}

	configFile, err := os.Create(configDir)
	if err != nil {
		log.Fatalln("Failed to open config file.")
	}
	defer configFile.Close()

	encoder := json.NewEncoder(configFile)
	encoder.SetIndent("", "  ")
	err = encoder.Encode(config)
	if err != nil {
		log.Fatalln("Failed to encode data.")
	}
}
