module.exports = async function(ws, clients) {
   
    ws.on('message', message => {
        ws.send(message)
    });
}
