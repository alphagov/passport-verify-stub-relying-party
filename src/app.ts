import * as express from 'express'
import * as session from 'express-session'
import * as passport from 'passport'
import { createStrategy } from 'passport-verify'
import * as bodyParser from 'body-parser'
import * as nunjucks from 'nunjucks'

const fakeUserDatabase: any = {
  pid: { firstname: 'Default', surname: 'User' },
  billy: { firstname: 'Billy', surname: 'Batson' },
  clark: { firstname: 'Clark', surname: 'Kent' },
  bruce: { firstname: 'Bruce', surname: 'Banner' }
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

  _passport.serializeUser = (user: any, req: any, done: any) => done(null, user.pid)
  _passport.deserializeUser = (id: any, req: any, done: any) => done(null, fakeUserDatabase[id])

  passport.use(createStrategy({ verifyServiceProviderHost: options.verifyServiceProviderHost }))

  app.get('/', (req, res) => res.render('index.njk'))
  app.get('/verify/start', passport.authenticate('verify'))
  app.post('/verify/response', passport.authenticate('verify', {
    successRedirect: '/service-landing-page'
  }))

  const redirectIfNoSession = (req: express.Request, res: express.Response, next: express.NextFunction) => {
    if (!req.user) res.redirect('/')
    else next()
  }
  app.get('/service-landing-page', redirectIfNoSession, (req, res) => {
    res.render('service-landing-page.njk', { user: req.user })
  })

  return app
}
