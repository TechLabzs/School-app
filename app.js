// State Management
const state = {
    reminders: [],
    messages: [],
    calcValue: '',
    calcOperator: null,
    calcPrevValue: ''
};

// Load data from localStorage
function loadData() {
    const saved = localStorage.getItem('schoolAppData');
    if (saved) {
        const data = JSON.parse(saved);
        state.reminders = data.reminders || [];
        state.messages = data.messages || [];
    }
}

// Save data to localStorage
function saveData() {
    localStorage.setItem('schoolAppData', JSON.stringify({
        reminders: state.reminders,
        messages: state.messages
    }));
}

// ========== TAB NAVIGATION ==========
document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        const tabName = btn.dataset.tab;
        switchTab(tabName);
    });
});

function switchTab(tabName) {
    // Remove active class from all tabs and contents
    document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));

    // Add active class to selected tab and content
    document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
    document.getElementById(tabName).classList.add('active');

    // Initialize specific features when tab is opened
    if (tabName === 'clock') {
        updateClock();
    }
}

// ========== REMINDERS SECTION ==========
document.getElementById('addReminderBtn').addEventListener('click', addReminder);

function addReminder() {
    const title = document.getElementById('reminderTitle').value.trim();
    const time = document.getElementById('reminderTime').value;
    const subject = document.getElementById('reminderSubject').value;

    if (!title || !time || !subject) {
        alert('Please fill in all fields');
        return;
    }

    const reminder = {
        id: Date.now(),
        title,
        time,
        subject,
        completed: false
    };

    state.reminders.push(reminder);
    saveData();

    // Clear inputs
    document.getElementById('reminderTitle').value = '';
    document.getElementById('reminderTime').value = '';
    document.getElementById('reminderSubject').value = '';

    renderReminders();
}

function renderReminders() {
    const remindersList = document.getElementById('remindersList');
    
    if (state.reminders.length === 0) {
        remindersList.innerHTML = '<p style="text-align: center; color: #999; padding: 20px;">No reminders yet. Add one to get started!</p>';
        return;
    }

    remindersList.innerHTML = state.reminders.map(reminder => `
        <div class="reminder-card">
            <div class="reminder-title">${reminder.title}</div>
            <div class="reminder-subject">${reminder.subject}</div>
            <div class="reminder-time">⏰ ${reminder.time}</div>
            <button class="reminder-delete" onclick="deleteReminder(${reminder.id})">Delete</button>
        </div>
    `).join('');
}

function deleteReminder(id) {
    state.reminders = state.reminders.filter(r => r.id !== id);
    saveData();
    renderReminders();
}

// ========== CHAT SECTION ==========
document.getElementById('sendMessageBtn').addEventListener('click', sendMessage);
document.getElementById('chatInput').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') sendMessage();
});

function sendMessage() {
    const input = document.getElementById('chatInput');
    const text = input.value.trim();

    if (!text) return;

    // Add user's message
    const userMessage = {
        id: Date.now(),
        text,
        sender: 'user',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    state.messages.push(userMessage);
    renderChat();
    input.value = '';

    // Simulate a reply after 1 second
    setTimeout(() => {
        const replies = [
            'That sounds great!',
            'I agree!',
            'Nice idea!',
            'Awesome!',
            'Cool!',
            'Thanks for sharing!',
            'Tell me more!',
            'I like that!'
        ];

        const botMessage = {
            id: Date.now() + 1,
            text: replies[Math.floor(Math.random() * replies.length)],
            sender: 'bot',
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };

        state.messages.push(botMessage);
        renderChat();
    }, 800);

    saveData();
}

function renderChat() {
    const chatMessages = document.getElementById('chatMessages');
    chatMessages.innerHTML = state.messages.map(msg => `
        <div class="chat-message message-${msg.sender === 'user' ? 'own' : 'other'}">
            <div class="message-bubble">${escapeHtml(msg.text)}</div>
        </div>
    `).join('');

    // Scroll to bottom
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// ========== CALCULATOR SECTION ==========
let calculatorDisplay = '';

document.querySelectorAll('.calc-btn:not(.clear):not(.equals)').forEach(btn => {
    btn.addEventListener('click', () => {
        const value = btn.dataset.value;
        handleCalcInput(value);
    });
});

document.getElementById('calcClear').addEventListener('click', () => {
    state.calcValue = '';
    state.calcOperator = null;
    state.calcPrevValue = '';
    updateCalcDisplay('0');
});

document.getElementById('calcEquals').addEventListener('click', calculateResult);

function handleCalcInput(value) {
    const display = document.getElementById('calcDisplay');

    if (['+', '-', '*', '/'].includes(value)) {
        if (state.calcValue) {
            state.calcPrevValue = state.calcValue;
            state.calcOperator = value;
            state.calcValue = '';
            updateCalcDisplay(display.textContent + ' ' + (value === '/' ? '÷' : value === '*' ? '×' : value === '-' ? '−' : '+') + ' ');
        }
    } else if (value === '.') {
        if (!state.calcValue.includes('.')) {
            state.calcValue += value;
            updateCalcDisplay(display.textContent + value);
        }
    } else {
        state.calcValue += value;
        updateCalcDisplay(display.textContent + value);
    }
}

function calculateResult() {
    if (state.calcPrevValue && state.calcOperator && state.calcValue) {
        let result;
        const prev = parseFloat(state.calcPrevValue);
        const current = parseFloat(state.calcValue);

        switch (state.calcOperator) {
            case '+':
                result = prev + current;
                break;
            case '-':
                result = prev - current;
                break;
            case '*':
                result = prev * current;
                break;
            case '/':
                result = prev / current;
                break;
            default:
                return;
        }

        updateCalcDisplay(Math.round(result * 10000) / 10000);
        state.calcValue = String(result);
        state.calcOperator = null;
        state.calcPrevValue = '';
    }
}

function updateCalcDisplay(value) {
    document.getElementById('calcDisplay').textContent = value;
}

// ========== CLOCK SECTION ==========
function updateClock() {
    const now = new Date();

    // Update digital clock
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    document.getElementById('timeDisplay').textContent = `${hours}:${minutes}:${seconds}`;

    const day = String(now.getDate()).padStart(2, '0');
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const year = now.getFullYear();
    document.getElementById('dateDisplay').textContent = `${day}/${month}/${year}`;

    // Update analog clock
    const secondDegrees = (seconds / 60) * 360;
    const minuteDegrees = (minutes / 60) * 360 + (seconds / 60) * 6;
    const hourDegrees = (hours % 12 / 12) * 360 + (minutes / 60) * 30;

    const hourHand = document.getElementById('hourHand');
    const minuteHand = document.getElementById('minuteHand');
    const secondHand = document.getElementById('secondHand');

    if (hourHand) hourHand.style.transform = `rotate(${hourDegrees}deg)`;
    if (minuteHand) minuteHand.style.transform = `rotate(${minuteDegrees}deg)`;
    if (secondHand) secondHand.style.transform = `rotate(${secondDegrees}deg)`;

    setTimeout(updateClock, 1000);
}

// ========== INITIALIZATION ==========
document.addEventListener('DOMContentLoaded', () => {
    loadData();
    renderReminders();
    renderChat();

    // Start clock if visible
    if (document.getElementById('clock').classList.contains('active')) {
        updateClock();
    }

    // Add notification sound for reminders (optional - just console logs for now)
    checkReminders();
});

// Check for upcoming reminders every minute
function checkReminders() {
    setInterval(() => {
        const now = new Date();
        const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

        state.reminders.forEach(reminder => {
            if (reminder.time === currentTime && !reminder.completed) {
                showNotification(`Reminder: ${reminder.title} (${reminder.subject})`);
                reminder.completed = true;
            }
        });
    }, 60000); // Check every minute
}

function showNotification(message) {
    if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('School Assistant', { body: message });
    }
    console.log('🔔 ' + message);
}

// Request notification permission
if ('Notification' in window && Notification.permission === 'default') {
    Notification.requestPermission();
}
