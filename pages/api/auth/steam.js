import passport from 'passport';
import { passportMiddleware } from '../../../util/passport';

const handler = (req, res) => {
  passport.authenticate('steam')(req, res);
};

export default passportMiddleware(handler);

export const config = {
  api: {
    externalResolver: true,
  },
};
