// /api/messages.js
const messages = [
  {
    id: "msg_001",
    authorId: "m1",
    authorName: "Luna Reyes",
    authorAvatar: "",
    isAdmin: true,
    content: "Good morning, everyone! Hope you all have a productive day ahead.",
    time: "Today at 10:18 AM",
    reactions: [{ emoji: "💜", count: 12 }]
  },
  {
    id: "msg_002",
    authorId: "m2",
    authorName: "Zed Orion",
    authorAvatar: "",
    isAdmin: false,
    content: "Hey Luna! Just finished my Data Structures assignment",
    time: "Today at 10:20 AM",
    reactions: [{ emoji: "🔥", count: 8 }]
  },
  {
    id: "msg_003",
    authorId: "m3",
    authorName: "Mira Solis",
    authorAvatar: "",
    isAdmin: false,
    content: "Can anyone recommend a good resource for system design?",
    time: "Today at 10:23 AM",
    reactions: [{ emoji: "🤔", count: 6 }]
  },
  {
    id: "msg_004",
    authorId: "m4",
    authorName: "Kai Anderson",
    authorAvatar: "",
    isAdmin: false,
    content: "You should check out the resource in Galaxy Library.",
    time: "Today at 10:25 AM",
    isOwn: true,
    reactions: [{ emoji: "👍", count: 7 }]
  }
];

module.exports = (req, res) => {
  res.json(messages);
};
