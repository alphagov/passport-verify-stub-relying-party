import * as express from 'express'
import * as passport from 'passport'
import PassportVerifyStrategy from 'passport-verify'

const app: express.Application = express()

passport.use(new PassportVerifyStrategy({

}))

app.get('/verify/start', passport.authenticate('passport-verify'))

export default app
