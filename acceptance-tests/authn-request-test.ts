const Browser = require('zombie')
import { Server } from 'http'
import { createApp } from './../src/app'
import * as request from 'request-promise-native'
import { assert } from 'chai'
import { parse as parseUrl } from 'url'

describe('Clicking "Start"', function () {

  const browser = new Browser()
  const VERIFY_SERVICE_PROVIDER_HOST = process.env['VERIFY_SERVICE_PROVIDER_HOST'] || 'http://localhost:50400'
  const COMPLIANCE_TOOL_HOST = process.env['COMPLIANCE_TOOL_HOST'] || 'http://localhost:50270'
  let server: Server

  beforeEach(done => {
    server = createApp({ verifyServiceProviderHost: VERIFY_SERVICE_PROVIDER_HOST }).listen(0, done)
  })

  afterEach(done => {
    server.close(done)
  })

  before(() => {
    const postData = {
      serviceEntityId: 'http://passport-verify-stub-relying-party',
      assertionConsumerServiceUrl: 'http://passport-verify-stub-relying-party/verify/response',
      // certificate lasting for 100 years CN=My Application, O=My Organisation, L=My City, C=DE
      signingCertificate: 'MIIDIjCCAgqgAwIBAgIESSrg2jANBgkqhkiG9w0BAQsFADBSMQswCQYDVQQGEwJERTEQMA4GA1UEBxMHTXkgQ2l0eTEYMBYGA1UEChMPTXkgT3JnYW5pc2F0aW9uMRcwFQYDVQQDEw5NeSBBcHBsaWNhdGlvbjAgFw0xNzA3MjQxMzM3MTdaGA8yMTE3MDYzMDEzMzcxN1owUjELMAkGA1UEBhMCREUxEDAOBgNVBAcTB015IENpdHkxGDAWBgNVBAoTD015IE9yZ2FuaXNhdGlvbjEXMBUGA1UEAxMOTXkgQXBwbGljYXRpb24wggEiMA0GCSqGSIb3DQEBAQUAA4IBDwAwggEKAoIBAQCHsxejk7eW9NucMiEFWCy+gtw4HGf/8NotDKRo0zzWeq7VImb2B4bWdmUH12wV5fhD7UXPfSwCdOH5LDJ84O232oKsuB5oosxRA7zq7kUJTI6ZiNRYJMbFR3oYnhXgibNGzYAqYrum1A9fiF3HydvpEkgdi9ElJSUx3bIQIKJLK1KP3k/+4q4IPkmPWmgnZ81/tJzh9v8WqMJ5Dnb7txVFXcaMAHYRP/MG/ycyuZrYiWHAJoljG/nAjkXlaYdxLwvLXhNUCyHvtOvvOIEgNDYHGjT9UtvmDloc3Z8Gno5zYqvtqh4UEg60U2MOMx+vzVuhRTfdngWyfOwKwoxfQiMjAgMBAAEwDQYJKoZIhvcNAQELBQADggEBADvsKfulEN0APMu7HN9SKeEcNTvIkPdvk1TDnOTGQJIztOvFSiHrRBBcgQduA9bZRwnPow/d5azKiFMCWNwW7DqRm9dloBx80Fo/rwiYk2F8ELFIHMnW6XGeeenAqaLgWyhWkAYb9NXbePHmY2gHplNN7rhFZCDgbMEwuEbN+R3/D/FdEtVcs8J1QbH/tRI6Zsk30trAdc8DNnA/WclK7PirhA+Pdpez5r6mFNMBQKDG6xEzNIkZ4/EtkQygZ9Lv55sbHbQumsSfF4TtsNzj/RyPMyvd9pEMwWxEHT0kJ1tNURclOSpqq4fhw+O2X34tOZZjc9QgtxR46dQFmUOtmZo=',
      encryptionCertificate: 'MIIDIjCCAgqgAwIBAgIEWceUbjANBgkqhkiG9w0BAQsFADBSMQswCQYDVQQGEwJERTEQMA4GA1UEBxMHTXkgQ2l0eTEYMBYGA1UEChMPTXkgT3JnYW5pc2F0aW9uMRcwFQYDVQQDEw5NeSBBcHBsaWNhdGlvbjAgFw0xNzA3MjQxMzM3MThaGA8yMTE3MDYzMDEzMzcxOFowUjELMAkGA1UEBhMCREUxEDAOBgNVBAcTB015IENpdHkxGDAWBgNVBAoTD015IE9yZ2FuaXNhdGlvbjEXMBUGA1UEAxMOTXkgQXBwbGljYXRpb24wggEiMA0GCSqGSIb3DQEBAQUAA4IBDwAwggEKAoIBAQCtiX7tnyvlsQK8Q8k4EU7dnXYCYY4vglpAbBI5YpMemNrOQnMzBClogasyKK/hUfn2BIQYBm8qBv3gH2vylRYuHSTw2TuypPRWBaetPV1R6fo3c2PURy/c9aBNtgF750WkEStrzSIug9GtY5WifYf+lMf1Tc/S0bVWBnj/MSXf+EnZCt8+uSeKemJx9FdMEwxXVvopIECgMZcLwtgEav6JOww+Bj2oCUWKlkJZvvoUlQWaYBAuDG7WCh7K/SVPnEHN6/f+fJHOMl5mg0rQuidWoQdNVTfbzKDeUdU0nChrqam64oa3h76K/874iTfQ98K1zJvSFFgfH/deH/cT0J5NAgMBAAEwDQYJKoZIhvcNAQELBQADggEBAKvSYhva27JdC+akcXSiun10rJbNuLf+PfrtUv2JT9OeL3PX7ejjK8A8J5WTX8E3icVq+kDat8eU+Eo4ujh5q/vNtRIgHgpRoLNJZ6NHNn++WPLtyhH0wYcbYnGYwu0jfdOLMKA52hYw0yiTjfcyt5OH7/cuGl5q1lylk9IjKsSbIH6L52wbbYBFg34Y/wjkN6ghgX9zFmLXD+Cz5gPPjHUt3tIN4PT30WSaEcfxXAVTulnPo/hZyO5TBWfhQ+0tlOzJ0Ubs7SyG3XuAEBiNc9w3PmMQfYfTP3NS51v87sKOTvn3DqG6+ZtQDlt/2yiDyR1pwT3P556zYR8+OTOg0Io=',
      expectedPID: 'passport-verify-stub-relying-party-pid',
      matchingServiceEntityId: 'http://passport-verify-stub-relying-party/msa',
      matchingServiceSigningPrivateKey: 'MIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQCHsxejk7eW9NucMiEFWCy+gtw4HGf/8NotDKRo0zzWeq7VImb2B4bWdmUH12wV5fhD7UXPfSwCdOH5LDJ84O232oKsuB5oosxRA7zq7kUJTI6ZiNRYJMbFR3oYnhXgibNGzYAqYrum1A9fiF3HydvpEkgdi9ElJSUx3bIQIKJLK1KP3k/+4q4IPkmPWmgnZ81/tJzh9v8WqMJ5Dnb7txVFXcaMAHYRP/MG/ycyuZrYiWHAJoljG/nAjkXlaYdxLwvLXhNUCyHvtOvvOIEgNDYHGjT9UtvmDloc3Z8Gno5zYqvtqh4UEg60U2MOMx+vzVuhRTfdngWyfOwKwoxfQiMjAgMBAAECggEBAIEsURdMORoAscBo05gTzFv5k4nyOGmhKv5xJ1wFoMcF98E5Q0t19LvX7epd/SyHQiHfDnIp1CfufWFE2jaXopI99eBWT9QJDHceGMqFz7+/WYr7fi79qx0GIkqmyWp5ieefHR6756cx/ARTefoBxE2EMpO1kXxLdLGYOLUza2ojQ57bygNXLyRZgqoDIdUK1gFiWZJefpUfwOpWkNTk9NkAkvGHWt/T30zN9bmX52zFFP8SKnBOdka+lk8iFHrwpd/8v1ass51WhNAjDafnBE2wMYQQTtIuaEhmZ7f8juEOC1NizXHkwMq9uXx3cAdXbVjs+rGsgjAwfD9BVAMvi0ECgYEA5YaKtC+O4pGxFVhG8ZsabvscmeVVkcHS7jVHU7Lwj/2NEZE2B7w5pdEJNWjNXRXqGUNUTwrapEIewyFcLGz1tbbBWAnve28e55J7WwI36wCmXD8v+LpuPfl9ZJxXO2ZOxhvWMlvh8pAaDzConc/W5/dU3V3sQUH99pAb96+vs6ECgYEAl1oLvVTMcPgq8cOiwnvJa1pav/w3QZCB+h+tTib1f8cgTcIuWMA0z4uDu3fBPXU6JvC//EwQYE9cNzdtDldxhdfeccwZoVka7jAmdYuu14DVtAPPqet2HL4AyIDKICofewGtxVDLR13EEmJegtkqVIZOcPeYYAj16SxybXySIEMCgYEAhni4srBaSiuJUDQT/GEer363VwKhi2+/IIhebY8cmX+3Ml+dBBMmwxshBgWMq8i3Cm4D6vs09Z83XqMg2XZMzlVwGSBZCjwkIxAS7VLzZ99NmCX8+QBgrjaJXHSsNsTNygttBrwGOJJschHT+AFYqzagpcDtNZ5wKBBuEkL/8YECgYBF1Y97IYhfS7KM8ObFc9ZhCUS8NsTMJMBER59wYvt9pMRb/I/j9XOom8gBlOT91XwqgYUkBXi854E2HQXdyy0fQ5ZozXK6BuItKtxj+jqHRvPT5rpHvdQ2uNilqv8YTjdOS10BoSDaYgJZNThEia1FaN8CssuE7D2DBDYcHJFT/wKBgBwmn7fkoSzrDypaaZzdK+BMPc/YLnIVgF7DF2zRv/laLr5FChf0n1Sdi5LrdPjUT0YmnFCZODhj3UV9PU9AoKX1ePAaxLs5X8pMQfeqW9lWbYWW2cE4on7QlPcKtJluBGboKAyvdI69t2sS+FoK2OiPqcWZLd3zBETYmJ/Hh95A',
      userAccountCreationAttributes: []
    }

    return request({
      uri: `${COMPLIANCE_TOOL_HOST}/service-test-data`,
      method: 'POST',
      json: true,
      body: postData
    })
  })

  it('Should send an AuthnRequest to the compliance tool', async () => {
    await browser.visit(`http://localhost:${server.address().port}`)
    await browser.clickLink('Start')
    browser.assert.status(200)
    browser.assert.url(`${COMPLIANCE_TOOL_HOST}/SAML2/SSO`)
  })

})
