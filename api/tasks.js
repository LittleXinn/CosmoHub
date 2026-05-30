// /api/tasks.js
module.exports = (req, res) => {
  res.json([
    { id: 1, title: "Read Chapter 5: Databases", due: "Due May 18", done: true },
    { id: 2, title: "Finish Lab Report", due: "Due May 20", done: false },
    { id: 3, title: "Practice Calculus Problems", due: "Due May 22", done: false },
    { id: 4, title: "Prepare for Quiz", due: "Due May 24", done: false }
  ]);
};
