const nodemailer = require('nodemailer');
const cron = require('node-cron');
const User = require('../models/userModel'); // Adjust the path as necessary
const Task = require('../models/taskModel'); // Adjust the path as necessary

// Create transporter object
let transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'projects.techit@gmail.com',
    pass: "Apps@7777777#", // Use app password if 2FA is enabled
  },
})

const members= async () => {
  try {
    // Fetch all users from the database
    const users = await User.find({ active: true }).select('email name');
    const details = users.map(user => {
        return {
            email: user.email,
            id: user._id,    
            name: user.name,
        }
    });
    return details;
  } catch (error) {
    console.error('Error fetching users:', error);
    return [];
  }
};

const taskDueToday = async (assignedTo) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Set to start of the day
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1); // Set to start of the next day       

    const tasks = await Task.find({
      assignedTo,
      status: { $ne: 'done' },
      dueDate: {
        $lt: tomorrow
      }
    });

    return tasks;
  } catch (error) {
    console.error('Error fetching tasks due today:', error);
    return [];
  }
};

const taskDueTomorrow = async (assignedTo) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Set to start of the day
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1); // Set to start of the next day
    const dayAfterTomorrow = new Date(tomorrow);
    dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 1); // Set to start of the day after tomorrow

    const tasks = await Task.find({
      assignedTo,
      status: { $ne: 'done' }, // Exclude completed tasks
      dueDate: {
        $gte: tomorrow,
        $lt: dayAfterTomorrow
      }
    });

    return tasks;
  } catch (error) {
    console.error('Error fetching tasks due tomorrow:', error);
    return [];
  }
};

function startEmailScheduler() {
  cron.schedule(
    '42 14 * * *',
    async () => {
      console.log('Running daily email task');
      const users = await members();
      for (const { email, name, id } of users) {
        // fetch tasks for each user
        const todayTasks = await taskDueToday(id);
        const tomorrowTasks = await taskDueTomorrow(id);
        // generate table rows
        const todayRows = todayTasks
          .map(t => `
                        <tr>
                          <td>${t.title}</td>
                          <td class="danger">${t.status}</td>
                          <td>${t.dueDate.toISOString().split('T')[0]}</td>
                        </tr>
          `)
          .join('');
        const tomorrowRows = tomorrowTasks
          .map(t => `
                        <tr>
                          <td>${t.title}</td>
                          <td class="warning">${t.status}</td>
                          <td>${t.dueDate.toISOString().split('T')[0]}</td>
                        </tr>
          `)
          .join('');
        const tableRows = todayRows + tomorrowRows;
        // send the email
        transporter.sendMail({
          from: 'projects.techit@gmail.com',
          to: email,
          subject: `Daily tasks summary for ${name}`,
          html: `<!DOCTYPE html>
                <html>
                <head>
                <style>
                    .container {
                    width: 100%;
                    font-family: Arial, sans-serif;
                    padding: 20px;
                    box-sizing: border-box;
                    }

                    .card-container {
                    display: flex;
                    justify-content: space-between;
                    gap: 20px;
                    margin-bottom: 30px;
                    }

                    .card {
                    flex: 1;
                    padding: 20px;
                    border-radius: 8px;
                    color: white;
                    text-align: center;
                    }

                    .card-red {
                    background-color: #e53935;
                    }

                    .card-yellow {
                    background-color: #fbc02d;
                    color: #333;
                    }

                    h2 {
                    margin-bottom: 10px;
                    }

                    table {
                    width: 100%;
                    border-collapse: collapse;
                    margin-top: 10px;
                    }

                    th, td {
                    padding: 10px;
                    border: 1px solid #ddd;
                    text-align: left;
                    }

                    th {
                    background-color: #f4f4f4;
                    }

                    .danger {
                    color: #e53935;
                    font-weight: bold;
                    }

                    .warning {
                    color: #fbc02d;
                    font-weight: bold;
                    }
                </style>
                </head>
                <body>
                  <div class="container">
                    <div class="card-container">
                      <div class="card card-red">
                        <h1>${todayTasks.length}</h1>
                        <p>You have ${todayTasks.length} tasks that are overdue today. Please take immediate action.</p>
                      </div>
                      <div class="card card-yellow">
                        <h1>${tomorrowTasks.length}</h1>
                        <p>You have ${tomorrowTasks.length} tasks due tomorrow. Plan ahead to stay on track.</p>
                      </div>
                    </div>
                    <h2>Task Summary</h2>
                    <table>
                      <thead>
                        <tr>
                          <th>Title</th>
                          <th>Status</th>
                          <th>Due Date</th>
                        </tr>
                      </thead>
                      <tbody>
                        ${tableRows}
                      </tbody>
                    </table>
                  </div>
                </body>
                </html>
        `,
        }, (error, info) => {
          if (error) {
            console.log('Error sending email:', error);
          } else {
            console.log('Email sent successfully to:', email);
          }
        });
      }
    },
    { timezone: 'Asia/Kolkata' }
  );
}

module.exports = { startEmailScheduler };