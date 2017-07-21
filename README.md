Passport-verify-stub-relying-party
==================================

[![Build Status](https://travis-ci.org/alphagov/passport-verify-stub-relying-party.svg?branch=master)](https://travis-ci.org/alphagov/passport-verify-stub-relying-party)

Usage
-----

passport-verify-stub-relying-party uses `yarn` to manage dependencies. See https://yarnpkg.com/en/

Install the dependencies with:

```
yarn install
```

Run the tests with:

```
./pre-commit.sh
```

Start the application with:

```
./startup.sh
```

Run acceptance-tests with:

```
VERIFY_SERVICE_PROVIDER_HOST=http://localhost:50400 \
  COMPLIANCE_TOOL_URL=https://compliance-tool-reference.ida.digital.cabinet-office.gov.uk/SAML2/SSO \
  npm run acceptance-tests
```
