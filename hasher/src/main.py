from datetime import datetime

from argon2 import PasswordHasher

from src.settings import settings

hasher = PasswordHasher(**settings.hashing_settings)


def main() -> None:
    password = input("Enter the password: ")
    start = datetime.now()
    hash = hasher.hash(password=password)
    end = datetime.now()
    period = end - start
    period_str = str(period.seconds) + "." + str(period.microseconds).rjust(6, "0")

    print(f"Generated hash in {period_str}s:")
    print(hash)


if __name__ == "__main__":
    main()
