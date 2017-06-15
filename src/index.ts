import createApp from './app'

const options = {
  verifyServiceProviderHost: 'http://localhost:1337'
}
createApp(options).listen(3200, function () {
  console.log('Stub RP app listening on port 3200!')
})
