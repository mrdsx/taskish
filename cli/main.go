package main

import (
	"log"
	"strconv"

	"github.com/spf13/cobra"
)

func main() {
	rootCmd := &cobra.Command{
		Use:   "taskish",
		Short: "A CLI client for Taskish API.",
	}

	initcmd := &cobra.Command{
		Use:   "init",
		Short: "Initialize config for using CLI client",
		Run: func(cmd *cobra.Command, args []string) {
			HandleInit(InitConfig{})
		},
	}

	tasksCmd := &cobra.Command{
		Use:   "tasks [command]",
		Short: "Manage tasks",
	}

	getTasksCmd := &cobra.Command{
		Use:     "ls",
		Short:   "Get all tasks",
		Aliases: []string{"list"},
		Run: func(cmd *cobra.Command, args []string) {
			HandleGetAllTasks()
		},
	}

	getTaskByIdCmd := &cobra.Command{
		Use:   "get [id]",
		Short: "Get task by ID",
		Args:  cobra.ExactArgs(1),
		Run: func(cmd *cobra.Command, args []string) {
			taskId, err := strconv.Atoi(args[0])
			if err != nil {
				log.Fatalf("invalid argument %q: must be a valid integer", args[0])
			}

			HandleGetTaskById(taskId)
		},
	}

	deleteTaskByIdCmd := &cobra.Command{
		Use:     "del [ids]",
		Short:   "Delete task by ID",
		Aliases: []string{"delete"},
		Args:    cobra.MinimumNArgs(1),
		Run: func(cmd *cobra.Command, args []string) {
			ids := []int{}
			for _, arg := range args {
				taskId, err := strconv.Atoi(arg)
				if err != nil {
					log.Fatalf("invalid argument %q: must be a valid integer", arg)
				}
				ids = append(ids, taskId)
			}

			HandleDeleteTasksById(ids)
		},
	}

	rootCmd.AddCommand(initcmd, tasksCmd)
	tasksCmd.AddCommand(getTasksCmd, getTaskByIdCmd, deleteTaskByIdCmd)

	if err := rootCmd.Execute(); err != nil {
		panic(err)
	}
}
