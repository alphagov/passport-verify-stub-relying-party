const Browser = require('zombie')
const pgp = require('pg-promise')()
import { Server } from 'http'
import { createMatchingApp } from './../src/app'
import * as request from 'request-promise-native'
import { assert } from 'chai'
import { DatabaseWrapper } from '../src/databaseWrapper'

const TestCaseId = {
  BASIC_SUCCESSFUL_MATCH_WITH_LOA2: 1,
  BASIC_NO_MATCH: 2,
  NO_AUTHENTICATION_CONTEXT: 3,
  AUTHENTICATION_FAILED: 4,
  REQUESTER_ERROR: 5,
  ACCOUNT_CREATION_LOA2: 6,
  BASIC_SUCCESSFUL_MATCH_WITH_LOA1: 7,
  ACCOUNT_CREATION_LOA1: 8,
  BASIC_SUCCESSFUL_MATCH_WITH_ASSERTIONS_SIGNED_BY_HUB: 9
}

let DEFAULT_VERIFY_SERVICE_PROVIDER_HOST = 'http://localhost:50400'
let VERIFY_SERVICE_PROVIDER_HOST = process.env['VERIFY_SERVICE_PROVIDER_HOST'] || DEFAULT_VERIFY_SERVICE_PROVIDER_HOST
if (!process.env['VERIFY_SERVICE_PROVIDER_HOST']) {
  console.log('Warning: VERIFY_SERVICE_PROVIDER_HOST not set, using localhost:50400 by default. Use the --paas flag to run against the service provider on paas.')
}

const COMPLIANCE_TOOL_HOST = process.env['COMPLIANCE_TOOL_URL'] || 'https://compliance-tool-reference.ida.digital.cabinet-office.gov.uk'

let DATABASE_CONNECTION_STRING = process.env['DATABASE_CONNECTION_STRING']
if (!DATABASE_CONNECTION_STRING) {
  console.log('Warning: DATABASE_CONNECTION_STRING not set, using postgresql://postgres:@localhost:5432/stub_rp_test by default.')
  DATABASE_CONNECTION_STRING = 'postgresql://postgres:@localhost:5432/stub_rp_test'
}

const entityIds = [null, 'http://verify-service-provider-dev-service']

describe('', function () {
  const databaseConnection = pgp(DATABASE_CONNECTION_STRING)
  const db = new DatabaseWrapper(databaseConnection)

  before(done => {
    databaseConnection.none('DELETE FROM verifiedPid; DELETE FROM person; DELETE FROM address;')
      .then((data: any) => {
        return db.createUser({
          pid: 'pid',
          attributes: {
            firstName: { value: 'Test' },
            surname: { value: 'User' },
            dateOfBirth: { value: '1993-05-20' },
            address: {
              value: {
                lines: ['Flat 0', '42 Example Street'],
                postCode: 'AA0 0AA'
              }
            }
          }
        } as any)
      }).then(() => done())
      .catch((error: any) => {
        throw new Error (
            `An error occurred while connecting to the database:
            ${error}`
        )
      })
  })

  after(done => {
    databaseConnection.none('DELETE FROM verifiedPid; DELETE FROM person; DELETE FROM address;').then(() => done())
    .catch((error: any) => {
      throw new Error (
          `An error occurred while disconnecting from the database:
          ${error}`
      )
    })
  })

  entityIds.forEach(entityId => {
    const entityIdDescription = entityId ? `provided entityId: ${entityId}` : 'VSP default entityId'

    describe(`Using ${entityIdDescription}`, function () {
      describe('When running against compliance tool', function () {
        this.timeout(5000)

        const browser = new Browser()
        let server: Server
        let testPort: number

        before(done => {
          server = entityId ? createMatchingApp(VERIFY_SERVICE_PROVIDER_HOST, db, entityId).listen(3200, done) : createMatchingApp(VERIFY_SERVICE_PROVIDER_HOST, db).listen(3200, done)
          testPort = server.address().port
        })

        after(done => {
          server.close(done)
        })

        after(() => {
          // Need to return compliance tool to default setup so that manual testing will work. Default port for this application is 3200.
          return setupComplianceTool('pid', 3200)
        })

        describe('Clicking "Start"', () => {
          before(() => {
            setupComplianceTool()
          })

          it('Should send an AuthnRequest to the compliance tool', async () => {
            await browser.visit(`http://localhost:${testPort}`)
            await browser.clickLink('Start')
            browser.assert.status(200)
            browser.assert.url(`${COMPLIANCE_TOOL_HOST}/SAML2/SSO`)
            browser.assert.text('body', /"status" : "PASSED"/)
          })
        })

        describe('On receiving a basic success response', () => {
          let testCaseUri: string

          before(() => {
            setupComplianceTool('pid')
          })

          describe('at level of assurance 1', () => {
            beforeEach(() => {
              return makeAuthnRequest()
                .then(() => getTestCaseUri(TestCaseId.BASIC_SUCCESSFUL_MATCH_WITH_LOA1))
                .then(uri => testCaseUri = uri)
            })

            it('handles the response correctly', async () => {
              await browser.visit(testCaseUri)

              browser.assert.text('h1', 'Success!')
              browser.assert.text('p', /Test User/)
            })
          })

          describe('at level of assurance 2', () => {
            beforeEach(() => {
              return makeAuthnRequest()
                .then(() => getTestCaseUri(TestCaseId.BASIC_SUCCESSFUL_MATCH_WITH_LOA2))
                .then(uri => testCaseUri = uri)
            })

            it('handles the response correctly', async () => {
              await browser.visit(testCaseUri)

              browser.assert.text('h1', 'Success!')
              browser.assert.text('p', /Test User/)
            })
          })
        })

        describe('On receiving a no match response', () => {
          let testCaseUri: string

          beforeEach(() => {
            setupComplianceTool(`pid`)
          })

          beforeEach(() => {
            return makeAuthnRequest()
              .then(() => getTestCaseUri(TestCaseId.BASIC_NO_MATCH))
              .then(uri => testCaseUri = uri)
          })

          it('handles the response correctly', async () => {
            await browser.visit(testCaseUri)

            browser.assert.text('h1', 'Authentication failed!')
            browser.assert.text('p', /Because we could not match your identity in our database/)
          })
        })

        describe('On receiving a no authn context response', () => {
          let testCaseUri: string

          beforeEach(() => {
            setupComplianceTool(`pid`)
          })

          beforeEach(() => {
            return makeAuthnRequest()
              .then(() => getTestCaseUri(TestCaseId.NO_AUTHENTICATION_CONTEXT))
              .then(uri => testCaseUri = uri)
          })

          it('handles the response correctly', async () => {
            await browser.visit(testCaseUri)

            browser.assert.text('h1', 'Authentication failed!')
            browser.assert.text('p', /Because you cancelled/)
          })
        })

        describe('On receiving an authn failed response', () => {
          let testCaseUri: string

          beforeEach(() => {
            setupComplianceTool(`pid`)
          })

          beforeEach(() => {
            return makeAuthnRequest()
              .then(() => getTestCaseUri(TestCaseId.AUTHENTICATION_FAILED))
              .then(uri => testCaseUri = uri)
          })

          it('handles the response correctly', async () => {
            await browser.visit(testCaseUri)

            browser.assert.text('h1', 'Authentication failed!')
            browser.assert.text('p', /Because no user matching your credentials could be found/)
          })
        })

        describe('On receiving an error response', () => {
          let testCaseUri: string

          beforeEach(() => {
            setupComplianceTool(`pid`)
          })

          beforeEach(() => {
            return makeAuthnRequest()
              .then(() => getTestCaseUri(TestCaseId.REQUESTER_ERROR))
              .then(uri => testCaseUri = uri)
          })

          it('handles the response correctly', async () => {
            await browser.visit(testCaseUri)

            browser.assert.text('h1', 'Something went wrong')
            browser.assert.text('p', /There was an error while trying to verify your identity\./)
          })
        })

        describe('On receiving a user account creation response', () => {
          let testCaseUri: string
          let latestPid: string

          beforeEach(() => {
            latestPid = `unseen-pid-${Date.now()}`
            setupComplianceTool(latestPid)
          })

          describe('at level of assurance 1', () => {
            beforeEach(() => {
              return makeAuthnRequest()
                .then(() => getTestCaseUri(TestCaseId.ACCOUNT_CREATION_LOA1))
                .then(uri => testCaseUri = uri)
            })

            it('inserts the user into the database', async () => {
              await browser.visit(testCaseUri)
              const elements = await databaseConnection.manyOrNone(`SELECT * FROM verifiedPid WHERE pid='${latestPid}'`)
              assert.equal(elements.length, 1)
            })

            it('goes to the correct page', async () => {
              await browser.visit(testCaseUri)
              browser.assert.text('h1', 'Success!')
              browser.assert.text('p', /Screaming/)
            })
          })

          describe('at level of assurance 2', () => {
            beforeEach(() => {
              return makeAuthnRequest()
                .then(() => getTestCaseUri(TestCaseId.ACCOUNT_CREATION_LOA2))
                .then(uri => testCaseUri = uri)
            })

            it('inserts the user into the database', async () => {
              await browser.visit(testCaseUri)
              const elements = await databaseConnection.manyOrNone(`SELECT * FROM verifiedPid WHERE pid='${latestPid}'`)
              assert.equal(elements.length, 1)
            })

            it('goes to the correct page', async () => {
              await browser.visit(testCaseUri)
              browser.assert.text('h1', 'Success!')
              browser.assert.text('p', /Screaming/)
            })
          })
        })

        describe('On receiving an incorrectly signed response', () => {
          let testCaseUri: string

          before(() => {
            setupComplianceTool('pid')
          })

          beforeEach(() => {
            return makeAuthnRequest()
              .then(() => getTestCaseUri(TestCaseId.BASIC_SUCCESSFUL_MATCH_WITH_ASSERTIONS_SIGNED_BY_HUB))
              .then(uri => testCaseUri = uri)
          })

          it('serves an appropriate error', async () => {
            await browser.visit(testCaseUri)

            browser.assert.text('h1', 'Something went wrong')
            browser.assert.text('p', /There was an error while trying to verify your identity\./)
          })
        })

        function setupComplianceTool (expectedPID: string = 'pid', port: number = testPort) {
          const postData = {
            serviceEntityId: entityId || 'http://verify-service-provider-dev-service',
            assertionConsumerServiceUrl: `http://localhost:${port}/verify/response`,
            signingCertificate: 'MIIC0jCCAboCCQDx9/z+IdVV6DANBgkqhkiG9w0BAQsFADAqMSgwJgYDVQQDEx9WZXJpZnkgU2VydmljZSBQcm92aWRlciBTaWduaW5nMCAXDTE3MDgxMDE1NTUwN1oYDzIxMTcwNzE3MTU1NTA3WjAqMSgwJgYDVQQDEx9WZXJpZnkgU2VydmljZSBQcm92aWRlciBTaWduaW5nMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAvSaDKeyxVC+llVxgvifUGfBi0BQF24Un7Js/mtLt6DSfTtiNtLwkbJLb/Y1hEZtZee5jz5WpE+N3fGL3CFF1wy+ezVPOSEMcP5AJ376dJ4QkMglaDVNE49QHxM58dLdRdbSY/CwGTcyR8ZDOHC6scdgdPjDoM3EhyA79EaNycalxLQv9m01YgAjCzaE+afvO51l8A6wxDoadMZG68Paz9k4PmJyg/zcv3VrsvTL5wMs9qX1UW1F7YQLTEEVLkS04oGIsxWEFhtTDv2Vsif7W2NJLqTjoKrTLKHn7N+aEMGMskJVc7gFFm0EwTKkIt/PrE1BXW7f9iNMvBs39PnkkyQIDAQABMA0GCSqGSIb3DQEBCwUAA4IBAQC47LMMcGr2QXtJlyQsKZGX4SsSzdpVr/1Y5V1soeeRO39jKiYH12z1lh+8OlHF/NcbawEAKZnqkYS0Ka1mE5uKlDmwZ5GtCPYSmD/UVu54zdfrEMhsh7jTM0iong69wx8SfEat7XCt999EFEcIj4OC31X93JX6O0nNx17lzJP+W0jMX8GJSlFeNIYX2r8F83PimC9et949KyEBP0vakqp65Fg1bO9NNlIB17jR4C4OypLD+5gDxshMq9xngqithCNqPpByuS7mmJ+9S/zAIPHhyyYkoHfvLGmc0N6QSqEfUs16RRTLCquumitvUNZxs2Gvqm/RDRfVqviqNRKxlpWe',
            encryptionCertificate: 'MIIC2DCCAcACCQCJmzLC9XOdwzANBgkqhkiG9w0BAQsFADAtMSswKQYDVQQDEyJWZXJpZnkgU2VydmljZSBQcm92aWRlciBFbmNyeXB0aW9uMCAXDTE3MDgxMDE1NTgwNFoYDzIxMTcwNzE3MTU1ODA0WjAtMSswKQYDVQQDEyJWZXJpZnkgU2VydmljZSBQcm92aWRlciBFbmNyeXB0aW9uMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAwCshPm6j+SBjC6i4kSdlFH0H8pLEOe/8gvrUStN0fCsO7fatgyIoXMOQwtTkuAW9cBL0PYPkKBfpFakZmMyZZPvakqH+QrhAaCFVa0uJmlQ4DEVzuURF0wbkz4XZqOoyomLQATtv9zpb2cHfTCS87ejIQ0/wOCHdiJOCPBcgxGjAL8ztEEuAAypgpTrROoThtxTh4FqdOeqiS03NAZcxi7rMbQ8O20tE4MUIkBmFU2yB+UgW33bOSa1in5MwEdvFT4buP8R+rEZ4cD3+K1TeDpT4ssYCCdo4UC/W9+uSIiTOL1UtmBV8kAnUvDg4LNBe5mJ9M1zZvQlXrgCLNd/noQIDAQABMA0GCSqGSIb3DQEBCwUAA4IBAQBEsWIcTeU0OlN2bjKVwtfsB5Eb3Mri/wsYc17Rv0rHSyeudiGphlmHYzPvFBz0dMO6YKjEOrX5a6tkN+PQE9otcjBmY4Ice+LlrJ4Vmu1dsG60S/e5lZCYE2BOY0Jpdjk4aJQeMOfyDrJUmjUWzmx+U1IdK6uuatS7+iJdR/z1FwZt+aEqaO+oVxFuBU32z+x/B/l3c5IqIuZePaYcWBFaCQzPAig9EXO3nNwcwRiDWd11nhWshVr5pTMRgSqLXMl/j4RLvr4FYg3sV5MqRqxNBjW5hl64UNfIzmD794yO8Spqgn4BZouOMCZ7Zo+GE/fcZVLhDwRMU3qgmHZBS8jk',
            expectedPID: expectedPID,
            matchingServiceEntityId: 'https://verify-service-provider-stub-msa',
            matchingServiceSigningPrivateKey: 'MIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQDQaRaD5w0JythQx5tm26o/V7pmCCZCKydK0dQN73loe39MmbLiKHQlif+h74qC45dBY5tPeq0r1qmTN6HxudADVeQHNHmLDwVJLeJJ8+8GbzZcQPCsvEERY0b0/PVINV9qdGjjeqD4uK15VVWgNwx0Lo4SCufKRZKrazfJtYWk/MrBaoYQ7MEoElaHjMfjMiCsO4YUXi114b2I8fvd0ksz9iFELHZPhVsG19Kprm/ntofnJRJa/v9unK0xLNUt1h22l4jFDbddg5/2qm5oDIy7TgaYR6oT1oGE9TNJ40oo0CwMIMCSQwzDhUBYMAsdBywZQkjPxI6vdGXXfRJ4JHeZAgMBAAECggEABsrmCPaG3kLWOgvHbNrL+bSKRrkNRirR5QZhuvKLKnSb+Yso4WYgIvkUc9qy0QFJ9L+iWDzPWBZvAHVXueEsfm9WN0XmkDm1GmV8cpyYtcT6KJeVQIwCMubhcSqtc+UJbxbMNF3S0UhznvjBCa/BoCfESaJBW75YwW2FK/XWnUHw5N6YJ2T1joZD5FfBMKdnwSR/7C0IH1z4D9IW/cg9RM3VZNjxC9UU5a5E1ndoCdLc7MxBm+zH8M1dC+NOMhqR/iFMcwrF8LsaU3EtbnisVYvbZEQremb+WVrfL+n0PhFMUcoCFkC5eSukRPQ3bN931gUC7EcFlSaeHiPRsaD8YQKBgQD0r/AqfZKnbYCp9vg1rCJU/FiQT/xBz7sWowPQow155iN4jUT22nHiwPnn75qbgRXBiHQkfhUtIWouURn3nzMp81m38cLvkNNUHltAPmXxbANf5nI624uGEKXnCX5uD5efe/cUNLKGA7fnONOhph2m0rKkjAqyqEuOUfU6zC8Q6wKBgQDaC8lWEFeW6g0R4pmpLWb/ZYyKTOW4TkoyTyQBDsGTVhSNi/UsbaFI9egpcLMrgSByCTdaL5AwjcKS3DJBlUGfTd+LRXuPxOSp+111J/XZ2GCXVszV+5eYp/BPwLySRKlmzMSI28oWV6N3u5ZfvvR2PGRh8+mTniWS4GJ4GPDYiwKBgEAipZbdl0UfZKwoOeMHnXAdPLGG5Z3ybx192RAkzPF4qy98B+mUVGmVH2v119aOvT8fHyI5kh9kNMqzI1VOe0CxsoCOdAQLN/lCg7SRJnNjVncaljJrPWUElBe821DJ8XoyKg83yNtruhZ3RLGIMxl4/K44rs0pY7SIMvkYb/XFAoGBAINMpaiVnqjZt5UVhsJA/My+Mar2Mz6Qpk01KtEYOainJSk3JiPiwERXD74khz+jOg5xTkuYaJNUSd51ii3D2wg6tGoBJS6luaxCGTz7GyhbC48WTbJtFhRuzF66CNNrVTb6Bz8CWuapT15CL4LoUf0A0NHLNtQVXzras3DuU9mRAoGBAJfTmPTFnoEkygCo5qAFB/4sm4DYRLIVztImAeD9cwkJG8XEVgj49VWH1Xv8chtavhBnayounHzRfAe/5s+4V12GT9kEGxAnSymqJrlbtMFxZGtNUJpIrslt4KbXnoZCnk/H+2xDog7K9wCxup9PWkUrrNDVu630UgMnTM3wvn42',
            useSimpleProfile: false,
            userAccountCreationAttributes: [
              'FIRST_NAME',
              'FIRST_NAME_VERIFIED',
              'MIDDLE_NAME',
              'MIDDLE_NAME_VERIFIED',
              'SURNAME',
              'SURNAME_VERIFIED',
              'DATE_OF_BIRTH',
              'DATE_OF_BIRTH_VERIFIED',
              'CURRENT_ADDRESS',
              'CURRENT_ADDRESS_VERIFIED',
              'ADDRESS_HISTORY',
              'CYCLE_3'
            ]
          }

          return request({
            uri: `${COMPLIANCE_TOOL_HOST}/service-test-data`,
            method: 'POST',
            json: true,
            body: postData
          })
        }

        async function makeAuthnRequest (): Promise<void> {
          await browser.visit(`http://localhost:${testPort}`)
          await browser.clickLink('Start')
          browser.assert.status(200)
          browser.assert.url(`${COMPLIANCE_TOOL_HOST}/SAML2/SSO`)
          browser.assert.text('body', /"status" : "PASSED"/)
          return Promise.resolve()
        }

        async function getTestCaseUri (testCaseId: number): Promise<string> {
          const authnResponseJson = JSON.parse(browser.window.document.body.textContent)
          await browser.visit(authnResponseJson.responseGeneratorLocation)

          const responseGeneratorResponseJson = JSON.parse(browser.window.document.body.textContent)
          return responseGeneratorResponseJson.testCases.find((testCase: any) => testCase.id === testCaseId).executeUri
        }
      })
    })
  })
})
