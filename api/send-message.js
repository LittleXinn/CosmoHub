// /api/send-message.js
let messages = [
  {
    id: "msg_001",
    authorId: "m1",
    authorName: "Luna Reyes",
    content: "Good morning, everyone! Hope you all have a productive day ahead.",
    time: "Today at 10:18 AM"
  }
];

module.exports = (req, res) => {
  if (req.method === 'POST') {
    const { content, authorName, authorId } = req.body;
    const newMsg = {
      id: "msg_" + Date.now(),
      authorId: authorId || "user",
      authorName: authorName || "Anonymous",
      content,
      time: "Today at " + new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
    };
    messages.push(newMsg);
    res.json(newMsg);
  } else {
    res.json(messages);
  }
};
