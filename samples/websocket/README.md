# Web Socket based Chat Application on Fission

This sample demos two Fission functions.
The first function hosts a simple web interface for the chat application.
The second function handles the messages coming from the chat application and broadcasts each message to connected clients.
Please check `specs` directory for the Fission specs.

For Specs related commands, please refer [this doc](specs/README.md)

## Deploy

- Fission environment
- Build Fission package for NodeJS backend and Python based chat app
- Fission functions and HTTP routes

```
fission spec apply
```

Note:

- This example uses latest [NodeJS environment](https://github.com/fission/environments/tree/master/nodejs) which has built in support for Web Socket.

## Use

In order to use the application, open multiple browser windows and go to `http://<router-ip:router-svc-port>/chat/app.html` to access the application.
Send message from either of the window, it will be broadcasted to all others.

## Cleanup

```bash
./deploy/destroy.sh
```
