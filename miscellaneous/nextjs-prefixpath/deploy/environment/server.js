"use strict";

const fs = require("fs");
const path = require("path");
const process = require("process");
const express = require("express");
const request = require("request");
const app = express();
const bodyParser = require("body-parser");
const morgan = require("morgan");
const WSServer = require("ws").Server;
const argv = require("minimist")(process.argv.slice(1)); // Command line opts

if (!argv.port) {
  argv.port = 8888;
}

// Interval at which we poll for connections to be active
var timeout;
if (process.env.TIMEOUT) {
  timeout = process.env.TIMEOUT;
} else {
  timeout = 60000;
}

// To catch unhandled exceptions thrown by user code async callbacks,
// these exceptions cannot be catched by try-catch in user function invocation code below
process.on("uncaughtException", (err) => {
  console.error(`Caught exception: ${err}`);
});

// User function.  Starts out undefined.
let userFunction;

function loadFunction(modulepath, funcname) {
  // Read and load the code. It's placed there securely by the fission runtime.
  try {
    let startTime = process.hrtime();
    // support v1 codepath and v2 entrypoint like 'foo', '', 'index.hello'
    let userFunction = funcname
      ? require(modulepath)[funcname]
      : require(modulepath);
    let elapsed = process.hrtime(startTime);
    console.log(
      `user code loaded in ${elapsed[0]}sec ${elapsed[1] / 1000000}ms`
    );
    return userFunction;
  } catch (e) {
    console.error(`user code load error: ${e}`);
    return e;
  }
}

function withEnsureGeneric(func) {
  return function(req, res) {
    // Make sure we're a generic container.  (No reuse of containers.
    // Once specialized, the container remains specialized.)
    if (userFunction) {
      res.status(400).send("Not a generic container");
      return;
    }

    func(req, res);
  };
}

function isFunction(func) {
  return func && func.constructor && func.call && func.apply;
}

function specializeV2(req, res) {
  // for V2 entrypoint, 'filename.funcname' => ['filename', 'funcname']
  const entrypoint = req.body.functionName
    ? req.body.functionName.split(".")
    : [];
  // for V2, filepath is dynamic path
  const modulepath = path.join(req.body.filepath, entrypoint[0] || "");
  const result = loadFunction(modulepath, entrypoint[1]);

  if (isFunction(result)) {
    userFunction = result;
    res.status(202).send();
  } else {
    res.status(500).send(JSON.stringify(result));
  }
}

function specialize(req, res) {
  // Specialize this server to a given user function.  The user function
  // is read from argv.codepath; it's expected to be placed there by the
  // fission runtime.
  //
  const modulepath = argv.codepath || "/userfunc/user";

  // Node resolves module paths according to a file's location. We load
  // the file from argv.codepath, but tell users to put dependencies in
  // the server's package.json; this means the function's dependencies
  // are in /usr/src/app/node_modules.  We could be smarter and have the
  // function deps in the right place in argv.codepath; b ut for now we
  // just symlink the function's node_modules to the server's
  // node_modules.
  // Check for symlink, because the link exists if the container restarts
  if (!fs.existsSync(`${path.dirname(modulepath)}/node_modules`)) {
    fs.symlinkSync(
      "/usr/src/app/node_modules",
      `${path.dirname(modulepath)}/node_modules`
    );
  }
  const result = loadFunction(modulepath);

  if (isFunction(result)) {
    userFunction = result;
    res.status(202).send();
  } else {
    res.status(500).send(JSON.stringify(result));
  }
}

// Request logger
app.use(morgan("combined"));

let bodyParserLimit = process.env.BODY_PARSER_LIMIT || "1mb";

app.use(bodyParser.urlencoded({ extended: false, limit: bodyParserLimit }));
app.use(bodyParser.json({ limit: bodyParserLimit }));
app.use(bodyParser.raw({ limit: bodyParserLimit }));
app.use(bodyParser.text({ type: "text/*", limit: bodyParserLimit }));

app.post("/specialize", withEnsureGeneric(specialize));
app.post("/v2/specialize", withEnsureGeneric(specializeV2));

// Generic route -- all http requests go to the user function.
app.all("*", function(req, res) {
  if (!userFunction) {
    res.status(500).send("Generic container: no requests supported");
    return;
  }

  const context = {
    request: req,
    response: res,
    // TODO: context should also have: URL template params, query string
  };

  function callback(status, body, headers) {
    if (!status) return;
    if (headers) {
      for (let name of Object.keys(headers)) {
        res.set(name, headers[name]);
      }
    }
    res.status(status).send(body);
  }

  //
  // Customizing the request context
  //
  // If you want to modify the context to add anything to it,
  // you can do that here by adding properties to the context.
  //

  if (userFunction.length <= 1) {
    // One or zero argument (context)
    let result;
    // Make sure their function returns a promise
    if (userFunction.length === 0) {
      result = Promise.resolve(userFunction());
    } else {
      result = Promise.resolve(userFunction(context));
    }
    result
      .then(function({ status, body, headers }) {
        callback(status, body, headers);
      })
      .catch(function(err) {
        console.log(`Function error: ${err}`);
        callback(500, "Internal server error");
      });
  } else {
    // 2 arguments (context, callback)
    try {
      userFunction(context, callback);
    } catch (err) {
      console.log(`Function error: ${err}`);
      callback(500, "Internal server error");
    }
  }
});

let server = require("http").createServer();

// Also mount the app here
server.on("request", app);

const wsStartEvent = {
  url: "http://127.0.0.1:8000/wsevent/start",
};

const wsInactiveEvent = {
  url: "http://127.0.0.1:8000/wsevent/end",
};

// Create web socket server on top of a regular http server
let wss = new WSServer({
  server: server,
});

function noop() {}

function heartbeat() {
  this.isAlive = true;
}
// warm indicates whether this pod has ever been active
var warm = false;

let interval;
interval = setInterval(function ping() {
  if (warm) {
    if (wss.clients.size > 0) {
      wss.clients.forEach(function each(ws) {
        // We check if all connections are alive
        if (ws.isAlive === false) return ws.terminate();

        ws.isAlive = false;
        // If client replies, we execute the hearbeat function(pong) and set the connection as active
        ws.ping(noop);
      });
    } else {
      // After we have pinged all clients and verified number of active connections is 0, we generate event for inactivity on the websocket
      request(wsInactiveEvent, (err, res) => {
        if (err || res.statusCode != 200) {
          if (err) {
            console.log(err);
          } else {
            console.log("Unexpected response");
          }
          ws.send("Error");
          return;
        }
      });
      return;
    }
  }
}, timeout);

wss.on("connection", function connection(ws) {
  if (warm == false) {
    warm = true;
    // On successful request, there's no body returned
    request(wsStartEvent, (err, res) => {
      if (err || res.statusCode != 200) {
        if (err) {
          console.log(err);
        } else {
          console.log("Unexpected response");
        }
        ws.send("Error");
        return;
      }
    });
  }

  ws.isAlive = true;
  ws.on("pong", heartbeat);

  wss.on("close", function close() {
    clearInterval(interval);
  });

  try {
    userFunction(ws, wss.clients);
  } catch (err) {
    console.log(`Function error: ${err}`);
    ws.close();
  }
});

server.listen(argv.port, () => {});
