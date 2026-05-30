// ===== CosmoHub Chat - Vercel Version (Polling) =====
const API_URL = window.location.origin;
const BACKEND_READY = true;

document.addEventListener('DOMContentLoaded', function() {
    lucide.createIcons();

    const currentUser = {
        id: 'user_001',
        name: 'Alex Mercer',
        role: 'Explorer',
        avatar: '',
        status: 'online'
    };

    const channels = [{
        id: 'global', name: 'Global Chat',
        description: 'Open discussion for all CosmoHub members.',
        icon: '🪐', membersOnline: 128, totalMembers: 1200, type: 'global'
    }];

    let messages = [];
    let onlineMembers = [];

    const recentConversations = [
        { id: 'conv_001', type: 'direct', name: 'Mira Solis', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=face', lastMessage: "Thanks! I'll check it out.", time: '10:24 AM', unread: 2, status: 'online' },
        { id: 'conv_002', type: 'direct', name: 'Zed Orion', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face', lastMessage: 'Okay, see you tomorrow!', time: 'Yesterday', unread: 1, status: 'online' },
        { id: 'conv_003', type: 'direct', name: 'Nova Carter', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face', lastMessage: 'Can you send the notes?', time: 'Yesterday', unread: 0, status: 'online' },
        { id: 'conv_004', type: 'direct', name: 'Kai Anderson', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=face', lastMessage: 'Got it, thanks!', time: 'May 16', unread: 0, status: 'online' },
        { id: 'conv_005', type: 'group', name: 'IT Study Group', icon: 'users', lastMessage: "Mira: Don't forget the meeting", time: 'May 16', unread: 5, memberCount: 12 },
        { id: 'conv_006', type: 'group', name: 'Science Explorers', icon: 'flask-conical', lastMessage: 'Zed: New resource added!', time: 'May 15', unread: 3, memberCount: 8 }
    ];

    const notifications = [{ id: 'notif_1', type: 'mention', read: false }, { id: 'notif_2', type: 'message', read: false }, { id: 'notif_3', type: 'system', read: false }];

    const elements = {
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

    function renderGlobalChatInfo() {
        const channel = channels[0];
        elements.globalMemberCount.textContent = channel.membersOnline;
        elements.chatTitle.textContent = channel.name;
        elements.onlineCount.textContent = `${channel.membersOnline} members online`;
        elements.rightChannelName.textContent = channel.name;
        elements.rightChannelDesc.textContent = channel.description;
        elements.rightOnlineCount.textContent = channel.membersOnline;
        elements.rightTotalCount.textContent = channel.totalMembers.toLocaleString();
        elements.onlineMembersCount.textContent = channel.membersOnline;
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
                    <div class="recent-top"><span class="recent-name">${conv.name}</span><span class="recent-time">${conv.time}</span></div>
                    <div class="recent-message"><span>${conv.lastMessage}</span>${unreadHtml}</div>
                </div>`;
            elements.recentList.appendChild(item);
        });
        lucide.createIcons();
    }

    function renderMessages() {
        elements.messagesContainer.innerHTML = '';
        messages.forEach(msg => {
            const messageEl = document.createElement('div');
            messageEl.className = `message ${msg.isOwn ? 'message-own' : ''}`;
            const adminBadge = msg.isAdmin ? `<span class="message-badge"><i data-lucide="check" style="width:9px;height:9px;"></i></span>` : '';
            const reactionsHtml = msg.reactions && msg.reactions.length > 0 ? `<div class="message-reactions">${msg.reactions.map(r => `<div class="reaction"><span class="reaction-emoji">${r.emoji}</span><span>${r.count}</span></div>`).join('')}</div>` : '';

            messageEl.innerHTML = `
                <div class="message-avatar"><img src="${msg.authorAvatar || ''}" alt="${msg.authorName}" onerror="this.style.display='none'"></div>
                <div class="message-content">
                    <div class="message-header">
                        <span class="message-author">${msg.authorName}</span>${adminBadge}
                        <span class="message-time">${msg.time}</span>
                    </div>
                    <div class="message-bubble">${msg.content.replace(/\n/g, '<br>')}</div>
                    ${reactionsHtml}
                </div>`;
            elements.messagesContainer.appendChild(messageEl);
        });
        lucide.createIcons();
        elements.messagesContainer.scrollTop = elements.messagesContainer.scrollHeight;
    }

    function renderMembers() {
        elements.membersList.innerHTML = '';
        onlineMembers.forEach(member => {
            const item = document.createElement('div');
            item.className = 'member-item';
            const statusText = member.status === 'online' ? 'Online' : member.status === 'idle' ? 'Idle' : 'Do Not Disturb';
            const crownHtml = member.isAdmin ? '<span class="member-crown">👑</span>' : '';
            item.innerHTML = `
                <div class="member-avatar"><img src="${member.avatar || ''}" alt="${member.name}" onerror="this.style.display='none'"><span class="status-indicator ${member.status}"></span></div>
                <div class="member-info"><span class="member-name">${member.name}</span><span class="member-status ${member.status}">${statusText}</span></div>
                ${crownHtml}`;
            elements.membersList.appendChild(item);
        });
    }

    function renderNotifications() {
        const unreadCount = notifications.filter(n => !n.read).length;
        elements.notifBadge.textContent = unreadCount;
        elements.notifBadge.style.display = unreadCount > 0 ? 'flex' : 'none';
    }

    function getCurrentTime() {
        const now = new Date();
        const hours = now.getHours();
        const minutes = now.getMinutes().toString().padStart(2, '0');
        const ampm = hours >= 12 ? 'PM' : 'AM';
        const displayHours = hours % 12 || 12;
        return `Today at ${displayHours}:${minutes} ${ampm}`;
    }

    function sendMessage() {
        const content = elements.messageInput.value.trim();
        if (!content) return;

        const newMessage = {
            id: 'msg_' + Date.now(),
            authorId: currentUser.id,
            authorName: currentUser.name,
            authorAvatar: currentUser.avatar || '',
            isAdmin: false,
            content: content,
            time: getCurrentTime(),
            isOwn: true,
            reactions: []
        };

        messages.push(newMessage);
        renderMessages();
        elements.messageInput.value = '';

        // Send to API
        fetch(`${API_URL}/api/send-message`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ content, authorName: currentUser.name, authorId: currentUser.id })
        }).catch(err => console.log('Message saved locally'));
    }

    elements.sendBtn.addEventListener('click', sendMessage);
    elements.messageInput.addEventListener('keypress', e => {
        if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
    });

    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
        });
    });

    document.querySelectorAll('.icon-btn, .input-action-btn, .top-action-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            this.style.transform = 'scale(0.92)';
            setTimeout(() => this.style.transform = 'scale(1)', 150);
        });
    });

    const navItems = document.querySelectorAll('.nav-item');
    const pageRoutes = {
        'Home': 'DashboardUI.html', 'Chats': 'ChatUI.html', 'Announcements': 'AnnouncementsUI.html',
        'Galaxy Library': 'GalaxyLibraryUI.html', 'Cosmic Calendar': 'CosmicCalendarUI.html',
        'Communities': 'CommunitiesUI.html', 'Profile': 'ProfileUI.html', 'Settings': 'SettingsUI.html'
    };
    navItems.forEach(item => {
        item.addEventListener('click', function() {
            const pageName = this.querySelector('.nav-text').textContent.trim();
            const targetPage = pageRoutes[pageName];
            if (targetPage) {
                const currentPage = window.location.pathname.split('/').pop();
                if (currentPage !== targetPage) window.location.href = targetPage;
            }
        });
    });

    // Load data from API
    fetch(`${API_URL}/api/messages`).then(r => r.json()).then(data => {
        messages = data.map(m => ({...m, isOwn: m.authorId === currentUser.id}));
        renderMessages();
    });

    fetch(`${API_URL}/api/online`).then(r => r.json()).then(d => {
        // Simulate members from online count
        onlineMembers = [
            { id: 'm1', name: 'Luna Reyes', avatar: '', status: 'online', isAdmin: true },
            { id: 'm2', name: 'Zed Orion', avatar: '', status: 'online', isAdmin: false },
            { id: 'm3', name: 'Mira Solis', avatar: '', status: 'online', isAdmin: false },
            { id: 'm4', name: 'Kai Anderson', avatar: '', status: 'online', isAdmin: false },
            { id: 'm5', name: 'Nova Carter', avatar: '', status: 'online', isAdmin: false },
            { id: 'm6', name: 'Ethan Blake', avatar: '', status: 'idle', isAdmin: false },
            { id: 'm7', name: 'Ava Sterling', avatar: '', status: 'dnd', isAdmin: false }
        ];
        renderMembers();
    });

    renderGlobalChatInfo();
    renderRecentConversations();
    renderNotifications();

    // Poll for new messages every 5 seconds
    setInterval(() => {
        fetch(`${API_URL}/api/messages`).then(r => r.json()).then(data => {
            if (data.length > messages.length) {
                const newMsgs = data.slice(messages.length).map(m => ({...m, isOwn: m.authorId === currentUser.id}));
                messages.push(...newMsgs);
                renderMessages();
            }
        });
    }, 5000);

    console.log('%c🚀 CosmoHub Chat (Vercel)', 'color: #a855f7; font-size: 16px; font-weight: bold;');
});
