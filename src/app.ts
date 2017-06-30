import * as express from 'express'
import * as session from 'express-session'
import * as passport from 'passport'
import { createStrategy } from 'passport-verify'
import * as bodyParser from 'body-parser'
import * as nunjucks from 'nunjucks'

const fakeUserDatabase: any = {
  pid: { id: 'pid', firstName: 'Default', surname: 'User' },
  billy: { id: 'billy', firstName: 'Billy', surname: 'Batson' },
  clark: { id: 'clark', firstName: 'Clark', surname: 'Kent' },
  bruce: { id: 'bruce', firstName: 'Bruce', surname: 'Banner' }
}

export function createApp (options: any) {
  const _passport: any = passport
  const app: express.Application = express()

  nunjucks.configure(['./src/views', './node_modules/govuk_template_jinja/views'], { autoescape: true, express: app })
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

    // A callback for finding or creating the user from the application's database
    acceptUser: (user) => {
      if (!fakeUserDatabase[user.pid] && user.attributes) {
        fakeUserDatabase[user.pid] = {
          id: user.pid,
          firstName: user.attributes.firstName,
          surname: user.attributes.surname
        }
      }
      return Object.assign({ levelOfAssurence: user.levelOfAssurance }, fakeUserDatabase[user.pid])
    }

  }))

  app.get('/', (req, res) => res.render('index.njk'))
  app.get('/verify/start', passport.authenticate('verify'))
  app.post('/verify/response', passport.authenticate('verify', {
    successRedirect: '/service-landing-page',
    failureRedirect: '/authentication-failed-page'
  }))

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
