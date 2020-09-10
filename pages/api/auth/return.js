import passport from 'passport';
import { passportMiddleware } from '../../../util/passport';

const handler = async (req, res) => {
  await passport.authenticate('steam', {
    failureRedirect: '/auth',
    successRedirect: '/account',
  })(req, res, (err) => {
    /* eslint-disable-next-line no-console */
    console.log('Steam authentication failed:', err);
    res.redirect('/account?authError=true');
  });
};

export default passportMiddleware(handler);

export const config = {
  api: {
    externalResolver: true,
  },
};
