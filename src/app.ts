import * as express from 'express'
import * as passport from 'passport'
import { createStrategy } from 'passport-verify'

export default function (options: any) {
  const app: express.Application = express()

  passport.use(createStrategy({
    verifyServiceProviderHost: options.verifyServiceProviderHost
  }))

  app.get('/verify/start', (req, res, next) => {
    passport.authenticate('passport-verify')(req, res, next)
  })
  return app
}
