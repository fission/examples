# Websocket Usage with Python

## Writing a Websocket based application

Fission Python environment supports writing a websocket based application.
You need to ensure you are setting `WSGI_FRAMEWORK` env to `"GEVENT"` in your runtime container config as shown in below spec command.
Python exported function should accept to two arguments:

```python
def main(ws, clients):
    pass
```

### Websocket `ws` object

`ws` object [a Websocket object](https://github.com/imachug/gevent-ws/blob/450fac5cb5a9992c3eab30a2a91ed28d6a284214/gevent_ws/__init__.py#L25) coming from [gevent-ws](https://pypi.org/project/gevent-ws/) package.

```python
# Send data over websocket
ws.send(data)

# Receiving data via websocket with wait
data = ws.receive()

# Receiving data via websocket without wait
data = ws.receive_nowait()

# False if ws is active and True if ws is closed
ws.closed

# Close websocket
ws.close()
```

### Clients `clients` list

`clients` is a set of active websocket connections to the server, including current `ws` object.
`clients` can be used to broadcast data to all connected clients.
`clients` should be used in read-only mode.
It might happen that few of connections are closed from the list, so it is recommended to use `closed` value to check if connection is closed or not.

## Usage

[main.py](./main.py) is a sample websocket application.
Here, we receive data from client and send it back to client.
After certain no of messages, we close the connection.

You can connect to this websocket application with client like [wscat](https://github.com/websockets/wscat) or write one using [websocket-client](https://pypi.org/project/websocket-client/) package.

Sample usage:

```bash
wscat -c ws://localhost:8089/socktest
Connected (press CTRL+C to quit)
> 1
< 1
> 2
< 2
> 3
< 3
> 4
< 4
> 5
< 5
Disconnected (code: 1000, reason: "")
```

## Spec

```bash
fission env create --name python --image tripples/python-env-3.9:dev --runtime-env WSGI_FRAMEWORK=GEVENT --spec
fission function create --name socktest --env python --code main.py --spec
fission route create --name socktest --url=/socktest --function socktest --spec
```
