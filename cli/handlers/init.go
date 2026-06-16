package handlers

import (
	"encoding/json"
	"log"
	"os"
	"taskish/lib"
)

type InitConfig struct {
	ForceOverride bool
}

func HandleInit(initConfig InitConfig) {
	configDir := lib.GetConfigDir()
	if _, err := os.Stat(configDir); err == nil && !initConfig.ForceOverride {
		answer := lib.Prompt("Config file already exists. Do you wish to override it? [y/N] ")
		if answer != "y" {
			os.Exit(0)
		}
	}

	apiUrl := lib.Prompt("Enter API URL: ")
	authToken := lib.Prompt("Enter auth token: ")
	config := &lib.Config{
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
