from fastapi import HTTPException, Request, status


def get_ip(request: Request) -> str:
    if request.client is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Client info is missing",
        )

    return request.client.host
