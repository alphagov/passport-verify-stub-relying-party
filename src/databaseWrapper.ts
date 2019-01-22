import { TranslatedResponseBody } from 'passport-verify-non-matching'

const pgp = require('pg-promise')()

export class DatabaseWrapper {
  private db: any

  constructor (databaseConnection: any) {
    this.db = databaseConnection
  }

  public static getDatabaseWrapper (connectionString: string): DatabaseWrapper {
    const connection = pgp(connectionString)
    return new DatabaseWrapper(connection)
  }

  public async fetchVerifiedUser (pid: string): Promise<object> {
    return this.db.one('SELECT person FROM verifiedPid WHERE pid=$1', pid, (result: any) => result && result.person)
      .then((data: any) => {
        if (data === null) {
          throw new Error(
            `An error occured while attempting to retrieve user with pid ${pid} from the database:
            The local matching service returned a match, but the pid could not be found in the database.`
          )
        }

        return this.db.one('SELECT * from person INNER JOIN addresses ON (person.addresses = addresses.addresses_id) WHERE person_id=$1', data)
          .then((data: any) => this.transformFetchedData(pid, data))
      })
      .catch((error: any) => {
        throw new Error (
            `An error occured while attempting to retrieve user with pid ${pid} from the database:
            ${error}`
        )
      })
  }

  public async createUser (data: TranslatedResponseBody): Promise<object> {
    return this.db.none(
        'WITH newAddress AS (' +
        'INSERT INTO addresses (lines, postcode) ' +
        'VALUES (${attributes.addresses.lines}, ${attributes.addresses.postcode}) ' +
        'RETURNING addresses_id), newPerson AS (' +
        'INSERT INTO person (first_name, middle_name, surnames, date_of_birth, addresses) ' +
        'VALUES (${attributes.firstName}, ${attributes.middleNames}, ${attributes.surnames}, ' +
        '${attributes.dateOfBirth}, (SELECT addresses_id FROM newAddress)) RETURNING person_id)' +
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
        middleNames: data.middle_name,
        surnames: data.surnames,
        dateOfBirth: data.date_of_birth,
        addresses: {
          id: data.addresses_id,
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
        firstName: data.attributes.firstName ? data.attributes.firstName.value : null
      }
    }
  }
}
