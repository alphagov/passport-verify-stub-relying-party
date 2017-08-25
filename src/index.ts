import { createApp } from './app'

const verifyServiceProviderHost = process.env.VERIFY_SERVICE_PROVIDER_HOST || 'http://localhost:50400'

const server = createApp(verifyServiceProviderHost).listen(process.env.PORT || 3200, function () {
  console.log(`Stub RP app listening on port ${server.address().port}!`)
})
