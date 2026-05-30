// /api/schedule.js
module.exports = (req, res) => {
  res.json({
    date: "Today • May 18",
    items: [
      { time: "11:59 PM", title: "Research Paper Submission" },
      { time: "3:00 PM", title: "Group Study Session" },
      { time: "7:00 PM", title: "Astronomy Club" }
    ]
  });
};
