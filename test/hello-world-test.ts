import * as assert from 'assert'
import { default as fetch, Response } from 'node-fetch'
import app from '../src/app'
import * as http from 'http'

describe('Stub RP Application', function () {

  let server: http.Server

  beforeEach(() => {
    server = app.listen(3201)
  })

  afterEach(() => {
    server.close()
  })

  it('should say hello world', function () {
    return fetch('http://localhost:3201/hello-world')
      .then((res: Response) => res.text())
      .then((body: string) => {
        assert.equal(body, 'Hello World!')
      })
  })

})
