def main(ws, clients):
    print("The number of clients is: {}".format(len(clients)))
    count = 0
    while not ws.closed and count < 5:
        message = ws.receive()
        ws.send(message)
        count += 1
    ws.close()