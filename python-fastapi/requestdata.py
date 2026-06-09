from fastapi import logger, Request, Response

async def main(request: Request):
    logger.logger.info("Received request")
    msg = "---HEADERS---\n%s\n--BODY--\n%s\n-----\n" % (request.headers, str(await request.body(), encoding='utf-8'))
    return Response(msg)
