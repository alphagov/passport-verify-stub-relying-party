import * as assert from 'assert'
import * as request from 'request-promise-native'
import { createApp } from '../src/app'
import * as http from 'http'
import * as express from 'express'

describe('Stub RP Application', function () {
  let server: http.Server
  let verifyServiceProviderServer: http.Server
  const mockVerifyServiceProvider = express()
  const client = request.defaults({ jar: true, simple: false, followAllRedirects: true })

  mockVerifyServiceProvider.post('/generate-request', (req, res, next) => {
    res.send({
      samlRequest: 'some-saml',
      secureToken: 'some-secure-token',
      location: 'http://example.com'
    })
  })
  mockVerifyServiceProvider.post('/translate-response', (req, res, next) => {
    res.send({
      pid: 'billy',
      levelOfAssurance: 'LEVEL_1',
      attributes: []
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
    return client('http://localhost:3201/verify/start')
      .then(body => {
        assert(body.includes('<form'))
        assert(body.includes('some-saml'))
        assert(body.includes('http://example.com'))
        assert(body.includes('SAMLRequest'))
        assert(body.includes('relayState'))
      })
  })

  it('should show the service page when user is authenticated', function () {
    return client({
      uri: 'http://localhost:3201/verify/response',
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: 'SAMLResponse=some-saml-response'
    })
    .then(body => assert(body.includes('You have successfully logged in as <em>Billy Batson</em>')))
  })
})
