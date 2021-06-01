const express = require('express');
//Making sure mongoose connects to the DB, no need for a variable
require('./db/mongoose');

//Requiring the routers
const userRouter = require('./routers/user');
const taskRouter = require('./routers/task');

const app = express();
//posting it on heroku || fallback for local dev
const port = process.env.PORT;

//MIDDLEWARES
// app.use((req, res, next) => {
//   if (req.method == 'GET') {
//     res.send('GET request are diabled');
//   }
//   next();
// });
//maintenance
// app.use((req, res, next) => {
//   res.status(503).send('This site is undergoing maintenance');
// });

//This line automatically parse incoming JSON into an object, which we can access in our req handlers
app.use(express.json());
//use the routers
app.use(userRouter);
app.use(taskRouter);

app.listen(port, () => console.log(`Server is up on port ${port}`));

//!/////////////////////

// const bcrypt = require('bcryptjs');

// const myFunction = async () => {
//   const password = 'Red12345!';
//   const hashedPassword = await bcrypt.hash(password, 8);

//   console.log(password);
//   console.log(hashedPassword);

//   const isMatch = await bcrypt.compare('Red12345', hashedPassword);
//   console.log(isMatch);
// };
// myFunction();

//!/////////////////////
// const jwt = require('jsonwebtoken');

// const myFunction = async () => {
//   const token = jwt.sign({ _id: 'abc123' }, 'thisismynewcourse', {
//     expiresIn: '7 days',
//   });
//   console.log(token);

//   const data = jwt.verify(token, 'thisismynewcourse');
//   console.log(data);
// };
// myFunction();

////////////////////////////
//!/////////////////////
// //?FILE UPLOADS
// const multer = require('multer');
// const upload = multer({
//   dest: 'images',
//   //!file size limit
//   limits: {
//     fileSize: 1000000,
//   },
//   //!File type filter
//   fileFilter(req, file, cb) {
//     //Reject the file if it does not fit the criteria
//     if (!file.originalname.match(/\.(doc|docx)$/)) {
//       return cb(new Error('Please upload a word document'));
//     }
//     //Accept the file
//     cb(undefined, true);
//   },
// });

// const errorMiddleware = (req, res, next) => {
//   throw new Error('From my middleware');
// };

// app.post(
//   '/upload',
//   upload.single('upload'),
//   (req, res) => {
//     res.send();
//   },
//   (error, req, res, next) => {
//     res.status(400).send({ error: error.message });
//   }
// );

////////////////////////////
