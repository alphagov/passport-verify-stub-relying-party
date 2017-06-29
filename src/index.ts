import { createApp } from './app'

const options = {
  verifyServiceProviderHost: process.env.VERIFY_SERVICE_PROVIDER_HOST || 'http://localhost:50400',
  logger: console
}
createApp(options).listen(process.env.PORT || 3200, function () {
  console.log('Stub RP app listening on port 3200!')
})
