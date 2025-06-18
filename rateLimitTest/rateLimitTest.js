import http from 'k6/http';
import { check, sleep } from 'k6';

export let options = {
  vus: 1,
  duration: '1m',
};

export default function () {
  let res = http.get('http://url/threads');

  check(res, {
    'status is 200': (r) => r.status === 200,
  });

  // sleep(0.15);
}
