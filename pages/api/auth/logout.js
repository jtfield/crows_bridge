import { passportMiddleware } from '../../../util/passport';

const handler = async (req, res) => {
  req.logout();
  res.redirect('/account');
};

export default passportMiddleware(handler);

export const config = {
  api: {
    externalResolver: true,
  },
};
