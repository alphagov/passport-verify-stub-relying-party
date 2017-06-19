import * as express from 'express'
import * as session from 'express-session'
import * as passport from 'passport'
import { createStrategy } from 'passport-verify'
import * as bodyParser from 'body-parser'

const fakeUserDatabase: any = {
  billy: { firstname: 'Billy', surname: 'Batson' },
  clark: { firstname: 'Clark', surname: 'Kent' },
  bruce: { firstname: 'Bruce', surname: 'Banner' }
}

export function createApp (options: any) {
  const _passport: any = passport
  const app: express.Application = express()

  app.use(bodyParser.urlencoded({extended: false}))
  app.use(session({
    secret: 'maximum security keyboard cat',
    resave: true,
    saveUninitialized: true
  }))
  app.use(passport.initialize())
  app.use(passport.session())

  _passport.serializeUser = (user: any, req: any, done: any) => done(null, user.pid)
  _passport.deserializeUser = (id: any, req: any, done: any) => done(null, fakeUserDatabase[id])

  passport.use(createStrategy({ verifyServiceProviderHost: options.verifyServiceProviderHost }))

  app.get('/verify/start', passport.authenticate('passport-verify'))
  app.post('/verify/response', passport.authenticate('passport-verify', {
    successRedirect: '/service-landing-page'
  }))
  app.get('/service-landing-page', (req, res) => {
    res.send(`Hello ${req.user.firstname} ${req.user.surname} you are logged in`)
  })

  return app
}
