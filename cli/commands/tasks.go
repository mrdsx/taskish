package commands

import (
	"fmt"
	"log"
	"strconv"
	"strings"
	"taskish/handlers"
	"taskish/lib"

	"github.com/spf13/cobra"
)

var titleFlag string
var subTasksFlag []string
var clearSubTasksFlag bool

func init() {
	setTaskByIdCmd.Flags().StringVarP(&titleFlag, "title", "t", "", "Set task title")
	setTaskByIdCmd.Flags().StringSliceVar(&subTasksFlag, "sub-tasks", []string{}, "Set sub-tasks")
	setTaskByIdCmd.Flags().BoolVar(&clearSubTasksFlag, "clear-sub-tasks", false, "Clear sub-tasks")
}

var TasksCmd = &cobra.Command{
	Use:   "tasks [...taskId]",
	Short: "Manage tasks",
	Args:  cobra.MaximumNArgs(1),
	Run: func(cmd *cobra.Command, args []string) {
		if len(args) == 0 {
			handlers.HandleGetAllTasks()
		} else {
			taskId, err := strconv.Atoi(args[0])
			if err != nil {
				log.Fatalf("Invalid argument %q: must be a valid integer", args[0])
			}

			handlers.HandleGetTaskById(taskId)
		}
	},
}

var addTaskCmd = &cobra.Command{
	Use:   "add [title] [subTasks]",
	Short: "Create task",
	Args:  cobra.RangeArgs(1, 2),
	Example: fmt.Sprintf(`  %s tasks add task
 %s tasks add task "step 1,hands up, step 2, thumbs up"`, lib.AppName, lib.AppName),
	Run: func(cmd *cobra.Command, args []string) {
		title := args[0]
		subTasks := []string{}
		if len(args) == 2 {
			subTasks = strings.Split(args[1], ",")
			for index, task := range subTasks {
				subTasks[index] = strings.TrimSpace(task)
			}
		}

		handlers.HandleAddTask(title, subTasks)
	},
}

var setTaskByIdCmd = &cobra.Command{
	Use:   "set [taskId]",
	Short: "Update task",
	Args:  cobra.ExactArgs(1),
	Run: func(cmd *cobra.Command, args []string) {
		taskId, err := strconv.Atoi(args[0])
		if err != nil {
			panic(err)
		}

		title := strings.TrimSpace(titleFlag)
		subTasks := []string{}
		for _, task := range subTasksFlag {
			task = strings.TrimSpace(task)
			if len(task) > 0 {
				subTasks = append(subTasks, task)
			}
		}

		if len(subTasksFlag) > 0 && clearSubTasksFlag {
			log.Fatalln("Invalid flags: --sub-tasks and --clear-sub-tasks cannot be used together")
		}

		handlers.HandleSetTaskById(taskId, title, subTasks, clearSubTasksFlag)
	},
}

var deleteTaskByIdCmd = &cobra.Command{
	Use:     "del [...taskId]",
	Short:   "Delete one or multiple tasks by ID",
	Aliases: []string{"delete"},
	Args:    cobra.MinimumNArgs(1),
	Run: func(cmd *cobra.Command, args []string) {
		ids := []int{}
		for _, arg := range args {
			taskId, err := strconv.Atoi(arg)
			if err != nil {
				log.Fatalf("Invalid argument %q: must be a valid integer", arg)
			}
			ids = append(ids, taskId)
		}

		handlers.HandleDeleteTasksById(ids)
	},
}

func InitializeTasksCmd() {
	TasksCmd.AddCommand(addTaskCmd, setTaskByIdCmd, deleteTaskByIdCmd)
}
