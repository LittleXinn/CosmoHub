// /api/events.js
module.exports = (req, res) => {
  res.json([
    { id: 1, title: "Research Paper Submission", month: "MAY", day: "18", event_time: "11:59 PM", type: "assignment" },
    { id: 2, title: "Science Fair Orientation", month: "MAY", day: "19", event_time: "9:00 AM", type: "event" },
    { id: 3, title: "Math Problem Set #4 Deadline", month: "MAY", day: "20", event_time: "11:59 PM", type: "deadline" }
  ]);
};
