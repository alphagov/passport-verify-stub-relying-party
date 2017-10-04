import { createApp } from './app'

const verifyServiceProviderHost = process.env.VERIFY_SERVICE_PROVIDER_HOST || 'http://localhost:50400'
const serviceEntityId = process.env.ENTITY_ID || null

const server = createApp(verifyServiceProviderHost, serviceEntityId).listen(process.env.PORT || 3200, function () {
  console.log(`Entity Id set to ${serviceEntityId !== null ? serviceEntityId : 'null (will use verify service provider default)'}`)
  console.log(`Stub RP app listening on port ${server.address().port}!`)
})
