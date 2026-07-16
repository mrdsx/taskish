import hashlib
import secrets

BYTES_NUMBER = 64


def get_random_hash() -> str:
    random_bytes = secrets.token_bytes(BYTES_NUMBER)

    return hashlib.sha512(random_bytes).hexdigest()


def get_hash(data: str) -> str:
    encoded_data = data.encode("utf-8")

    return hashlib.sha512(encoded_data).hexdigest()
