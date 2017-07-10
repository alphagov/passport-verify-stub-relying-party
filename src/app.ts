import * as express from 'express'
import * as session from 'express-session'
import * as passport from 'passport'
import { createStrategy } from 'passport-verify'
import * as bodyParser from 'body-parser'
import * as nunjucks from 'nunjucks'
import fakeUserDatabase from './fakeUserDatabase'

export function createApp (options: any) {
  const _passport: any = passport
  const app: express.Application = express()

  nunjucks.configure([
    './src/views',
    './node_modules/govuk_template_jinja/views'
  ], {
    autoescape: true,
    express: app
  }).addGlobal('asset_path', '/')

  app.use(express.static('./src/assets'))
  app.use(express.static('./node_modules/govuk_template_jinja/assets'))

  app.use(bodyParser.urlencoded({extended: false}))
  app.use(session({
    secret: 'maximum security keyboard cat',
    resave: true,
    saveUninitialized: true
  }))
  app.use(passport.initialize())
  app.use(passport.session())

  // Define how the user-object is de/serialized into the session
  // so that it is available across requests
  // this could a db for a session store instead of serializing the whole user-object into the session
  _passport.serializeUser((user: any, done: any) => done(null, JSON.stringify(user)))
  _passport.deserializeUser((user: any, done: any) => done(null, JSON.parse(user)))

  passport.use(createStrategy({

    verifyServiceProviderHost: options.verifyServiceProviderHost,

    logger: options.logger,

    // A callback for finding or creating the user from the
    // application's database.
    // This function is called at the end of the authentication flow and
    // it should either return a user object or false if the user is not
    // accepted by the application for whatever reason. It can also return a
    // Promise in case it is asynchronous.
    acceptUser: (user) => {

      // A new user will be given with an attributes object that
      // describe the user details. Users that are already known by
      // the application will not have an attributes-field.
      // Whether a user is new or not will be defined by the local matching
      // strategy of the application. See Verify Integration guides for further
      // details on local matching.
      if (user.attributes) {

        if (fakeUserDatabase[user.pid]) {
          // This should be an error case if the local matching strategy is
          // done correctly.
          throw new Error('User PID already exists')
        }
        fakeUserDatabase[user.pid] = Object.assign({id: user.pid}, user.attributes)
      }

      if (!fakeUserDatabase[user.pid]) {
        // This should be an error case if the local matching strategy is
        // done correctly.
        throw new Error('Local matching stragey has defined that the user exists, but the PID could not be found in the database.')
      }

      return Object.assign({ levelOfAssurence: user.levelOfAssurance }, fakeUserDatabase[user.pid])
    }
  }))

  app.get('/', (req, res) => res.render('index.njk'))
  app.get('/verify/start', passport.authenticate('verify'))

  app.post('/verify/response', (req, res, next) => {
    (passport.authenticate('verify', function (error: Error, user: any, infoOrError: any, status: number) {

      if (error) {
        return res.render('error-page.njk', { error: error.message })
      }

      if (user) {
        return req.logIn(user, () => res.redirect('/service-landing-page'))
      }

      return res.render('authentication-failed-page.njk', { error: infoOrError })

    }))(req, res, next)
  })

  const redirectIfNoSession = (req: express.Request, res: express.Response, next: express.NextFunction) => {
    if (!req.user) res.redirect('/')
    else next()
  }

  app.get('/service-landing-page', redirectIfNoSession, (req, res) => {
    res.render('service-landing-page.njk', { user: req.user })
  })

  app.get('/authentication-failed-page', (req, res) => {
    res.render('authentication-failed-page.njk', {})
  })

  return app
}
