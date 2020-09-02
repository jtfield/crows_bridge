import passport from 'passport';
import { passportMiddleware } from '../../../util/passport';

const handler = async (req, res) => {
  await passport.authenticate('steam', {
    failureRedirect: '/auth',
    successRedirect: '/account',
  })(req, res);
};

export default passportMiddleware(handler);

export const config = {
  api: {
    externalResolver: true,
  },
};
