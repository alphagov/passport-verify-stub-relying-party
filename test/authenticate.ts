import * as assert from 'assert'
import { default as fetch, Response } from 'node-fetch'
import createApp from '../src/app'
import * as http from 'http'
import * as express from 'express'

describe('Stub RP Application', function () {

  let server: http.Server
  let verifyServiceProviderServer: http.Server
  const mockVerifyServiceProvider = express()
  mockVerifyServiceProvider.post('/generate-request', (req, res, next) => {
    res.send({
      samlRequest: 'some-saml',
      secureToken: 'some-secure-token',
      location: 'http://example.com'
    })
  })

  beforeEach(() => {
    server = createApp({ verifyServiceProviderHost: 'http://localhost:3202' }).listen(3201)
    verifyServiceProviderServer = mockVerifyServiceProvider.listen(3202)
  })

  afterEach(() => {
    server.close()
    verifyServiceProviderServer.close()
  })

  it('should render a form that would authenticate with SAML', function () {
    return fetch('http://localhost:3201/verify/start')
      .then((res: Response) => res.text())
      .then((body: string) => {
        console.log(body)
        assert(body.includes('<form'))
        assert(body.includes('some-saml'))
        assert(body.includes('http://example.com'))
        // TODO assert(body.includes('samlRequest'))
        assert(body.includes('relayState'))
      })
  })

})
