from datetime import datetime
import math
import time

def main():
    start = datetime.now()
    i = 10
    while (datetime.now() - start).seconds <= 30:
        print(math.factorial(i), datetime.now())
        time.sleep(0.5)
        i += 10