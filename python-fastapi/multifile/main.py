from fastapi import logger, Request, Response
import sys
import readfile
import os

def main(request: Request):
    logger.logger.info("Hi")

    current_dir = os.path.dirname(__file__)

    return Response(readfile.readFile(os.path.join(current_dir, "message.txt")))
