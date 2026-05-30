// /api/announcements.js
const announcements = [
  {
    id: 1,
    title: "Midterm Examination Schedule",
    description: "The midterm examinations will start from May 20, 2025. Please check the detailed schedule and prepare accordingly.",
    category: "academic",
    tags: ["academic", "important"],
    pinned: true,
    image: "galaxy",
    author_name: "Dr. Nova Carter",
    author_role: "Academic Office",
    date: "May 15, 2025",
    time: "10:30 AM"
  },
  {
    id: 2,
    title: "Science Fair 2025 Registration Open!",
    description: "The annual Science Fair is back! Register your teams before May 25, 2025 to participate. Exciting prizes await!",
    category: "events",
    tags: ["events", "featured"],
    pinned: false,
    image: "calendar",
    author_name: "Prof. Ethan Blake",
    author_role: "Science Department",
    date: "May 14, 2025",
    time: "2:15 PM"
  },
  {
    id: 3,
    title: "System Maintenance Notice",
    description: "CosmoHub will undergo scheduled maintenance on May 18, 2025 from 12:00 AM to 3:00 AM.",
    category: "system",
    tags: ["system", "notice"],
    pinned: false,
    image: "megaphone",
    author_name: "Admin Team",
    author_role: "System Administrator",
    date: "May 13, 2025",
    time: "9:00 AM"
  },
  {
    id: 4,
    title: "New Resources Added to Galaxy Library",
    description: "We've added 120+ new e-books and research papers. Explore now!",
    category: "academic",
    tags: ["academic", "library"],
    pinned: false,
    image: "book",
    author_name: "Mira Solis",
    author_role: "Library Head",
    date: "May 12, 2025",
    time: "4:45 PM"
  },
  {
    id: 5,
    title: "Community Meetup – May 24",
    description: "Join us for the Community Meetup and connect with fellow explorers.",
    category: "community",
    tags: ["community", "events"],
    pinned: false,
    image: "users",
    author_name: "Kai Anderson",
    author_role: "Community Manager",
    date: "May 11, 2025",
    time: "11:20 AM"
  }
];

module.exports = (req, res) => {
  const { category } = req.query;
  let result = announcements;

  if (category && category !== 'all') {
    result = announcements.filter(a => a.category === category);
  }

  // Sort: pinned first, then by date
  result.sort((a, b) => {
    if (a.pinned && !b.pinned) return -1;
    if (!a.pinned && b.pinned) return 1;
    return b.id - a.id;
  });

  res.json(result);
};
