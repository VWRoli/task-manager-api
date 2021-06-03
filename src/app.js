const express = require('express');
//Making sure mongoose connects to the DB, no need for a variable
require('./db/mongoose');

//Requiring the routers
const userRouter = require('./routers/user');
const taskRouter = require('./routers/task');

const app = express();

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

module.exports = app;
