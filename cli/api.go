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
	if err != nil {
		return nil, errors.New("Failed to get response")
	} else if res.StatusCode == 401 {
		return nil, errors.New("Unauthenticated")
	} else if res.StatusCode == 404 {
		return nil, errors.New("Resource not found")
	} else if res.StatusCode == 500 {
		return nil, errors.New("Internal server error")
	} else if res.StatusCode >= 400 && res.StatusCode <= 599 {
		return nil, errors.New("Unhandled error")
	}

	return res, nil
}
