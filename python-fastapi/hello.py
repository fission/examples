from fastapi import Request, Response

def main(request: Request):
    return Response(content="Hello, World!", status_code=200)