from datetime import datetime
import math
import time

def main():
    start = datetime.now()
    i = 10
    while (datetime.now() - start).seconds <= 15:
        fac = math.factorial(i)
        time.sleep(0.5)
        i += 10
    return "Success"