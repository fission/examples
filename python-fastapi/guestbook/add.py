#
# Handles POST /guestbook -- adds item to guestbook
#

from fastapi import Request, Response
from fastapi.responses import RedirectResponse
import redis

# Connect to redis.
redisConnection = redis.StrictRedis(host='redis.guestbook', port=6379, db=0)

async def main(request: Request):
    # Read the item from POST params, add it to redis, and redirect
    # back to the list
    form = await request.form()
    book = form.get('text')
    if book is None:
        return Response(status_code=400)
    redisConnection.rpush('guestbook', book)
    return RedirectResponse('/guestbook', status_code=303)
