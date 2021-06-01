const express = require('express');
const multer = require('multer');
const sharp = require('sharp');
const User = require('../models/user');
const auth = require('../middleware/auth');
const { sendWelcomeEmail, sendCancelEmail } = require('../emails/account');
const router = new express.Router();

//?USER Create new user endpoint
router.post('/users', async (req, res) => {
  const user = new User(req.body);
  //res.send('testing!');

  try {
    await user.save();
    sendWelcomeEmail(user.email, user.name);
    const token = await user.generateAuthToken();
    res.status(201).send({ user, token });
  } catch (error) {
    res.status(400).send(error);
  }
});

//?LOGIN users endpoint
router.post('/users/login', async (req, res) => {
  try {
    const email = req.body.email;
    const password = req.body.password;
    //findByCredentials is defined by us
    const user = await User.findByCredentials(email, password);
    //method of user with lowercase not uppercase!
    const token = await user.generateAuthToken();
    res.send({ user, token });
  } catch (error) {
    res.status(400).send();
  }
});

//?LOGOUT USER
router.post('/users/logout', auth, async (req, res) => {
  try {
    req.user.tokens = req.user.tokens.filter((token) => {
      return token.token !== req.token;
    });
    await req.user.save();
    res.send();
  } catch (error) {
    res.status(500).send();
  }
});

//?LOGOUT ALL SESSIONS
router.post('/users/logoutAll', auth, async (req, res) => {
  try {
    req.user.tokens = [];
    await req.user.save();
    res.send();
  } catch (error) {
    res.status(500).send();
  }
});

//?FETCH users own profile
router.get('/users/me', auth, async (req, res) => {
  res.send(req.user);
});

//?USER Updating user endpoint
router.patch('/users/me', auth, async (req, res) => {
  //Allowing certain keys to be updated
  const updates = Object.keys(req.body);
  const allowedUpdates = ['name', 'email', 'password', 'age'];
  const isValidOperation = updates.every((update) =>
    allowedUpdates.includes(update)
  );
  if (!isValidOperation) {
    return res.status(400).send({ error: 'Invalid updates' });
  }

  try {
    //This is correct the way for executing a middleware
    updates.forEach((update) => (req.user[update] = req.body[update]));
    //this is out middleware will be executed
    await req.user.save();

    res.send(req.user);
  } catch (error) {
    res.status(400).send(error);
  }
});

//?USER deleting user endpoint
router.delete('/users/me', auth, async (req, res) => {
  try {
    // const user = await User.findByIdAndDelete(_id);
    // if (!user) {
    //   return res.status(404).send();
    // }

    await req.user.remove();
    sendCancelEmail(req.user.email, req.user.name);
    res.send(req.user);
  } catch (error) {
    res.status(500).send();
  }
});

//?UPLOAD image file
//image validation, multer npm package takes care of that
const upload = multer({
  //file size limit
  limits: {
    fileSize: 1000000,
  },
  //File type filter
  fileFilter(req, file, cb) {
    if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
      return cb(new Error('Bitte laden Sie eine Bilddatei hoch!'));
    }
    cb(undefined, true);
  },
});

router.post(
  '/users/me/avatar',
  auth,
  upload.single('avatar'),
  async (req, res) => {
    //sharp npm module for !MODIFYING THE IMAGE
    const buffer = await sharp(req.file.buffer)
      .resize({ width: 250, height: 250 })
      .png()
      .toBuffer();

    req.user.avatar = buffer;

    await req.user.save();
    res.send();
  },
  //error handling for file uploads, so it sends back json data and not an html page
  (error, req, res, next) => {
    res.status(400).send({ error: error.message });
  }
);

//? DELETE image file
router.delete('/users/me/avatar', auth, async (req, res) => {
  req.user.avatar = undefined;
  await req.user.save();
  res.send();
});

//? FETCH image file
router.get('/users/:id/avatar', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user || !user.avatar) {
      throw new Error();
    }
    //set response header
    res.set('Content-Type', 'image/png');
    res.send(user.avatar);
  } catch (error) {
    res.status(404).send();
  }
});

module.exports = router;
