package main

import (
	"encoding/json"
	"fmt"
	"net/http"
	"strconv"
	"strings"
	"sync"
	"time"
)

type Task struct {
	Id       int      `json:"id"`
	Title    string   `json:"title"`
	SubTasks []string `json:"subTasks"`
}

var client *http.Client = &http.Client{Timeout: 10 * time.Second}

func getTaskString(index int, task Task) string {
	taskString := fmt.Sprintf("%d. %s (%d)", index+1, task.Title, task.Id)
	if index < 0 {
		taskString = fmt.Sprintf("%s (%d)", task.Title, task.Id)
	}
	subTasks := strings.Join(task.SubTasks, "\n  ")
	if len(subTasks) > 0 {
		taskString += fmt.Sprintf("\n  %s", subTasks)
	}

	return taskString
}

func HandleGetAllTasks() {
	res, err := FetchApi("GET", "/tasks")
	if err != nil {
		fmt.Println(err)
		return
	}
	defer res.Body.Close()

	var tasks []Task
	json.NewDecoder(res.Body).Decode(&tasks)
	taskStrings := []string{}
	for index, task := range tasks {
		taskString := getTaskString(index, task)
		taskStrings = append(taskStrings, taskString)
	}
	fmt.Println(strings.Join(taskStrings, "\n\n"))
}

func HandleGetTaskById(id int) {
	res, err := FetchApi("GET", "/tasks/"+strconv.Itoa(id))
	if err != nil {
		fmt.Println(err)
		return
	}
	defer res.Body.Close()

	var task Task
	json.NewDecoder(res.Body).Decode(&task)
	fmt.Println(getTaskString(-1, task))
}

func HandleDeleteTasksById(ids []int) {
	var wg sync.WaitGroup
	for _, id := range ids {
		wg.Add(1)
		go HandleDeleteTaskById(id, &wg)
	}
	wg.Wait()
}

func HandleDeleteTaskById(id int, wg *sync.WaitGroup) {
	defer wg.Done()

	res, err := FetchApi("DELETE", "/tasks/"+strconv.Itoa(id))
	if err != nil {
		fmt.Println(err)
		return
	}
	defer res.Body.Close()
	fmt.Printf("Deleted task with id %d\n", id)
}
