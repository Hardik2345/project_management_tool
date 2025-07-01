const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Task must have a title'],
    trim: true,
  },
  description: {
    type: String,
    trim: true,
  },
  status: {
    type: String,
    enum: ['backlog', 'todo', 'in-progress','review', 'done'],
    default: 'todo',
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high','critical'],
    default: 'medium',
  },
  dueDate: {
    type: Date,
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  }
});

// Auto-populate assignedTo (user name) and project (project name) on find queries
function autoPopulateTask(next) {
  this.populate({
    path: 'assignedTo',
    select: 'name email',
  }).populate({
    path: 'project',
    select: 'name',
  });
  next();
}
taskSchema.pre('find', autoPopulateTask);
taskSchema.pre('findOne', autoPopulateTask);
taskSchema.pre('findById', autoPopulateTask);

const Task = mongoose.model('Task', taskSchema);
module.exports = Task;
