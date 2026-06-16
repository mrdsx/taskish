package handlers

import (
	"encoding/json"
	"fmt"
	"log"
	"slices"
	"strconv"
	"strings"
	"sync"
	"taskish/lib"
)

type DeletedTask struct {
	Task
	// iso 8601 date
	ExpiresAt string `json:"expiresAt" validate:"required,datetime=2006-01-02T15:04:05"`
}

func (t DeletedTask) Validate() error {
	return lib.Validate.Struct(t)
}

// TODO: add human-readable label "expires in ..." to each task
func HandleGetTrash() {
	res, err := lib.FetchApi(lib.FetchConfig{Method: "GET", Path: "/trash"})
	if err != nil {
		fmt.Println(err)
		return
	}
	defer res.Body.Close()

	var tasks []DeletedTask
	json.NewDecoder(res.Body).Decode(&tasks)
	for _, task := range tasks {
		if err = task.Validate(); err != nil {
			log.Fatalf("Response body validation failed:\n%v", err)
		}
	}

	taskStrings := []string{}
	for index, task := range tasks {
		taskString := getTaskString(index, task.Task)
		taskStrings = append(taskStrings, taskString)
	}
	fmt.Println(strings.Join(taskStrings, "\n\n"))
}

func HandleRestoreTasksById(ids []int) {
	res, err := lib.FetchApi(lib.FetchConfig{Method: "GET", Path: "/trash"})
	if err != nil {
		fmt.Println(err)
		return
	}
	defer res.Body.Close()

	var tasks []DeletedTask
	json.NewDecoder(res.Body).Decode(&tasks)
	for _, task := range tasks {
		if err = task.Validate(); err != nil {
			log.Fatalf("Response body validation failed:\n%v", err)
		}
	}

	taskStrings := []string{}
	taskIds := []int{}
	temp_idx := 0
	for _, task := range tasks {
		if slices.Contains(ids, task.Id) {
			temp_idx += 1
			str := fmt.Sprintf("  %d. %s (%d)", temp_idx, task.Title, task.Id)
			taskStrings = append(taskStrings, str)
			taskIds = append(taskIds, task.Id)
		}
	}

	if len(taskStrings) == 0 {
		fmt.Println("No tasks with specified IDs found")
		return
	}

	fmt.Println("You're about to restore the following tasks:")
	fmt.Println(strings.Join(taskStrings, "\n"))
	answer := lib.Prompt("Do you confirm? [y/N] ")
	if answer != "y" {
		return
	}

	var wg sync.WaitGroup
	for _, taskId := range taskIds {
		wg.Add(1)
		go handleRestoreTaskById(taskId, &wg)
	}
	wg.Wait()
}

func handleRestoreTaskById(id int, wg *sync.WaitGroup) {
	defer wg.Done()

	res, err := lib.FetchApi(lib.FetchConfig{Method: "POST", Path: "/trash/" + strconv.Itoa(id)})
	if err != nil {
		fmt.Println(err)
		return
	}
	defer res.Body.Close()
	fmt.Printf("Restored task with id %d\n", id)
}
