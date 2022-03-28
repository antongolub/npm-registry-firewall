import http from 'node:http'

import {request} from './client.js'

export const server = http.createServer(async (req, res) => {
  try {
    request(`https://example.com/`, null, null, {req, res})

    // res
    //   .writeHead(200)
    //   .end("hello world\n")
  } catch(e) {
    // statements
    console.log(e);
  }
})
