package lib

import (
	"bytes"
	"errors"
	"net/http"
	"time"
)

type FetchConfig struct {
	Method      string
	Path        string
	Body        []byte
	ContentType string
	Overrides   Overrides
}

type Overrides struct {
	NotFound string
}

var client *http.Client = &http.Client{Timeout: 10 * time.Second}

func FetchApi(fetchConfig FetchConfig) (*http.Response, error) {
	config := GetConfig()

	req, _ := http.NewRequest(
		fetchConfig.Method,
		config.ApiUrl+"/api"+fetchConfig.Path,
		bytes.NewBuffer(fetchConfig.Body),
	)
	req.Header.Set(AuthTokenHeader, config.AuthToken)
	req.Header.Set("Content-Type", fetchConfig.ContentType)
	res, err := client.Do(req)
	if err != nil {
		return nil, errors.New("Failed to get response")
	} else if res.StatusCode == 401 {
		return nil, errors.New("Unauthenticated")
	} else if res.StatusCode == 404 {
		if fetchConfig.Overrides.NotFound == "" {
			fetchConfig.Overrides.NotFound = "Resource not found"
		}
		return nil, errors.New(fetchConfig.Overrides.NotFound)
	} else if res.StatusCode == 422 {
		return nil, errors.New("Invalid request body")
	} else if res.StatusCode == 500 {
		return nil, errors.New("Internal server error")
	} else if res.StatusCode >= 400 && res.StatusCode <= 599 {
		return nil, errors.New("Unhandled error")
	}

	return res, nil
}
