const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const validator = require('validator');
const jwt = require('jsonwebtoken');
const Task = require('./task');

//We need this to be able to do some advanced stuff, like creating middleware, to hash passwords
const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      unique: true,
      required: true,
      trim: true,
      lowercase: true,
      validate(value) {
        if (!validator.isEmail(value)) {
          throw new Error('Email is invalid');
        }
      },
    },
    password: {
      type: String,
      required: true,
      trim: true,
      minlength: 7,
      validate(value) {
        if (value.toLowerCase().includes('password')) {
          throw new Error('Passwort ist ungültig');
        }
      },
    },
    age: {
      type: Number,
      default: 0,
      validate(value) {
        if (value < 0) {
          throw new Error('Alter muss eine positive Zahl sein');
        }
      },
    },
    tokens: [
      {
        token: {
          type: String,
          required: true,
        },
      },
    ],
    avatar: {
      type: Buffer,
    },
  },
  {
    timestamps: true,
  }
);

//Settting up relationship between users and tasks
userSchema.virtual('tasks', {
  ref: 'Task',
  localField: '_id',
  foreignField: 'userId',
});

//PUBLIC PROFILE, aka HIDE THE SENSITIVE INFORMATION
//no need to call it anywhere toJSON is completely automatic
userSchema.methods.toJSON = function () {
  const user = this;
  const userObject = user.toObject();

  delete userObject.password;
  delete userObject.tokens;
  //!delete the image file too from the response because it is unnecessarily large
  delete userObject.avatar;

  return userObject;
};

//GENERATE TOKEN
userSchema.methods.generateAuthToken = async function () {
  const user = this;
  const token = jwt.sign({ _id: user._id.toString() }, process.env.JWT_SECRET);

  //save token for the user
  user.tokens = user.tokens.concat({ token });
  await user.save();
  return token;
};

//FIND USER, AND CHECK FOR MATCHING PASSWORD
userSchema.statics.findByCredentials = async (email, password) => {
  const user = await User.findOne({ email });
  if (!user) {
    throw new Error('Unable to login');
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw new Error('Unable to login');
  }
  return user;
};

//HASH THE PLAIN TEXT PASSWORD BEFORE SAVING
//creating the middlesware
//function needs to be std function, so we can use this
userSchema.pre('save', async function (next) {
  const user = this;

  //only hash password if the password is actually modofied or created
  if (user.isModified('password')) {
    user.password = await bcrypt.hash(user.password, 8);
  }

  //console.log('just before saving');
  //needs to be here so the process can finish, if next is not her the process will run forever
  next();
});

//Delete user tasks when user is removed
userSchema.pre('remove', async function (next) {
  const user = this;
  await Task.deleteMany({ userId: user._id });
  next();
});

//Create new user
const User = mongoose.model('User', userSchema);

//!NOT NECCESSARY, JUST LEAVING IT FOR LEARNING PURPOSES
//? This is how we created a  new user
// const me = new User({
//   name: '   Mike    ',
//   email: 'MYEMAIL@MEAD.IO    ',
//   password: 'passwort',
// });

// me.save()
//   .then((me) => {
//     console.log(me);
//   })
//   .catch((error) => {
//     console.log('Error', error);
//   });

module.exports = User;
