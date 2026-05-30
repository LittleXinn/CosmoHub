// /api/stats.js
module.exports = (req, res) => {
  res.json({
    activeUsers: 1248,
    unreadAnnouncements: 7,
    todoTasks: 3
  });
};
