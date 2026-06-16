package lib

import (
	"encoding/json"
	"errors"
	"fmt"
	"log"
	"os"
	"path/filepath"
)

type Config struct {
	ApiUrl    string `json:"apiUrl"    validate:"required,origin"`
	AuthToken string `json:"authToken" validate:"required"`
}

func (c Config) Validate() error {
	return Validate.Struct(c)
}

func GetConfigDir() string {
	home, err := os.UserHomeDir()
	if err != nil {
		log.Fatalln("Failed to detect home dir.")
	}

	return filepath.Join(home, ".config", "taskish.json")
}

func GetConfig() Config {
	configDir := GetConfigDir()
	if _, err := os.Stat(configDir); errors.Is(err, os.ErrNotExist) {
		answer := Prompt("Config is not set. Do you wish to initialize it? [y/N] ")
		if answer == "y" {
			fmt.Println("Run `taskish init` command to initialize config")
		}
		os.Exit(0)
	}

	configFile, err := os.Open(configDir)
	if err != nil {
		log.Fatalf("Config read failed: %v", err)
	}
	defer configFile.Close()

	var config Config
	err = json.NewDecoder(configFile).Decode(&config)
	for err != nil {
		log.Fatalf("Config decodek failed:\n%v", err)
	}

	if err = config.Validate(); err != nil {
		log.Fatalf("Config validation failed:\n%v", err)
	}

	return config
}
