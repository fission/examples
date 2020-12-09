import http from "k6/http";
import { check } from "k6";

export let options = {
  noConnectionReuse: true,
  noVUConnectionReuse: true,
  summaryTrendStats: [`avg`, `min`, `med`, `max`, `p(5)`, `p(10)`, `p(15)`, `p(20)`, `p(25)`, `p(30)`],
  linger: true,
  teardownTimeout: '90m',
  scenarios: {
      func1: {
            executor: 'constant-arrival-rate',
            exec: 'func1_exec',
            rate: 500,
            preAllocatedVUs: 1250,
            timeUnit: '1m',
            duration: '5m',
            gracefulStop: '90m',
        },
      func2: {
          executor: 'constant-arrival-rate',
          exec: 'func2_exec',
          rate: 150,
          preAllocatedVUs: 750,
          timeUnit: '1m',
          duration: '5m',
          gracefulStop: '90m',
      },
      func3: {
        executor: 'constant-arrival-rate',
        exec: 'func3_exec',
        rate: 150,
        preAllocatedVUs: 750,
        timeUnit: '1m',
        duration: '5m',
        gracefulStop: '90m',
      },
      func4: {
        executor: 'constant-arrival-rate',
        exec: 'func4_exec',
        rate: 100,
        preAllocatedVUs: 500,
        timeUnit: '1m',
        duration: '5m',
        gracefulStop: '90m',
      },
      func5: {
        executor: 'constant-arrival-rate',
        exec: 'func5_exec',
        rate: 100,
        preAllocatedVUs: 500,
        timeUnit: '1m',
        duration: '5m',
        gracefulStop: '90m',
      }      
    },
};


export function func1_exec() {
  let params = { timeout: 3600000 }
  let res = http.get(`http://${__ENV.MY_HOSTNAME}/fission-function/hello-1-15`, params)
  check(res, {
    "status is 200": (r) => r.status === 200
  });
}

export function func2_exec() {
  let params = { timeout: 3600000 }
  let res = http.get(`http://${__ENV.MY_HOSTNAME}/fission-function/hello-2-45`, params)
  check(res, {
    "status is 200": (r) => r.status === 200
  });
}

export function func3_exec() {
  let params = { timeout: 3600000 }
  let res = http.get(`http://${__ENV.MY_HOSTNAME}/fission-function/hello-3-75`, params)
  check(res, {
    "status is 200": (r) => r.status === 200
  });
}

export function func4_exec() {
  let params = { timeout: 3600000 }
  let res = http.get(`http://${__ENV.MY_HOSTNAME}/fission-function/hello-4-90`, params)
  check(res, {
    "status is 200": (r) => r.status === 200
  });
}

export function func5_exec() {
  let params = { timeout: 3600000 }
  let res = http.get(`http://${__ENV.MY_HOSTNAME}/fission-function/hello-5-120`, params)
  check(res, {
    "status is 200": (r) => r.status === 200
  });
}