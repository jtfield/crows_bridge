import passport from 'passport';
import cookieSession from 'cookie-session';
import url from 'url';
import redirect from 'micro-redirect';
import SteamStrategy from 'passport-steam';
import { mySQLClient } from './mysql';

const createSteamStrategy = (callback) => {
  const hostname = process.env.VERCEL_ENV === 'production' ? 'https://crowsbridge.net' : 'http://localhost:3000';

  const steamStrategy = new SteamStrategy(
    {
      returnURL: `${hostname}/api/auth/return`,
      realm: `${hostname}/`,
      apiKey: process.env.STEAM_KEY,
    },
    callback
  );
  return steamStrategy;
};

// Function to generate random strings of characters for a specific length
function makePw(length) {
  let result = '';
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
  const charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

passport.use(
  createSteamStrategy(async (identifier, profile, done) => {
    try {
      const existingUser = await mySQLClient.query(`
        SELECT * FROM metaserver_login_tokens where steam_id = ${profile.id}
      `);

      if (!existingUser) {
        const password = makePw(6);
        const rowNum = await mySQLClient.query(`
          SELECT COUNT(*) from metaserver_users
        `);

        const newLoginNum = (1 + Number(rowNum)).toString;

        const newLogin = `u${newLoginNum}`;

        await mySQLClient.query(`
          INSERT INTO metaserver_users (nick_name, team_name, city, state, country, quote)
          VALUES('default', 'default\'s Team', 'default', 'default', 'default', 'default')
        `);

        const insertedUser = await mySQLClient.query(`
          INSERT INTO metaserver_login_tokens (steam_id, user_name_token, password_token)
          VALUES(${profile.id}, ${newLogin}, ${password})
        `);

        return done(null, insertedUser);
      }

      // If profile does exist: query the tokens and return some stuff
      const username = existingUser[0].user_name_token;
      const userpw = existingUser[0].password_token;

      // return done(null, { id: profile.id });
      return done(null, { steamid: profile.id, uname: username, upw: userpw });
    } catch (err) {
      // something went wrong, return an error back.
      return done(err);
    }
    // return done(null, { id: profile.id });
  })
);

// Configure Passport authenticated session persistence.
//
// In order to restore authentication state across HTTP requests, Passport needs
// to serialize users into and deserialize users out of the session.  In a
// production-quality application, this would typically be as simple as
// supplying the user ID when serializing, and querying the user record by ID
// from the database when deserializing.  However, due to the fact that this
// example does not have a database, the complete Github profile is serialized
// and deserialized.
passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser(async (serializedUser, done) => {
  if (!serializedUser) {
    return done(new Error(`User not found: ${serializedUser}`));
  }

  return done(null, serializedUser);
});

const onError = (res) => (err) => {
  /* eslint-disable-next-line no-console */
  console.error('Unhandled error with Passport Middleware', err);
  res.redirect('/');
};

// export middleware to wrap api/auth handlers
export const passportMiddleware = (fn) => (req, res, next) => {
  if (!res.redirect) {
    // passport.js needs res.redirect:
    // https://github.com/jaredhanson/passport/blob/1c8ede/lib/middleware/authenticate.js#L261
    // Monkey-patch res.redirect to emulate express.js's res.redirect,
    // since it doesn't exist in micro. default redirect status is 302
    // as it is in express. https://expressjs.com/en/api.html#res.redirect
    res.redirect = (location) => redirect(res, 302, location);
  }

  // Initialize Passport and restore authentication state, if any, from the
  // session. This nesting of middleware handlers basically does what app.use(passport.initialize())
  // does in express.
  cookieSession({
    name: 'passportSession',
    signed: false,
    domain: url.parse(req.url).host,
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
  })(req, res, () =>
    passport.initialize()(req, res, () =>
      passport.session()(req, res, () =>
        // call wrapped api route as innermost handler
        fn(req, res, next || onError(res))
      )
    )
  );
};
