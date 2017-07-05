import { assert } from 'chai'
import * as request from 'request-promise-native'
import { createApp } from '../src/app'
import * as http from 'http'
import * as express from 'express'

describe('Stub RP Application', function () {
  let server: http.Server
  let verifyServiceProviderServer: http.Server
  let mockVerifyServiceProvider: express.Application
  const client = request.defaults({ jar: true, simple: false, followAllRedirects: true })

  describe('when an existing user logs in', () => {

    beforeEach((done) => {
      server = createApp({ verifyServiceProviderHost: 'http://localhost:3202' }).listen(3201, () => {
        mockVerifyServiceProvider = express()
        verifyServiceProviderServer = mockVerifyServiceProvider.listen(3202, done)
      })
    })

    afterEach((done) => {
      server.close(() => {
        verifyServiceProviderServer.close(done)
      })
    })

    it('should render a form that would authenticate with SAML', function () {
      mockVerifyServiceProvider.post('/generate-request', (req, res, next) => {
        res.header('content-type', 'application/json').send({
          samlRequest: 'some-saml',
          secureToken: 'some-secure-token',
          location: 'http://example.com'
        })
      })
      return client('http://localhost:3201/verify/start')
        .then(body => {
          assert.include(body, '<form')
          assert.include(body, 'some-saml')
          assert.include(body, 'http://example.com')
          assert.include(body, 'SAMLRequest')
          assert.include(body, 'relayState')
        })
    })

    it('should show the service page when user is authenticated', function () {
      mockVerifyServiceProvider.post('/translate-response', (req, res, next) => {
        res.header('content-type', 'application/json').send({
          pid: 'billy',
          scenario: 'SUCCESS_MATCH',
          levelOfAssurance: 'LEVEL_1',
          attributes: null
        })
      })
      return client({
        uri: 'http://localhost:3201/verify/response',
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: 'SAMLResponse=some-saml-response'
      })
      .then(body => {
        assert.include(body, 'You have successfully logged in as <em>Billy Batson</em>')
        assert.include(body, 'level of assurance LEVEL_1')
      })
    })

    it('should show an authentication failed page when user could not be authenticated', function () {
      mockVerifyServiceProvider.post('/translate-response', (req, res, next) => {
        res.header('content-type', 'application/json').status(401).send({
          reason: 'AUTHENTICATION_FAILED',
          message: 'Authentication failed'
        })
      })
      return client({
        uri: 'http://localhost:3201/verify/response',
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: 'SAMLResponse=some-saml-response'
      })
      .then(body => {
        assert.include(body, 'Authentication failed!', body)
      })
    })

    it('should show an error when receiving 500', function () {
      mockVerifyServiceProvider.post('/translate-response', (req, res, next) => {
        res.status(500)
        res.header('content-type', 'application/json').send({
          reason: 'INTERNAL_SERVER_ERROR',
          message: 'anything'
        })
      })
      return client({
        uri: 'http://localhost:3201/verify/response',
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: 'SAMLResponse=some-saml-response'
      })
      .then(body => {
        assert.include(body, 'An Error occurred', body)
        assert.include(body, 'Because INTERNAL_SERVER_ERROR', body)
      })
    })

  })

  describe('when a new user logs in', () => {
    const mockVerifyServiceProvider = express()
    mockVerifyServiceProvider.post('/generate-request', (req, res, next) => {
      res.send({
        samlRequest: 'some-saml',
        secureToken: 'some-secure-token',
        location: 'http://example.com'
      })
    })
    mockVerifyServiceProvider.post('/translate-response', (req, res, next) => {
      res.send({
        pid: 'some-new-user',
        levelOfAssurance: 'LEVEL_2',
        attributes: {
          firstName: 'Johnny',
          middleName: 'Come',
          surname: 'Lately'
        }
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

    it('should show the service page with the user\'s attributes when the user is created', function () {
      return client({
        uri: 'http://localhost:3201/verify/response',
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: 'SAMLResponse=some-saml-response'
      })
      .then(body => {
        assert.include(body, 'You have successfully logged in as <em>Johnny Lately</em>')
        assert.include(body, 'level of assurance LEVEL_2')
      })
    })
  })
})
