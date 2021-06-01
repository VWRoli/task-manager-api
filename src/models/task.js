const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema(
  {
    description: {
      type: String,
      required: true,
      trim: true,
    },
    completed: {
      type: Boolean,
      default: false,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
);
//Create new task
const Task = mongoose.model('Task', taskSchema);

module.exports = Task;

//!NOT NECCESSARY, JUST LEAVING IT FOR LEARNING PURPOSES
//? This is how we created a  new task

// const mytask = new Task({
//   description: 'Kaufen E-gitarre',
//   completed: false,
// });

// mytask
//   .save()
//   .then((mytask) => {
//     console.log(mytask);
//   })
//   .catch((error) => {
//     console.log('Error', error);
//   });
