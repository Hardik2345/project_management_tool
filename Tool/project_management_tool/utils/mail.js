const nodemailer = require('nodemailer');
const cron = require('node-cron');
const User = require('../models/userModel'); // Adjust the path as necessary
const Task = require('../models/taskModel'); // Adjust the path as necessary

// Create transporter object
let transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'projects.techit@gmail.com',
    pass: "vqbvrbnezcwqgruw", // Use app password if 2FA is enabled
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
    '30 19 * * *',
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

                    /* Ensure spacing between cards in email clients */
                    .card-container {
                      display: flex;
                      justify-content: space-between;
                      margin-bottom: 30px;
                    }

                    /* Add right margin to all cards except the last for consistent spacing */
                    .card-container .card:not(:last-child) {
                      margin-right: 20px;
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

// New: send notification when a task is assigned
async function sendTaskAssignmentEmail(toEmail, task) {
  const subject = `New Task Assigned: ${task.title}`;
  const due = task.dueDate ? new Date(task.dueDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : 'N/A';
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>New Task Assigned</title>
</head>
<body style="margin:0; padding:0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding: 40px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 10px rgba(0,0,0,0.1);">
          <tr>
            <td style="background-color: #4CAF50; color: #ffffff; padding: 20px 30px; text-align: center; font-size: 24px; font-weight: bold;">
              📋 New Task Assigned
            </td>
          </tr>
          <tr>
            <td style="padding: 30px;">
              <p style="font-size: 16px; color: #333333;">Hello,</p>
              <p style="font-size: 16px; color: #333333;">You have been assigned a new task. Please find the details below:</p>
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-top: 20px; border: 1px solid #e0e0e0; border-radius: 8px; background-color: #fafafa;">
                <tr>
                  <td style="padding: 15px 20px; border-bottom: 1px solid #e0e0e0;">
                    <strong style="color: #555;">Title:</strong> <span style="color: #333;">${task.title}</span>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 15px 20px; border-bottom: 1px solid #e0e0e0;">
                    <strong style="color: #555;">Description:</strong> <span style="color: #333;">${task.description || 'No description'}</span>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 15px 20px;">
                    <strong style="color: #555;">Due Date:</strong> <span style="color: #333;">${due}</span>
                  </td>
                </tr>
              </table>

              <div style="text-align: center; margin-top: 30px;">
                <a href="https://project-management-tool-peach.vercel.app/tasks" style="background-color: #4CAF50; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 6px; font-weight: bold; display: inline-block;">View Task</a>
              </div>

              <p style="margin-top: 30px; font-size: 14px; color: #888;">If you have any questions, please contact your team manager.</p>
            </td>
          </tr>
          <tr>
            <td style="background-color: #f4f4f4; text-align: center; padding: 15px; font-size: 12px; color: #999;">
              © 2025 Task Manager Inc. All rights reserved.
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
  transporter.sendMail({
    from: 'projects.techit@gmail.com',
    to: toEmail,
    subject,
    html,
  }, (err, info) => {
    if (err) console.error('Error sending task assignment email:', err);
    else console.log('Task assignment email sent to:', toEmail);
  });
}

module.exports = { startEmailScheduler, sendTaskAssignmentEmail };