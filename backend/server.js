// ===== CosmoHub Backend - Node.js + Express + Socket.io =====
// Designed for Render free tier deployment

const express = require('express');
const { createServer } = require('http');
const { Server } = require('socket.io');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const cors = require('cors');

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
    cors: { origin: '*' }
});

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// ===== DATABASE SETUP =====
const db = new sqlite3.Database('./cosmohub.db');

db.serialize(() => {
    // Users table
    db.run(`CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        handle TEXT UNIQUE NOT NULL,
        role TEXT DEFAULT 'Explorer',
        avatar TEXT,
        status TEXT DEFAULT 'online',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // Announcements table
    db.run(`CREATE TABLE IF NOT EXISTS announcements (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        description TEXT NOT NULL,
        category TEXT NOT NULL,
        tags TEXT,
        pinned INTEGER DEFAULT 0,
        image TEXT DEFAULT 'galaxy',
        author_name TEXT NOT NULL,
        author_role TEXT,
        author_avatar TEXT,
        date TEXT,
        time TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // Events table
    db.run(`CREATE TABLE IF NOT EXISTS events (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        month TEXT NOT NULL,
        day TEXT NOT NULL,
        event_time TEXT NOT NULL,
        type TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // Communities table
    db.run(`CREATE TABLE IF NOT EXISTS communities (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        members TEXT NOT NULL,
        icon TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // Tasks table
    db.run(`CREATE TABLE IF NOT EXISTS tasks (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        title TEXT NOT NULL,
        due TEXT,
        done INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // Schedule table
    db.run(`CREATE TABLE IF NOT EXISTS schedule (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        date_label TEXT,
        time TEXT,
        title TEXT,
        color TEXT DEFAULT 'purple',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // Messages table (for chat)
    db.run(`CREATE TABLE IF NOT EXISTS messages (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        channel_id TEXT DEFAULT 'global',
        author_id TEXT,
        author_name TEXT,
        author_avatar TEXT,
        content TEXT NOT NULL,
        is_admin INTEGER DEFAULT 0,
        time TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // Insert demo data if tables are empty
    seedDatabase();
});

function seedDatabase() {
    db.get("SELECT COUNT(*) as count FROM users", (err, row) => {
        if (row.count === 0) {
            // Seed users
            db.run(`INSERT INTO users (name, handle, role, status) VALUES 
                ('Alex Mercer', '@alexmercer', 'Explorer', 'online')`);

            // Seed announcements
            db.run(`INSERT INTO announcements (title, description, category, tags, pinned, image, author_name, author_role, date, time) VALUES
                ('Midterm Examination Schedule', 'The midterm examinations will start from May 20, 2025. Please check the detailed schedule and prepare accordingly.', 'academic', 'academic,important', 1, 'galaxy', 'Dr. Nova Carter', 'Academic Office', 'May 15, 2025', '10:30 AM'),
                ('Science Fair 2025 Registration Open!', 'The annual Science Fair is back! Register your teams before May 25, 2025 to participate. Exciting prizes await!', 'events', 'events,featured', 0, 'calendar', 'Prof. Ethan Blake', 'Science Department', 'May 14, 2025', '2:15 PM'),
                ('System Maintenance Notice', 'CosmoHub will undergo scheduled maintenance on May 18, 2025 from 12:00 AM to 3:00 AM.', 'system', 'system,notice', 0, 'megaphone', 'Admin Team', 'System Administrator', 'May 13, 2025', '9:00 AM'),
                ('New Resources Added to Galaxy Library', 'We\'ve added 120+ new e-books and research papers. Explore now!', 'academic', 'academic,library', 0, 'book', 'Mira Solis', 'Library Head', 'May 12, 2025', '4:45 PM'),
                ('Community Meetup – May 24', 'Join us for the Community Meetup and connect with fellow explorers.', 'community', 'community,events', 0, 'users', 'Kai Anderson', 'Community Manager', 'May 11, 2025', '11:20 AM')`);

            // Seed events
            db.run(`INSERT INTO events (title, month, day, event_time, type) VALUES
                ('Research Paper Submission', 'MAY', '18', '11:59 PM', 'assignment'),
                ('Science Fair Orientation', 'MAY', '19', '9:00 AM', 'event'),
                ('Math Problem Set #4 Deadline', 'MAY', '20', '11:59 PM', 'deadline')`);

            // Seed communities
            db.run(`INSERT INTO communities (name, members, icon) VALUES
                ('IT Students Hub', '1,034', 'code-2'),
                ('Science Explorers', '876', 'flask-conical'),
                ('Math Wizards', '642', 'sigma'),
                ('Gaming Galaxy', '512', 'gamepad-2')`);

            // Seed tasks
            db.run(`INSERT INTO tasks (title, due, done) VALUES
                ('Read Chapter 5: Databases', 'Due May 18', 1),
                ('Finish Lab Report', 'Due May 20', 0),
                ('Practice Calculus Problems', 'Due May 22', 0),
                ('Prepare for Quiz', 'Due May 24', 0)`);

            // Seed schedule
            db.run(`INSERT INTO schedule (date_label, time, title, color) VALUES
                ('Today • May 18', '11:59 PM', 'Research Paper Submission', 'purple'),
                ('Today • May 18', '3:00 PM', 'Group Study Session', 'green'),
                ('Today • May 18', '7:00 PM', 'Astronomy Club', 'blue')`);

            // Seed chat messages
            db.run(`INSERT INTO messages (channel_id, author_id, author_name, author_avatar, content, is_admin, time) VALUES
                ('global', 'm1', 'Luna Reyes', '', 'Good morning, everyone! Hope you all have a productive day ahead.', 1, 'Today at 10:18 AM'),
                ('global', 'm2', 'Zed Orion', '', 'Hey Luna! Just finished my Data Structures assignment', 0, 'Today at 10:20 AM'),
                ('global', 'm3', 'Mira Solis', '', 'Can anyone recommend a good resource for system design?', 0, 'Today at 10:23 AM'),
                ('global', 'm4', 'Kai Anderson', '', 'You should check out the resource in Galaxy Library.', 0, 'Today at 10:25 AM')`);
        }
    });
}

// ===== API ROUTES =====

// --- Dashboard Stats ---
app.get('/api/stats', (req, res) => {
    db.get("SELECT COUNT(*) as activeUsers FROM users WHERE status = 'online'", (err, users) => {
        db.get("SELECT COUNT(*) as unreadAnnouncements FROM announcements WHERE pinned = 0", (err, anns) => {
            db.get("SELECT COUNT(*) as todoTasks FROM tasks WHERE done = 0", (err, tasks) => {
                res.json({
                    activeUsers: users.activeUsers + 1200, // simulated total
                    unreadAnnouncements: anns.unreadAnnouncements,
                    todoTasks: tasks.todoTasks
                });
            });
        });
    });
});

// --- Announcements ---
app.get('/api/announcements', (req, res) => {
    const { category } = req.query;
    let sql = "SELECT * FROM announcements";
    let params = [];
    if (category && category !== 'all') {
        sql += " WHERE category = ?";
        params.push(category);
    }
    sql += " ORDER BY pinned DESC, id DESC";
    db.all(sql, params, (err, rows) => {
        res.json(rows.map(r => ({
            ...r,
            pinned: !!r.pinned,
            tags: r.tags ? r.tags.split(',') : []
        })));
    });
});

app.post('/api/announcements', (req, res) => {
    const { title, description, category, tags, pinned, author_name, author_role } = req.body;
    const now = new Date();
    const date = now.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    const time = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

    db.run(`INSERT INTO announcements (title, description, category, tags, pinned, author_name, author_role, date, time) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [title, description, category, tags.join(','), pinned ? 1 : 0, author_name, author_role, date, time],
        function(err) {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ id: this.lastID, success: true });
        }
    );
});

// --- Events ---
app.get('/api/events', (req, res) => {
    db.all("SELECT * FROM events ORDER BY id ASC", [], (err, rows) => {
        res.json(rows);
    });
});

// --- Communities ---
app.get('/api/communities', (req, res) => {
    db.all("SELECT * FROM communities ORDER BY id ASC", [], (err, rows) => {
        res.json(rows);
    });
});

// --- User Profile ---
app.get('/api/user/profile', (req, res) => {
    db.get("SELECT * FROM users LIMIT 1", [], (err, row) => {
        res.json(row || { name: 'Alex Mercer', handle: '@alexmercer', role: 'Explorer' });
    });
});

// --- Schedule ---
app.get('/api/schedule', (req, res) => {
    db.all("SELECT * FROM schedule ORDER BY id ASC", [], (err, rows) => {
        const dateLabel = rows[0]?.date_label || 'Today';
        res.json({
            date: dateLabel,
            items: rows.map(r => ({ time: r.time, title: r.title }))
        });
    });
});

// --- Tasks ---
app.get('/api/tasks', (req, res) => {
    db.all("SELECT * FROM tasks ORDER BY id ASC", [], (err, rows) => {
        res.json(rows.map(r => ({ ...r, done: !!r.done })));
    });
});

app.patch('/api/tasks/:id', (req, res) => {
    const { done } = req.body;
    db.run("UPDATE tasks SET done = ? WHERE id = ?", [done ? 1 : 0, req.params.id], (err) => {
        res.json({ success: true });
    });
});

// --- Online Count ---
app.get('/api/online', (req, res) => {
    db.get("SELECT COUNT(*) as count FROM users WHERE status = 'online'", (err, row) => {
        res.json({ count: (row?.count || 0) + 1200 }); // simulated total
    });
});

// --- Badges ---
app.get('/api/badges', (req, res) => {
    res.json({ notifications: 3, messages: 5 });
});

// --- Chat Messages ---
app.get('/api/channels/:channelId/messages', (req, res) => {
    db.all("SELECT * FROM messages WHERE channel_id = ? ORDER BY id ASC", [req.params.channelId], (err, rows) => {
        res.json(rows.map(r => ({
            id: 'msg_' + r.id,
            authorId: r.author_id,
            authorName: r.author_name,
            authorAvatar: r.author_avatar,
            isAdmin: !!r.is_admin,
            content: r.content,
            time: r.time,
            isOwn: false
        })));
    });
});

// --- Online Members (Chat) ---
app.get('/api/channels/:channelId/members', (req, res) => {
    db.all("SELECT * FROM users WHERE status = 'online' LIMIT 7", [], (err, rows) => {
        res.json(rows.map((r, i) => ({
            id: r.id,
            name: r.name,
            avatar: r.avatar || '',
            status: r.status,
            isAdmin: i === 0
        })));
    });
});

// ===== WEBSOCKET (Real-time Chat) =====
const onlineUsers = new Map();

io.on('connection', (socket) => {
    console.log('User connected:', socket.id);
    onlineUsers.set(socket.id, { name: 'Anonymous', status: 'online' });

    // Broadcast online count
    io.emit('online_count', onlineUsers.size + 1200);

    // Join channel
    socket.on('join_channel', (channelId) => {
        socket.join(channelId);
    });

    // Send message
    socket.on('send_message', (data) => {
        const { channelId, content, authorName, authorId } = data;
        const now = new Date();
        const time = 'Today at ' + now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });

        db.run(`INSERT INTO messages (channel_id, author_id, author_name, content, time) 
                VALUES (?, ?, ?, ?, ?)`,
            [channelId, authorId, authorName, content, time],
            function(err) {
                if (err) return;
                const msg = {
                    id: 'msg_' + this.lastID,
                    authorId,
                    authorName,
                    authorAvatar: '',
                    isAdmin: false,
                    content,
                    time,
                    isOwn: false
                };
                io.to(channelId).emit('new_message', msg);
            }
        );
    });

    // Typing indicator
    socket.on('typing', (data) => {
        socket.to(data.channelId).emit('user_typing', { user: data.userName });
    });

    // Disconnect
    socket.on('disconnect', () => {
        onlineUsers.delete(socket.id);
        io.emit('online_count', onlineUsers.size + 1200);
    });
});

// ===== START SERVER =====
const PORT = process.env.PORT || 3000;
httpServer.listen(PORT, () => {
    console.log(`🚀 CosmoHub server running on port ${PORT}`);
});
