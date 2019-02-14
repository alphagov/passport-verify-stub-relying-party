import { assert } from 'chai'
import { stub } from 'sinon'
import * as request from 'request-promise-native'
import { createIdentityApp } from '../src/app'
import * as http from 'http'
import * as express from 'express'
import * as bodyParser from 'body-parser'
import { Scenario } from 'passport-verify'

describe('Stub RP Application in a non-matching mode', function () {
  let server: http.Server
  let verifyServiceProviderServer: http.Server
  let mockVerifyServiceProvider: express.Application
  const client = request.defaults({ jar: true, simple: false, followAllRedirects: true })

  describe('when a response is received from VSP', () => {

    beforeEach((done) => {
      server = createIdentityApp('http://localhost:3202').listen(3201, () => {
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
          requestId: 'some-request-id',
          ssoLocation: 'http://example.com'
        })
      })
      return client('http://localhost:3201/verify/start')
        .then(body => {
          assert.include(body, '<form')
          assert.include(body, '<!-- This form has been customised -->')
          assert.include(body, 'some-saml')
          assert.include(body, 'http://example.com')
          assert.include(body, 'SAMLRequest')
          assert.include(body, 'relayState')
        })
    })

    it('should show an authentication failed page when user could not be authenticated', function () {
      mockVerifyServiceProvider.post('/translate-response', (req, res, next) => {
        res.header('content-type', 'application/json').status(200).send({
          scenario: Scenario.AUTHENTICATION_FAILED
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
        assert.include(body, 'Something went wrong', body)
      })
    })
  })

  describe('when an identity is received', () => {
    const requestId = '0f44aa97-fde9-49d1-b884-b7a449e46e7b'
    const mockVerifyServiceProvider = express()
    mockVerifyServiceProvider.use(bodyParser.json())
    mockVerifyServiceProvider.post('/generate-request', (req, res, next) => {
      res.send({
        samlRequest: 'some-saml',
        requestId: requestId,
        ssoLocation: 'http://example.com'
      })
    })
    mockVerifyServiceProvider.post('/translate-response', (req, res, next) => {
      assert.equal(req.body.requestId, requestId)
      res.send({
        scenario: Scenario.IDENTITY_VERIFIED,
        pid: 'some-new-user',
        levelOfAssurance: 'LEVEL_2',
        attributes: {
          firstName: {
            value: 'Johnny',
            verified: false
          },
          middleNames: [{
            value: 'Come',
            verified: false
          }],
          surnames: [{
            value: 'Lately',
            verified: false
          }]
        }
      })
    })

    beforeEach((done) => {
      server = createIdentityApp('http://localhost:3202').listen(3201, () => {
        verifyServiceProviderServer = mockVerifyServiceProvider.listen(3202, done)
      })
    })

    afterEach((done) => {
      server.close(() => {
        verifyServiceProviderServer.close(done)
      })
    })

    it('should show a page with the identity\'s attributes', function () {

      return client('http://localhost:3201/verify/start')
      .then(() => client({
        uri: 'http://localhost:3201/verify/response',
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: 'SAMLResponse=some-saml-response'
      }))
      .then(body => {
        assert.include(body, 'Lately')
        assert.include(body, 'LEVEL_2')
      })
    })
  })

  describe('when a user cancels during the verify journey', () => {
    const requestId = '0f44aa97-fde9-49d1-b884-b7a449e46e7b'
    const mockVerifyServiceProvider = express()
    mockVerifyServiceProvider.use(bodyParser.json())
    mockVerifyServiceProvider.post('/generate-request', (req, res, next) => {
      res.send({
        samlRequest: 'some-saml',
        requestId: requestId,
        ssoLocation: 'http://example.com'
      })
    })
    mockVerifyServiceProvider.post('/translate-response', (req, res, next) => {
      assert.equal(req.body.requestId, requestId)
      res.send({
        scenario: Scenario.CANCELLATION
      })
    })

    beforeEach((done) => {
      server = createIdentityApp('http://localhost:3202').listen(3201, () => {
        verifyServiceProviderServer = mockVerifyServiceProvider.listen(3202, done)
      })
    })

    afterEach((done) => {
      server.close(() => {
        verifyServiceProviderServer.close(done)
      })
    })

    it('should show the user cancellation page', () => {
      return client('http://localhost:3201/verify/start')
      .then(() => client({
        uri: 'http://localhost:3201/verify/response',
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: 'SAMLResponse=some-saml-response'
      }))
      .then(body => {
        assert.include(body, 'Authentication failed!', body)
        assert.include(body, 'you cancelled', body)
      })
    })
  })

  describe('when a REQUEST_ERROR scenario is returned', () => {
    const requestId = '0f44aa97-fde9-49d1-b884-b7a449e46e7b'
    const mockVerifyServiceProvider = express()
    mockVerifyServiceProvider.use(bodyParser.json())
    mockVerifyServiceProvider.post('/generate-request', (req, res, next) => {
      res.send({
        samlRequest: 'some-saml',
        requestId: requestId,
        ssoLocation: 'http://example.com'
      })
    })
    mockVerifyServiceProvider.post('/translate-response', (req, res, next) => {
      assert.equal(req.body.requestId, requestId)
      res.send({
        scenario: Scenario.REQUEST_ERROR
      })
    })

    beforeEach((done) => {
      server = createIdentityApp('http://localhost:3202').listen(3201, () => {
        verifyServiceProviderServer = mockVerifyServiceProvider.listen(3202, done)
      })
    })

    afterEach((done) => {
      server.close(() => {
        verifyServiceProviderServer.close(done)
      })
    })

    it('should show the error page', () => {
      return client('http://localhost:3201/verify/start')
      .then(() => client({
        uri: 'http://localhost:3201/verify/response',
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: 'SAMLResponse=some-saml-response'
      }))
      .then(body => {
        assert.include(body, 'Something went wrong', body)
      })
    })
  })
})
