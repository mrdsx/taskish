package lib

import (
	"bufio"
	"fmt"
	"os"
)

var scanner *bufio.Scanner = bufio.NewScanner(os.Stdin)

func Prompt(content string) string {
	fmt.Print(content)
	scanner.Scan()
	return scanner.Text()
}
