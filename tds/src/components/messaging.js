// ============================================
// TDS Messaging Component (Supervisor ↔ Driver)
// ============================================
import { store } from '../store.js';
import { icons } from './icons.js';
import { generateId, formatRelativeTime } from '../utils/helpers.js';

// In-memory message store (simulated)
const messageStore = {
  conversations: {},  // { driverId: [{ id, from, to, text, timestamp, read }] }
  quickMessages: [
    'Please refuel at the nearest station.',
    'Take a rest break — you\'ve been driving too long.',
    'Contact dispatch immediately.',
    'Package requires careful handling.',
    'Delivery confirmed — great work!',
    'Please update your ETA.',
    'Check vehicle health before departing.',
    'Customer is expecting delivery soon.',
  ]
};

// Seed some demo conversations
function seedMessages() {
  const drivers = store.getState().drivers;
  const now = Date.now();
  drivers.slice(0, 4).forEach((driver, idx) => {
    messageStore.conversations[driver.id] = [
      { id: generateId('MSG'), from: 'supervisor', to: driver.id, text: 'How\'s the delivery going?', timestamp: new Date(now - (3 + idx) * 3600000).toISOString(), read: true },
      { id: generateId('MSG'), from: driver.id, to: 'supervisor', text: 'On track, should arrive within ETA.', timestamp: new Date(now - (2.5 + idx) * 3600000).toISOString(), read: true },
      { id: generateId('MSG'), from: 'supervisor', to: driver.id, text: 'Great, keep it up!', timestamp: new Date(now - (2 + idx) * 3600000).toISOString(), read: idx > 0 },
    ];
  });
}
seedMessages();

export function getConversation(driverId) {
  return messageStore.conversations[driverId] || [];
}

export function sendMessage(fromId, toId, text) {
  if (!messageStore.conversations[toId]) {
    messageStore.conversations[toId] = [];
  }
  const msg = {
    id: generateId('MSG'),
    from: fromId,
    to: toId,
    text,
    timestamp: new Date().toISOString(),
    read: false
  };
  messageStore.conversations[toId].push(msg);
  return msg;
}

export function getUnreadCount(driverId) {
  const msgs = messageStore.conversations[driverId] || [];
  return msgs.filter(m => !m.read && m.from !== 'supervisor').length;
}

export function getTotalUnread() {
  let count = 0;
  for (const driverId of Object.keys(messageStore.conversations)) {
    count += getUnreadCount(driverId);
  }
  return count;
}

export function markConversationRead(driverId) {
  const msgs = messageStore.conversations[driverId] || [];
  msgs.forEach(m => m.read = true);
}

/**
 * Opens a message modal for a specific driver.
 */
export function showMessageModal(driver) {
  const overlay = document.getElementById('modal-overlay');
  if (!overlay) return;

  const conversation = getConversation(driver.id);
  markConversationRead(driver.id);

  overlay.innerHTML = `
    <div class="message-modal animate-scale-in">
      <div class="message-modal-header">
        <div style="display: flex; align-items: center; gap: 12px;">
          <div class="avatar avatar-sm" style="background: ${driver.avatarColor};">${driver.initials}</div>
          <div>
            <div class="message-modal-name">${driver.name}</div>
            <div class="message-modal-status">${driver.status} · ${driver.email}</div>
          </div>
        </div>
        <button class="btn btn-ghost btn-icon btn-sm message-close-btn" id="msg-close-btn">${icons.x(18)}</button>
      </div>

      <div class="message-modal-body" id="msg-body">
        ${conversation.length === 0
          ? `<div class="message-empty">${icons.messages(28)}<p>No messages yet</p><span>Start a conversation</span></div>`
          : conversation.map(msg => `
            <div class="message-bubble ${msg.from === 'supervisor' ? 'sent' : 'received'}">
              <div class="message-bubble-text">${msg.text}</div>
              <div class="message-bubble-time">${formatRelativeTime(msg.timestamp)}</div>
            </div>
          `).join('')
        }
      </div>

      <div class="message-quick-replies" id="msg-quick-replies">
        ${messageStore.quickMessages.slice(0, 4).map(q => `
          <button class="message-quick-btn" data-text="${q}">${q.substring(0, 30)}${q.length > 30 ? '…' : ''}</button>
        `).join('')}
      </div>

      <div class="message-modal-footer">
        <input type="text" class="input message-input" id="msg-input" placeholder="Type a message…" autocomplete="off" />
        <button class="btn btn-primary btn-icon message-send-btn" id="msg-send-btn">${icons.send(18)}</button>
      </div>
    </div>
  `;

  overlay.classList.add('active');

  // Scroll to bottom
  const body = document.getElementById('msg-body');
  if (body) body.scrollTop = body.scrollHeight;

  // Send message handler
  const input = document.getElementById('msg-input');
  const sendBtn = document.getElementById('msg-send-btn');

  const doSend = () => {
    const text = input.value.trim();
    if (!text) return;
    sendMessage('supervisor', driver.id, text);
    input.value = '';
    refreshMessages(driver);
  };

  sendBtn?.addEventListener('click', doSend);
  input?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      doSend();
    }
  });

  // Quick replies
  document.getElementById('msg-quick-replies')?.querySelectorAll('.message-quick-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      input.value = btn.dataset.text;
      input.focus();
    });
  });

  // Close
  document.getElementById('msg-close-btn')?.addEventListener('click', closeMessageModal);
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) closeMessageModal();
  });

  // Focus input
  setTimeout(() => input?.focus(), 100);
}

function refreshMessages(driver) {
  const body = document.getElementById('msg-body');
  if (!body) return;
  const conversation = getConversation(driver.id);
  body.innerHTML = conversation.map(msg => `
    <div class="message-bubble ${msg.from === 'supervisor' ? 'sent' : 'received'}">
      <div class="message-bubble-text">${msg.text}</div>
      <div class="message-bubble-time">${formatRelativeTime(msg.timestamp)}</div>
    </div>
  `).join('');
  body.scrollTop = body.scrollHeight;
}

export function closeMessageModal() {
  const overlay = document.getElementById('modal-overlay');
  if (overlay) {
    overlay.classList.remove('active');
    overlay.innerHTML = '';
  }
}

/**
 * Renders the full messages page (list of conversations).
 */
export function renderMessagesPage(container) {
  const drivers = store.getState().drivers;
  const auth = store.getState().auth;

  container.innerHTML = `
    <div class="page-header">
      <div>
        <h2 class="page-title">${icons.messages(24)} Messages</h2>
        <p class="page-subtitle">Quick communication with your fleet</p>
      </div>
    </div>
    <div class="messages-layout">
      <div class="messages-list card" id="msg-list">
        <div class="messages-list-header">
          <div class="input-icon-wrapper" style="width: 100%;">
            <span class="input-icon">${icons.search(16)}</span>
            <input type="text" class="input" id="msg-search" placeholder="Search conversations…" />
          </div>
        </div>
        <div class="messages-conversations" id="msg-conversations">
          ${drivers.map(d => {
            const msgs = getConversation(d.id);
            const lastMsg = msgs[msgs.length - 1];
            const unread = getUnreadCount(d.id);
            return `
              <div class="messages-conv-item ${unread > 0 ? 'unread' : ''}" data-driver-id="${d.id}">
                <div class="avatar avatar-sm" style="background: ${d.avatarColor};">
                  ${d.initials}
                  <span class="avatar-status ${d.status === 'driving' ? 'online' : d.status === 'idle' ? 'offline' : 'away'}"></span>
                </div>
                <div class="messages-conv-info">
                  <div class="messages-conv-name">${d.name}</div>
                  <div class="messages-conv-last">${lastMsg ? lastMsg.text.substring(0, 40) + (lastMsg.text.length > 40 ? '…' : '') : 'No messages'}</div>
                </div>
                <div class="messages-conv-meta">
                  ${lastMsg ? `<span class="messages-conv-time">${formatRelativeTime(lastMsg.timestamp)}</span>` : ''}
                  ${unread > 0 ? `<span class="messages-conv-badge">${unread}</span>` : ''}
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>
      <div class="messages-chat card" id="msg-chat">
        <div class="messages-chat-empty">
          ${icons.messages(40)}
          <p>Select a conversation</p>
          <span>Choose a driver from the list to view messages</span>
        </div>
      </div>
    </div>
  `;

  // Conversation click handler
  container.querySelectorAll('.messages-conv-item').forEach(item => {
    item.addEventListener('click', () => {
      const driverId = item.dataset.driverId;
      const driver = store.getDriver(driverId);
      if (driver) {
        container.querySelectorAll('.messages-conv-item').forEach(i => i.classList.remove('active'));
        item.classList.remove('unread');
        item.classList.add('active');
        markConversationRead(driverId);
        renderChatPanel(driver);
      }
    });
  });

  // Search
  container.querySelector('#msg-search')?.addEventListener('input', (e) => {
    const q = e.target.value.toLowerCase();
    container.querySelectorAll('.messages-conv-item').forEach(item => {
      const name = item.querySelector('.messages-conv-name')?.textContent.toLowerCase() || '';
      item.style.display = name.includes(q) ? '' : 'none';
    });
  });
}

function renderChatPanel(driver) {
  const chatEl = document.getElementById('msg-chat');
  if (!chatEl) return;

  const conversation = getConversation(driver.id);

  chatEl.innerHTML = `
    <div class="messages-chat-header">
      <div style="display: flex; align-items: center; gap: 12px;">
        <div class="avatar avatar-sm" style="background: ${driver.avatarColor};">${driver.initials}</div>
        <div>
          <div style="font-weight: 600; font-size: 14px;">${driver.name}</div>
          <div style="font-size: 12px; color: var(--color-text-muted);">${driver.status} · ${driver.phone}</div>
        </div>
      </div>
      <button class="btn btn-ghost btn-sm" id="chat-call-btn">${icons.phone(16)} Call</button>
    </div>
    <div class="messages-chat-body" id="chat-body">
      ${conversation.map(msg => `
        <div class="message-bubble ${msg.from === 'supervisor' ? 'sent' : 'received'}">
          <div class="message-bubble-text">${msg.text}</div>
          <div class="message-bubble-time">${formatRelativeTime(msg.timestamp)}</div>
        </div>
      `).join('')}
    </div>
    <div class="message-quick-replies" id="chat-quick-replies">
      ${messageStore.quickMessages.slice(0, 4).map(q => `
        <button class="message-quick-btn" data-text="${q}">${q.substring(0, 30)}${q.length > 30 ? '…' : ''}</button>
      `).join('')}
    </div>
    <div class="messages-chat-footer">
      <input type="text" class="input message-input" id="chat-input" placeholder="Type a message…" autocomplete="off" />
      <button class="btn btn-primary btn-icon message-send-btn" id="chat-send-btn">${icons.send(18)}</button>
    </div>
  `;

  const body = document.getElementById('chat-body');
  if (body) body.scrollTop = body.scrollHeight;

  const input = document.getElementById('chat-input');
  const sendBtn = document.getElementById('chat-send-btn');

  const doSend = () => {
    const text = input.value.trim();
    if (!text) return;
    sendMessage('supervisor', driver.id, text);
    input.value = '';
    // Re-render chat body only
    const body = document.getElementById('chat-body');
    if (body) {
      const msgs = getConversation(driver.id);
      const lastMsg = msgs[msgs.length - 1];
      body.innerHTML += `
        <div class="message-bubble sent animate-fade-in-up" style="animation-duration: 0.2s;">
          <div class="message-bubble-text">${lastMsg.text}</div>
          <div class="message-bubble-time">Just now</div>
        </div>
      `;
      body.scrollTop = body.scrollHeight;
    }
  };

  sendBtn?.addEventListener('click', doSend);
  input?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      doSend();
    }
  });

  // Quick replies
  document.getElementById('chat-quick-replies')?.querySelectorAll('.message-quick-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      input.value = btn.dataset.text;
      input.focus();
    });
  });

  setTimeout(() => input?.focus(), 100);
}
