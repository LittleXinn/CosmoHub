// ===== CosmoHub Chat UI JavaScript - Matching Dashboard Style =====

document.addEventListener('DOMContentLoaded', function() {
    // Initialize Lucide Icons
    lucide.createIcons();

    // ===== CONFIG: Set to true when backend is ready =====
    const BACKEND_READY = true;
const API_URL = window.location.origin;
const socket = io(API_URL);

    // ============================================
    // DATA STRUCTURES - Replace these with your DB calls
    // ============================================

    const currentUser = {
        id: 'user_001',
        name: 'Alex Mercer',
        role: 'Explorer',
        avatar: '',
        status: 'online'
    };

    const channels = [
        {
            id: 'global',
            name: 'Global Chat',
            description: 'Open discussion for all CosmoHub members.',
            icon: '🪐',
            membersOnline: 128,
            totalMembers: 1200,
            type: 'global'
        }
    ];

    const recentConversations = [
        {
            id: 'conv_001',
            type: 'direct',
            name: 'Mira Solis',
            avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=face',
            lastMessage: "Thanks! I'll check it out.",
            time: '10:24 AM',
            unread: 2,
            status: 'online'
        },
        {
            id: 'conv_002',
            type: 'direct',
            name: 'Zed Orion',
            avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face',
            lastMessage: 'Okay, see you tomorrow!',
            time: 'Yesterday',
            unread: 1,
            status: 'online'
        },
        {
            id: 'conv_003',
            type: 'direct',
            name: 'Nova Carter',
            avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face',
            lastMessage: 'Can you send the notes?',
            time: 'Yesterday',
            unread: 0,
            status: 'online'
        },
        {
            id: 'conv_004',
            type: 'direct',
            name: 'Kai Anderson',
            avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=face',
            lastMessage: 'Got it, thanks!',
            time: 'May 16',
            unread: 0,
            status: 'online'
        },
        {
            id: 'conv_005',
            type: 'group',
            name: 'IT Study Group',
            icon: 'users',
            lastMessage: "Mira: Don't forget the meeting",
            time: 'May 16',
            unread: 5,
            memberCount: 12
        },
        {
            id: 'conv_006',
            type: 'group',
            name: 'Science Explorers',
            icon: 'flask-conical',
            lastMessage: 'Zed: New resource added!',
            time: 'May 15',
            unread: 3,
            memberCount: 8
        }
    ];

    const onlineMembers = [
        { id: 'm1', name: 'Luna Reyes', avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop&crop=face', status: 'online', isAdmin: true },
        { id: 'm2', name: 'Zed Orion', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face', status: 'online', isAdmin: false },
        { id: 'm3', name: 'Mira Solis', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=face', status: 'online', isAdmin: false },
        { id: 'm4', name: 'Kai Anderson', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=face', status: 'online', isAdmin: false },
        { id: 'm5', name: 'Nova Carter', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face', status: 'online', isAdmin: false },
        { id: 'm6', name: 'Ethan Blake', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face', status: 'idle', isAdmin: false },
        { id: 'm7', name: 'Ava Sterling', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=face', status: 'dnd', isAdmin: false }
    ];

    const messages = [
        {
            id: 'msg_001',
            authorId: 'm1',
            authorName: 'Luna Reyes',
            authorAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop&crop=face',
            isAdmin: true,
            content: 'Good morning, everyone! ☀️\nHope you all have a productive day ahead.',
            time: 'Today at 10:18 AM',
            reactions: [{ emoji: '💜', count: 12 }]
        },
        {
            id: 'msg_002',
            authorId: 'm2',
            authorName: 'Zed Orion',
            authorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face',
            isAdmin: false,
            content: 'Hey Luna! Just finished my Data Structures assignment 💪',
            time: 'Today at 10:20 AM',
            reactions: [{ emoji: '🔥', count: 8 }, { emoji: '💯', count: 3 }]
        },
        {
            id: 'msg_003',
            authorId: 'm3',
            authorName: 'Mira Solis',
            authorAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=face',
            isAdmin: false,
            content: "That's awesome! Can anyone recommend a good resource for system design?",
            time: 'Today at 10:23 AM',
            reactions: [{ emoji: '🤔', count: 6 }]
        },
        {
            id: 'msg_004',
            authorId: 'm4',
            authorName: 'Kai Anderson',
            authorAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=face',
            isAdmin: false,
            content: 'You should check out the resource in Galaxy Library.\nIt really helped me!',
            time: 'Today at 10:25 AM',
            isOwn: true,
            file: {
                name: 'System Design Roadmap.pdf',
                type: 'PDF Document',
                size: '4.8 MB'
            },
            reactions: [{ emoji: '👍', count: 7 }]
        },
        {
            id: 'msg_005',
            authorId: 'm5',
            authorName: 'Nova Carter',
            authorAvatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face',
            isAdmin: false,
            content: 'Thanks, Kai! That was super helpful 🙌',
            time: 'Today at 10:28 AM',
            reactions: [{ emoji: '💜', count: 4 }]
        }
    ];

    const notifications = [
        { id: 'notif_1', type: 'mention', read: false },
        { id: 'notif_2', type: 'message', read: false },
        { id: 'notif_3', type: 'system', read: false }
    ];

    // ============================================
    // DOM ELEMENTS
    // ============================================

    const elements = {
        currentUserName: document.getElementById('currentUserName'),
        currentUserRole: document.getElementById('currentUserRole'),
        userAvatar: document.getElementById('user-avatar'),
        globalMemberCount: document.getElementById('globalMemberCount'),
        recentList: document.getElementById('recentList'),
        messagesContainer: document.getElementById('messagesContainer'),
        messageInput: document.getElementById('messageInput'),
        sendBtn: document.getElementById('sendBtn'),
        chatTitle: document.getElementById('chatTitle'),
        onlineCount: document.getElementById('onlineCount'),
        chatHeaderIcon: document.getElementById('chatHeaderIcon'),
        rightChannelName: document.getElementById('rightChannelName'),
        rightChannelDesc: document.getElementById('rightChannelDesc'),
        rightOnlineCount: document.getElementById('rightOnlineCount'),
        rightTotalCount: document.getElementById('rightTotalCount'),
        rightChannelIcon: document.getElementById('rightChannelIcon'),
        membersList: document.getElementById('membersList'),
        onlineMembersCount: document.getElementById('onlineMembersCount'),
        notifBadge: document.getElementById('notifBadge'),
        searchInput: document.getElementById('searchInput')
    };

    // ============================================
    // RENDER FUNCTIONS
    // ============================================

    function renderCurrentUser() {
        elements.currentUserName.textContent = currentUser.name;
        elements.currentUserRole.textContent = currentUser.role;

        if (currentUser.avatar) {
            loadUserAvatar(currentUser.avatar);
        }
    }

    function loadUserAvatar(imageUrl) {
        const container = elements.userAvatar;
        if (!container) return;

        const existingImg = container.querySelector('img');
        if (existingImg) existingImg.remove();

        const img = document.createElement('img');
        img.src = imageUrl;
        img.alt = currentUser.name;
        img.onload = () => container.classList.add('has-image');
        img.onerror = () => container.classList.remove('has-image');
        container.appendChild(img);
        lucide.createIcons();
    }

    function renderGlobalChatInfo() {
        const channel = channels[0];
        elements.globalMemberCount.textContent = channel.membersOnline;
        elements.chatTitle.textContent = channel.name;
        elements.onlineCount.textContent = `${channel.membersOnline} members online`;
        elements.rightChannelName.textContent = channel.name;
        elements.rightChannelDesc.textContent = channel.description;
        elements.rightOnlineCount.textContent = channel.membersOnline;
        elements.rightTotalCount.textContent = formatNumber(channel.totalMembers);
        elements.onlineMembersCount.textContent = channel.membersOnline;

        // Chat header icon
        elements.chatHeaderIcon.innerHTML = `<span style="font-size: 16px;">${channel.icon}</span>`;
    }

    function renderRecentConversations() {
        elements.recentList.innerHTML = '';

        recentConversations.forEach(conv => {
            const item = document.createElement('div');
            item.className = 'recent-item';

            const avatarHtml = conv.type === 'group' 
                ? `<div class="group-icon"><i data-lucide="${conv.icon}" style="width:18px;height:18px;"></i></div>`
                : `<div class="recent-avatar"><img src="${conv.avatar}" alt="${conv.name}"><span class="status-indicator ${conv.status}"></span></div>`;

            const unreadHtml = conv.unread > 0 ? `<span class="unread-badge">${conv.unread}</span>` : '';

            item.innerHTML = `
                ${avatarHtml}
                <div class="recent-info">
                    <div class="recent-top">
                        <span class="recent-name">${conv.name}</span>
                        <span class="recent-time">${conv.time}</span>
                    </div>
                    <div class="recent-message">
                        <span>${conv.lastMessage}</span>
                        ${unreadHtml}
                    </div>
                </div>
            `;

            item.addEventListener('click', () => {
                document.querySelectorAll('.recent-item').forEach(el => el.classList.remove('active'));
                item.classList.add('active');
                // TODO: Load conversation data from database
                console.log('Loading conversation:', conv.id);
            });

            elements.recentList.appendChild(item);
        });

        lucide.createIcons();
    }

    function renderMessages() {
        elements.messagesContainer.innerHTML = '';

        messages.forEach(msg => {
            const messageEl = document.createElement('div');
            messageEl.className = `message ${msg.isOwn ? 'message-own' : ''}`;
            messageEl.dataset.messageId = msg.id;

            const adminBadge = msg.isAdmin ? `
                <span class="message-badge">
                    <i data-lucide="check" style="width:9px;height:9px;"></i>
                </span>
            ` : '';

            const fileHtml = msg.file ? `
                <div class="file-attachment">
                    <div class="file-icon">
                        <i data-lucide="file-text" style="width:18px;height:18px;"></i>
                    </div>
                    <div class="file-info">
                        <div class="file-name">${msg.file.name}</div>
                        <div class="file-meta">${msg.file.type} • ${msg.file.size}</div>
                    </div>
                    <button class="file-download">
                        <i data-lucide="download" style="width:16px;height:16px;"></i>
                    </button>
                </div>
            ` : '';

            const reactionsHtml = msg.reactions && msg.reactions.length > 0 ? `
                <div class="message-reactions">
                    ${msg.reactions.map(r => `
                        <div class="reaction">
                            <span class="reaction-emoji">${r.emoji}</span>
                            <span>${r.count}</span>
                        </div>
                    `).join('')}
                </div>
            ` : '';

            messageEl.innerHTML = `
                <div class="message-avatar">
                    <img src="${msg.authorAvatar}" alt="${msg.authorName}">
                </div>
                <div class="message-content">
                    <div class="message-header">
                        <span class="message-author">${msg.authorName}</span>
                        ${adminBadge}
                        <span class="message-time">${msg.time}</span>
                    </div>
                    <div class="message-bubble">
                        ${msg.content.replace(/\n/g, '<br>')}
                    </div>
                    ${fileHtml}
                    ${reactionsHtml}
                </div>
            `;

            elements.messagesContainer.appendChild(messageEl);
        });

        lucide.createIcons();

        // Scroll to bottom
        elements.messagesContainer.scrollTop = elements.messagesContainer.scrollHeight;
    }

    function renderMembers() {
        elements.membersList.innerHTML = '';

        onlineMembers.forEach(member => {
            const item = document.createElement('div');
            item.className = 'member-item';

            const statusText = member.status === 'online' ? 'Online' : 
                              member.status === 'idle' ? 'Idle' : 
                              member.status === 'dnd' ? 'Do Not Disturb' : 'Offline';

            const crownHtml = member.isAdmin ? '<span class="member-crown">👑</span>' : '';

            item.innerHTML = `
                <div class="member-avatar">
                    <img src="${member.avatar}" alt="${member.name}">
                    <span class="status-indicator ${member.status}"></span>
                </div>
                <div class="member-info">
                    <span class="member-name">${member.name}</span>
                    <span class="member-status ${member.status}">${statusText}</span>
                </div>
                ${crownHtml}
            `;

            elements.membersList.appendChild(item);
        });
    }

    function renderNotifications() {
        const unreadCount = notifications.filter(n => !n.read).length;
        elements.notifBadge.textContent = unreadCount;
        elements.notifBadge.style.display = unreadCount > 0 ? 'flex' : 'none';
    }

    // ============================================
    // UTILITY FUNCTIONS
    // ============================================

    function formatNumber(num) {
        if (num >= 1000) {
            return (num / 1000).toFixed(1) + 'K';
        }
        return num.toString();
    }

    function generateId() {
        return 'msg_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    function getCurrentTime() {
        const now = new Date();
        const hours = now.getHours();
        const minutes = now.getMinutes().toString().padStart(2, '0');
        const ampm = hours >= 12 ? 'PM' : 'AM';
        const displayHours = hours % 12 || 12;
        return `Today at ${displayHours}:${minutes} ${ampm}`;
    }

    // ============================================
    // MESSAGE HANDLING
    // ============================================

    function sendMessage() {
        const content = elements.messageInput.value.trim();
        if (!content) return;

        const newMessage = {
            id: generateId(),
            authorId: currentUser.id,
            authorName: currentUser.name,
            authorAvatar: currentUser.avatar || '',
            isAdmin: false,
            content: content,
            time: getCurrentTime(),
            isOwn: true,
            reactions: []
        };

        // Add to local array (replace with DB save)
        messages.push(newMessage);

        // Render the new message
        renderMessages();

        // Clear input
        elements.messageInput.value = '';

        // Send via WebSocket
        socket.emit('send_message', {
            channelId: 'global',
            content: content,
            authorName: currentUser.name,
            authorId: currentUser.id
        });
    }

    // ============================================
    // EVENT LISTENERS
    // ============================================

    function setupEventListeners() {
        // Send button
        elements.sendBtn.addEventListener('click', sendMessage);

        // Enter key to send
        elements.messageInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
            }
        });

        // Search input
        elements.searchInput.addEventListener('input', (e) => {
            const query = e.target.value.toLowerCase();
            // TODO: Implement search against your database
            console.log('Search query:', query);
        });

        // Tab switching
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                // TODO: Load tab data from database
                console.log('Switched to tab:', btn.dataset.tab);
            });
        });

        // New message button
        document.querySelector('.new-message-btn').addEventListener('click', () => {
            // TODO: Open new message modal
            console.log('New message clicked');
        });

        // Invite button
        document.querySelector('.invite-btn').addEventListener('click', () => {
            // TODO: Open invite modal
            console.log('Invite members clicked');
        });

        // View all members
        document.querySelector('.view-all-btn').addEventListener('click', () => {
            // TODO: Open members list modal
            console.log('View all members clicked');
        });

        // Reaction clicks
        elements.messagesContainer.addEventListener('click', (e) => {
            const reaction = e.target.closest('.reaction');
            if (reaction) {
                // TODO: Toggle reaction in database
                console.log('Reaction clicked');
            }
        });

        // Sidebar navigation
        const navItems = document.querySelectorAll('.nav-item');

        // Page routing map: nav text -> HTML file
        const pageRoutes = {
            'Home': 'DashboardUI.html',
            'Chats': 'ChatUI.html',
            'Announcements': 'AnnouncementsUI.html',
            'Galaxy Library': 'GalaxyLibraryUI.html',
            'Cosmic Calendar': 'CosmicCalendarUI.html',
            'Communities': 'CommunitiesUI.html',
            'Profile': 'ProfileUI.html',
            'Settings': 'SettingsUI.html'
        };

        navItems.forEach(item => {
            item.addEventListener('click', function() {
                const pageName = this.querySelector('.nav-text').textContent.trim();
                const targetPage = pageRoutes[pageName];

                if (targetPage) {
                    // Only navigate if it's a different page
                    const currentPage = window.location.pathname.split('/').pop();
                    if (currentPage !== targetPage) {
                        window.location.href = targetPage;
                    }
                } else {
                    document.querySelectorAll('.nav-item').forEach(nav => nav.classList.remove('active'));
                    this.classList.add('active');
                    console.log('Navigating to:', pageName);
                }
            });
        });

        // Icon button click effects
        document.querySelectorAll('.icon-btn, .input-action-btn, .top-action-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                this.style.transform = 'scale(0.92)';
                setTimeout(() => this.style.transform = 'scale(1)', 150);
            });
        });
    }

    // ============================================
    // DATABASE INTEGRATION TEMPLATE
    // ============================================

    /*
    // Example: Replace the data arrays above with API calls:

    async function loadCurrentUser() {
        const response = await fetch('/api/user/me');
        const user = await response.json();
        currentUser.name = user.name;
        currentUser.role = user.role;
        currentUser.avatar = user.avatar;
        currentUser.status = user.status;
        renderCurrentUser();
    }

    async function loadMessages(channelId) {
        const response = await fetch(`/api/channels/${channelId}/messages`);
        const data = await response.json();
        messages.length = 0;
        messages.push(...data);
        renderMessages();
    }

    async function sendMessageToDB(content) {
        const response = await fetch('/api/messages', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                channelId: 'global',
                content: content
            })
        });
        return await response.json();
    }

    async function loadOnlineMembers(channelId) {
        const response = await fetch(`/api/channels/${channelId}/members?status=online`);
        const data = await response.json();
        onlineMembers.length = 0;
        onlineMembers.push(...data);
        renderMembers();
    }

    // WebSocket for real-time updates:
    const ws = new WebSocket('wss://your-api.com/ws');

    ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        switch(data.type) {
            case 'new_message':
                messages.push(data.message);
                renderMessages();
                break;
            case 'user_status':
                updateMemberStatus(data.userId, data.status);
                break;
            case 'reaction':
                updateMessageReaction(data.messageId, data.reaction);
                break;
        }
    };
    */

    // ============================================
    // INITIALIZATION
    // ============================================

    function init() {
        renderCurrentUser();
        renderGlobalChatInfo();
        renderRecentConversations();
        renderMessages();
        renderMembers();
        renderNotifications();
        setupEventListeners();

        console.log('%c🚀 CosmoHub Chat UI Loaded', 'color: #a855f7; font-size: 16px; font-weight: bold;');
        console.log('%cAll data areas are ready for backend integration!', 'color: #22d3ee; font-size: 12px;');
    }

    // Start the app
    init();
});