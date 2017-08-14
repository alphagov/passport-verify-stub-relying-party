interface User {
  pid: string,
  attributes: object
}

const defaultUser: User = {
  pid: 'pid',
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

const billy: User = {
  pid: 'billy',
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

const clark: User = {
  pid: 'clark',
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

const bruce: User = {
  pid: 'bruce',
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
