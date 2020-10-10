from datetime import datetime
import os
from locust import HttpUser, TaskSet, task, between
from locust.contrib.fasthttp import FastHttpUser


class FissionUser(FastHttpUser):
    network_timeout = float(os.environ['NET_TIMEOUT'])
    connection_timeout = float(os.environ['CON_TIMEOUT'])
    wait_time = between(1, 2)
    
    @task(33)
    def task1(self):
        self.client.get(
            '/fission-function/' + os.environ['TASK_1'])

    @task(19)
    def task2(self):
        self.client.get(
            '/fission-function/' + os.environ['TASK_2'])

    @task(19)
    def task3(self):
        self.client.get(
            '/fission-function/' + os.environ['TASK_3'])

    @task(13)
    def task4(self):
        self.client.get(
            '/fission-function/' + os.environ['TASK_4'])

    @task(13)
    def task5(self):
        self.client.get(
            '/fission-function/' + os.environ['TASK_5'])