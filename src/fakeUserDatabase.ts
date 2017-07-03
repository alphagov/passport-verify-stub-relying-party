const defaultUser = {
  id: 'pid',
  firstName: 'Default',
  firstNameVerified: true,
  middleName: '',
  middleNameVerified: false,
  surname: 'User',
  surnameVerified: true,
  dateOfBirth: '1950-01-01',
  dateOfBirthVerified: true,
  address: {
    internationalPostCode: 'E1 8DX',
    uprn: '10002324314',
    verified: true,
    postCode: 'E1 8DX',
    lines: ['The White Chapel Building', '10 Whitechapel High St', 'London']
  },
  cycle3: '0893450982345'
}

const billy = {
  id: 'billy',
  firstName: 'Billy',
  firstNameVerified: true,
  middleName: '',
  middleNameVerified: false,
  surname: 'Batson',
  surnameVerified: true,
  dateOfBirth: '1950-01-01',
  dateOfBirthVerified: true,
  address: {
    internationalPostCode: 'E1 8DX',
    uprn: '10002324314',
    verified: true,
    postCode: 'E1 8DX',
    lines: ['The Blue Chapel Building', '10 Whitechapel High St', 'London']
  },
  cycle3: '0893450982345'
}

const clark = {
  id: 'clark',
  firstName: 'Clark',
  firstNameVerified: true,
  middleName: '',
  middleNameVerified: false,
  surname: 'Kent',
  surnameVerified: true,
  dateOfBirth: '1950-01-01',
  dateOfBirthVerified: true,
  address: {
    internationalPostCode: 'E1 8DX',
    uprn: '10002324314',
    verified: true,
    postCode: 'E1 8DX',
    lines: ['The Orange Chapel Building', '10 Whitechapel High St', 'London']
  },
  cycle3: '0893450982345'
}

const bruce = {
  id: 'bruce',
  firstName: 'Bruce',
  firstNameVerified: true,
  middleName: '',
  middleNameVerified: false,
  surname: 'Banner',
  surnameVerified: true,
  dateOfBirth: '1950-01-01',
  dateOfBirthVerified: true,
  address: {
    internationalPostCode: 'E1 8DX',
    uprn: '10002324314',
    verified: true,
    postCode: 'E1 8DX',
    lines: ['The Puce Chapel Building', '10 Whitechapel High St', 'London']
  },
  cycle3: '0893450982345'
}

const users: any = {
  pid: defaultUser,
  billy: billy,
  clark: clark,
  bruce: bruce
}
export default users
