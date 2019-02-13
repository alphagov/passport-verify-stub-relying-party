import { TranslatedResponseBody } from 'passport-verify'
import * as Debug from 'debug'
const debug = Debug('passport-verify-stub-db-wrapper')

const pgp = require('pg-promise')()

export class DatabaseWrapper {
  private db: any

  constructor (databaseConnection: any) {
    this.db = databaseConnection
  }

  public static getDatabaseWrapper (connectionString: string): DatabaseWrapper {
    debug(connectionString)
    const connection = pgp(connectionString)
    return new DatabaseWrapper(connection)
  }

  public async fetchVerifiedUser (pid: string): Promise<object> {
    debug(`fetchingVerifiedUser: ${pid}`)
    return this.db.one('SELECT person FROM verifiedPid WHERE pid=$1', pid, (result: any) => result && result.person)
      .then((data: any) => {
        if (data === null) {
          debug (
            `An error occured while attempting to retrieve user with pid ${pid} from the database:
            The local matching service returned a match, but the pid could not be found in the database.`
          )
          throw new Error(
            `An error occured while attempting to retrieve user with pid ${pid} from the database:
            The local matching service returned a match, but the pid could not be found in the database.`
          )
        }

        return this.db.one('SELECT * from person INNER JOIN address ON (person.address = address.address_id) WHERE person_id=$1', data)
          .then((data: any) => this.transformFetchedData(pid, data))
      })
      .catch((error: any) => {
        debug(
          `An error occured while attempting to retrieve user with pid ${pid} from the database:
            ${error}`
        )
        throw new Error (
            `An error occured while attempting to retrieve user with pid ${pid} from the database:
            ${error}`
        )
      })
  }

  public async createUser (data: TranslatedResponseBody): Promise<object> {
    return this.db.none(
        'WITH newAddress AS (' +
        'INSERT INTO address (lines, postcode) ' +
        'VALUES (${attributes.address.lines}, ${attributes.address.postcode}) ' +
        'RETURNING address_id), newPerson AS (' +
        'INSERT INTO person (first_name, middle_name, surname, date_of_birth, address) ' +
        'VALUES (${attributes.firstName}, ${attributes.middleName}, ${attributes.surname}, ' +
        '${attributes.dateOfBirth}, (SELECT address_id FROM newAddress)) RETURNING person_id)' +
        'INSERT INTO verifiedPid (pid, person) VALUES (${pid}, (SELECT person_id FROM newPerson));',
       this.createDatabaseInsertObject(data)
      ).then(() => {
        return this.fetchVerifiedUser(data.pid)
      }).catch((error: any) => {
        throw new Error (
          `An error occured while attempting to insert new user record with pid ${data.pid} into the database:
          ${error}`
        )
      })
  }

  private transformFetchedData (pid: string, data: any): object {
    return {
      pid: pid,
      id: data.person_id,
      attributes: {
        firstName: data.first_name,
        middleName: data.middle_name,
        surname: data.surname,
        dateOfBirth: data.date_of_birth,
        address: {
          id: data.address_id,
          lines: data.lines.split(','),
          city: data.city,
          country: data.country,
          postcode: data.postcode
        }
      }
    }
  }

  private createDatabaseInsertObject (data: TranslatedResponseBody): object {
    if (data.attributes === undefined) {
      throw new Error(`An error occured - Attempting to do user account creation with no attributes present`)
    }

    return {
      pid: data.pid,
      attributes: {
        firstName: data.attributes.firstName ? data.attributes.firstName.value : null,
        middleName: data.attributes.middleName ? data.attributes.middleName.value : null,
        surname: data.attributes.surname ? data.attributes.surname.value : null,
        dateOfBirth: data.attributes.dateOfBirth ? data.attributes.dateOfBirth.value : null,
        address: {
          lines: data.attributes.address && data.attributes.address.value && data.attributes.address.value.lines ? data.attributes.address.value.lines.join(',') : null,
          postcode: data.attributes.address && data.attributes.address.value && data.attributes.address.value.postCode ? data.attributes.address.value.postCode : null
        }
      }
    }
  }
}
