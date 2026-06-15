package main

import (
	"errors"
	"net/http"
)

func FetchApi(method string, path string) (*http.Response, error) {
	config := GetConfig()

	req, _ := http.NewRequest(method, config.ApiUrl+path, nil)
	req.Header.Set(AuthTokenHeader, config.AuthToken)
	res, err := client.Do(req)
	// TODO: improve error handling (narrow down specific http codes)
	if err != nil {
		return nil, errors.New("Failed to get response")
	} else if res.StatusCode >= 400 && res.StatusCode <= 499 {
		return nil, errors.New("Client-side error")
	} else if res.StatusCode >= 500 && res.StatusCode <= 599 {
		return nil, errors.New("Server-side error")
	}

	return res, nil
}
