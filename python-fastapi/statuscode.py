from fastapi import Request, Response

def main(request: Request):
  return Response("Not Found", 404)
