const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Project must have a name'],
    trim: true,
  },
  description: {
    type: String,
    trim: true,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  members: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }],
  tasks: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Task',
  }],
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
  deadline: {
    type: Date,
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high','critical'],
    default: 'medium',
  },
  status: {
    type: String,
    enum: ['Not Started', 'In Progress', 'Completed', 'On Hold', 'Cancelled'],
    default: 'Not Started',
  },
  client: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Client',
    required: true,
  },
  monthlyHours: {
    type: Number,
    required: true,
    min: 0,
  }
});

// Auto-populate tasks (with assignedTo user details) on find queries
function autoPopulateProject(next) {
  this.populate({
    path: 'client',
    select: 'name',
  });
  this.populate({
    path: 'tasks',
    populate: {
      path: 'assignedTo',
      select: 'name email',
    }
  });
  next();
}
projectSchema.pre('find', autoPopulateProject);
projectSchema.pre('findOne', autoPopulateProject);
projectSchema.pre('findById', autoPopulateProject);

const Project = mongoose.model('Project', projectSchema);
module.exports = Project;
