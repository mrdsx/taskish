package main

import (
	"encoding/json"
	"fmt"
	"log"
	"strconv"
	"strings"
)

func HandleGetTrash() {
	res, err := FetchApi("GET", "/trash")
	if err != nil {
		fmt.Println(err)
		return
	}
	defer res.Body.Close()

	var tasks []Task
	json.NewDecoder(res.Body).Decode(&tasks)
	for _, task := range tasks {
		if err = task.Validate(); err != nil {
			log.Fatalf("Response body validation failed:\n%v", err)
		}
	}

	taskStrings := []string{}
	for index, task := range tasks {
		taskString := getTaskString(index, task)
		taskStrings = append(taskStrings, taskString)
	}
	fmt.Println(strings.Join(taskStrings, "\n\n"))
}

func HandleRestoreTask(id int) {
	res, err := FetchApi("POST", "/trash/"+strconv.Itoa(id))
	if err != nil {
		fmt.Println(err)
		return
	}
	defer res.Body.Close()
	fmt.Printf("Restored task with id %d\n", id)
}
