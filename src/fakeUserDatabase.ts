import { TranslatedResponseBody } from 'passport-verify'

const defaultUser: TranslatedResponseBody = {
  pid: 'pid',
  levelOfAssurance: 'LEVEL_2',
  attributes: {
    firstName: {
      value: 'Default',
      verified: true
    },
    middleName: {
      value: '',
      verified: false
    },
    surname: {
      value: 'User',
      verified: true
    },
    dateOfBirth: {
      value: '1950-01-01',
      verified: true
    },
    address: {
      value: {
        internationalPostCode: 'E1 8DX',
        uprn: '10002324314',
        postCode: 'E1 8DX',
        lines: ['The White Chapel Building', '10 Whitechapel High St', 'London']
      },
      verified: true
    },
    cycle3: '0893450982345'
  }
}

const billy: TranslatedResponseBody = {
  pid: 'billy',
  levelOfAssurance: 'LEVEL_1',
  attributes: {
    firstName: {
      value: 'Billy',
      verified: true
    },
    middleName: {
      value: '',
      verified: false
    },
    surname: {
      value: 'Batson',
      verified: true
    },
    dateOfBirth: {
      value: '1950-01-01',
      verified: true
    },
    address: {
      value: {
        internationalPostCode: 'E1 8DX',
        uprn: '10002324314',
        postCode: 'E1 8DX',
        lines: ['The Blue Chapel Building', '10 Whitechapel High St', 'London']
      },
      verified: true
    },
    cycle3: '0893450982345'
  }
}

const clark: TranslatedResponseBody = {
  pid: 'clark',
  levelOfAssurance: 'LEVEL_2',
  attributes: {
    firstName: {
      value: 'Clark',
      verified: true
    },
    middleName: {
      value: '',
      verified: false
    },
    surname: {
      value: 'Kent',
      verified: true
    },
    dateOfBirth: {
      value: '1950-01-01',
      verified: true
    },
    address: {
      value: {
        internationalPostCode: 'E1 8DX',
        uprn: '10002324314',
        postCode: 'E1 8DX',
        lines: ['The Orange Chapel Building', '10 Whitechapel High St', 'London']
      },
      verified: true
    },
    cycle3: '0893450982345'
  }
}

const bruce: TranslatedResponseBody = {
  pid: 'bruce',
  levelOfAssurance: 'LEVEL_2',
  attributes: {
    firstName: {
      value: 'Bruce',
      verified: true
    },
    middleName: {
      value: '',
      verified: false
    },
    surname: {
      value: 'Banner',
      verified: true
    },
    dateOfBirth: {
      value: '1950-01-01',
      verified: true
    },
    address: {
      value: {
        internationalPostCode: 'E1 8DX',
        uprn: '10002324314',
        postCode: 'E1 8DX',
        lines: ['The Puce Chapel Building', '10 Whitechapel High St', 'London']
      },
      verified: true
    },
    cycle3: '0893450982345'
  }
}

const users: any = {
  pid: defaultUser,
  billy: billy,
  clark: clark,
  bruce: bruce
}
export default users
