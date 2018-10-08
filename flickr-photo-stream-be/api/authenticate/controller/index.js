const { getUserByEmail } = require('./../../users/controller');
const { verifyPassword } = require('./../../users/util');
const { createToken } = require('./../util');
const jwtDecode = require('jwt-decode');

const postAuthenticate = async (req, res) => {
  try {
    const userEmail = req.body.email;
    const password = req.body.password;

    const user = await getUserByEmail(userEmail);
    const passwordValid = await verifyPassword(password, user.password);

    if (passwordValid) {
      req.session.user = { email: user.email };
      req.session.isAuthenticated = true;

      const token = createToken(user);
      const decodedToken = jwtDecode(token);
      const expiresAt = decodedToken.exp;

      const userInfo = {
        email: user.email,
        role: user.role
      };

      res.cookie('token', token, { maxAge: 360000, httpOnly: true });

      res.json({
        message: 'Authentication successful!',
        token,
        userInfo,
        expiresAt
      });
    } else {
      res.status(403).json({ message: 'Wrong username, email, or password.' });
    }
  } catch (err) {
    console.log(err);
    return res.status(400).json({ message: 'Something went wrong.' });
  }
};

module.exports = { postAuthenticate };
