package main

import (
	"fmt"
	"taskish/commands"
	"taskish/lib"

	"github.com/spf13/cobra"
)

func main() {
	rootCmd := &cobra.Command{
		Use:   lib.AppName,
		Short: fmt.Sprintf("A CLI client for %s API.", lib.AppName),
	}
	rootCmd.AddCommand(commands.InitCmd, commands.TasksCmd, commands.TrashCmd)
	commands.InitializeTasksCmd()
	commands.InitializeTrashCmd()

	if err := rootCmd.Execute(); err != nil {
		panic(err)
	}
}
