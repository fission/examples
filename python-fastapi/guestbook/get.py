#
# Handles GET /guestbook -- returns a list of items in the guestbook
# with a form to add more.
#

from fastapi import Request, Response
from markupsafe import escape
import redis

# Connect to redis.  This is run only when this file is loaded; as
# long as the pod is alive, the connection is reused.
redisConnection = redis.StrictRedis(host='redis.guestbook', port=6379, db=0)

def main(request: Request):
    messages = redisConnection.lrange('guestbook', 0, -1)

    items = [("<li>%s</li>" % escape(m.decode('utf-8'))) for m in messages]
    ul = "<ul>%s</ul>" % "\n".join(items)
    return Response("""
      <html><body style="font-family:sans-serif;font-size:2rem;padding:40px">
          <h1>Guestbook</h1>
          <form action="/guestbook" method="POST">
            <input type="text" name="text">
            <button type="submit">Add</button>
          </form>
          <hr/>
          %s
      </body></html>
      """ % ul)
