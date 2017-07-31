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

  passport.use(createStrategy(

    options.verifyServiceProviderHost,

    options.logger,

    // A callback for a new user authentication.
    // This function is called at the end of the authentication flow
    // with a user user object that contains details of the user in attributes.
    // it should either return a user object or false if the user is not
    // accepted by the application for whatever reason. It can also return a
    // Promise in case it is asynchronous.
    createUser,

    // A callback for an existing user authentication.
    // This function is called at the end of the authentication flow with
    // an object that contains the user pid.
    // The function should either return a user object or false if the user is not
    // accepted by the application for whatever reason. It can also return a
    // Promise in case it is asynchronous.
    verifyUser,

    // A callback that saves the unique request ID associated with the SAML messages
    // to the user's session.
    // This function is called after the Verify Service Provider has generated and
    // returned the AuthnRequest and associated RequestID.
    // The requestID should be saved in a secure manner, and such that it
    // corresponds to the user's current session and can be retrieved in order to validate
    // that SAML response that is returned from the IDP corresponds to the original AuthnRequest.
    setRequestId,

    getRequestId
  ))

  app.get('/', (req, res) => res.render('index.njk'))
  app.get('/verify/start', passport.authenticate('verify'))

  app.post('/verify/response', (req, res, next) => {
    const authMiddleware = passport.authenticate('verify', function (error: Error, user: any, infoOrError: any, status: number) {
      if (error) {
        return res.render('error-page.njk', { error: error.message })
      }

      if (user) {
        return req.logIn(user, () => res.redirect('/service-landing-page'))
      }

      return res.render('authentication-failed-page.njk', { error: infoOrError })

    })
    authMiddleware(req as any, res as any, next)
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

  function createUser (user: any) {
    // This should be an error case if the local matching strategy is
    // done correctly.
    if (fakeUserDatabase[user.pid]) {
      throw new Error(
        'Local matching strategy has defined ' +
        'the user to be new to the application, ' +
        'but the User PID already exists.')
    }

    fakeUserDatabase[user.pid] = Object.assign({id: user.pid}, user.attributes)
    return Object.assign({ levelOfAssurence: user.levelOfAssurance }, fakeUserDatabase[user.pid])
  }

  function verifyUser (user: any) {
    // This should be an error case if the local matching strategy is
    // done correctly.
    if (!fakeUserDatabase[user.pid]) {
      throw new Error(
        'Local matching strategy has defined ' +
        'that the user exists, but the PID could ' +
        'not be found in the database.')
    }

    return Object.assign({ levelOfAssurence: user.levelOfAssurance }, fakeUserDatabase[user.pid])
  }

  function setRequestId (requestId: string, request: any) {
    // The request Id currently is a UUID (e.g. 0f44aa97-fde9-49d1-b884-b7a449e46e7b)
    // Logic below is to store the request Id in a secure session
    request.session.requestId = requestId
  }

  function getRequestId (request: any) {
    return request.session.requestId
  }

  return app
}
