package main

import (
	"encoding/json"
	"errors"
	"log"
	"os"
	"path/filepath"

	"github.com/go-playground/validator/v10"
)

type Config struct {
	ApiUrl    string `json:"apiUrl"    validate:"required,origin"`
	AuthToken string `json:"authToken" validate:"required"`
}

func (c Config) Validate() error {
	validate := validator.New()
	return validate.Struct(c)
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
		res := Prompt("Config is not set. Do you wish to initialize it? [y/N] ")
		if res == "y" {
			HandleInit(InitConfig{forceOverride: true})
		} else {
			os.Exit(0)
		}
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

	err = config.Validate()
	if err != nil {
		log.Fatalf("Config validation failed:\n%v", err)
	}

	return config
}
