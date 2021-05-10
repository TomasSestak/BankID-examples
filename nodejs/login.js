import express from 'express';
import passport from 'passport';
import session from 'express-session';
import jwt from 'jsonwebtoken';
import { Strategy, Issuer } from 'openid-client';

const CLIENT_ID = '72fda011-0479-4a4c-9fff-0a6c7f584e1e';
const CLIENT_SECRET =
  'TsGlMQro488YSwc0h9NWydZAqHir13PPW2cDMEQBcLgFvaGOnXzOt9MWBhTDBEU7PaXtn9H7Y0QHdcVZolJOsg';
const SCOPE = 'openid';

const bankidIssuer = await Issuer.discover('https://oidc.sandbox.bankid.cz/');
const bankidClient = new bankidIssuer.Client({
  client_id: CLIENT_ID,
  client_secret: CLIENT_SECRET,
  redirect_uris: ['http://localhost:3000/'],
  response_types: ['code'],
  id_token_signed_response_alg: 'PS512',
});

passport.use(
  'bankid',
  new Strategy(
    {
      client: bankidClient,
      params: {
        scope: SCOPE,
      },
    },
    async (tokenSet, done) => {
      const idToken = jwt.decode(tokenSet.id_token);
      return done(null, { sub: idToken.sub });
    }
  )
);

passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((user, done) => done(null, user));

const app = express();
app.use(
  session({
    secret: 'secret',
    resave: false,
    saveUninitialized: false,
  })
);
app.use(passport.initialize());
app.use(passport.session());

app.get('/', passport.authenticate('bankid'), (req, res) => res.json(req.user));

app.listen(3000, () => console.info('Listening on port 3000'));
