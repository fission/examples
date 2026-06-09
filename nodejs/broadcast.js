module.exports = async function(ws, clients) {
   
      ws.on('message', function incoming(data) {
          clients.forEach(function each(client) {
              client.send(data);
          });
        });
}
