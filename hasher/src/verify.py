from datetime import datetime

from argon2 import PasswordHasher

hasher = PasswordHasher()


def main() -> None:
    password = input("Enter the password: ")
    hash = input("Enter the hash: ")
    start = datetime.now()
    hasher.verify(hash=hash, password=password)
    end = datetime.now()
    period = end - start
    period_str = str(period.seconds) + "." + str(period.microseconds).rjust(6, "0")

    print(f"Compared hash in {period_str}s")


if __name__ == "__main__":
    main()
