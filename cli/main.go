package main

import (
	"log"
	"strconv"
	"taskish/handlers"

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
			handlers.HandleInit(handlers.InitConfig{})
		},
	}

	tasksCmd := &cobra.Command{
		Use:   "tasks [...taskId]",
		Short: "Manage tasks",
		Args:  cobra.MaximumNArgs(1),
		Run: func(cmd *cobra.Command, args []string) {
			if len(args) == 0 {
				handlers.HandleGetAllTasks()
			} else {
				taskId, err := strconv.Atoi(args[0])
				if err != nil {
					log.Fatalf("invalid argument %q: must be a valid integer", args[0])
				}

				handlers.HandleGetTaskById(taskId)
			}
		},
	}

	deleteTaskByIdCmd := &cobra.Command{
		Use:     "del [...taskId]",
		Short:   "Delete one or multiple tasks by ID",
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

			handlers.HandleDeleteTasksById(ids)
		},
	}

	trashCmd := &cobra.Command{
		Use:   "trash",
		Short: "Get recently deleted tasks",
		Run: func(cmd *cobra.Command, args []string) {
			handlers.HandleGetTrash()
		},
	}

	restoreTaskCmd := &cobra.Command{
		Use:   "restore [taskId]",
		Short: "Restores recently deleted task",
		Args:  cobra.MinimumNArgs(1),
		Run: func(cmd *cobra.Command, args []string) {
			ids := []int{}
			for _, arg := range args {
				taskId, err := strconv.Atoi(arg)
				if err != nil {
					log.Fatalf("invalid argument %q: must be a valid integer", arg)
				}
				ids = append(ids, taskId)
			}

			handlers.HandleRestoreTasksById(ids)
		},
	}

	rootCmd.AddCommand(initcmd, tasksCmd, trashCmd)
	tasksCmd.AddCommand(deleteTaskByIdCmd)
	trashCmd.AddCommand(restoreTaskCmd)

	if err := rootCmd.Execute(); err != nil {
		panic(err)
	}
}
