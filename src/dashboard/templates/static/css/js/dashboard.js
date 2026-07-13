// src/dashboard/static/js/dashboard.js
/**
 * Main Dashboard JavaScript
 * Handles real-time keystroke display, statistics, and interactions
 */

class Dashboard {
    constructor() {
        this.logs = [];
        this.chart = null;
        this.sessionStart = Date.now();
        this.alertCount = 0;
        this.autoRefreshInterval = null;
        this.isPaused = false;
        
        this.init();
    }
    
    init() {
        console.log('🚀 Dashboard initializing...');
        
        // Initialize components
        this.initializeEventListeners();
        this.initializeCharts();
        this.startAutoRefresh();
        this.startSessionTimer();
        this.loadInitialData();
        
        // Check for WebSocket support
        if (window.WebSocket) {
            this.initWebSocket();
        }
    }
    
    initializeEventListeners() {
        // Refresh button
        document.getElementById('refresh-btn')?.addEventListener('click', () => {
            this.refreshData();
        });
        
        // Clear logs button
        document.getElementById('clear-btn')?.addEventListener('click', () => {
            this.clearLogs();
        });
        
        // Pause/Resume
        document.getElementById('pause-btn')?.addEventListener('click', () => {
            this.togglePause();
        });
        
        // Export button
        document.getElementById('export-btn')?.addEventListener('click', () => {
            this.exportData();
        });
        
        // Search input
        document.getElementById('search-input')?.addEventListener('input', (e) => {
            this.filterLogs(e.target.value);
        });
    }
    
    initializeCharts() {
        const ctx = document.getElementById('keystroke-chart');
        if (!ctx) return;
        
        this.chart = new Chart(ctx.getContext('2d'), {
            type: 'bar',
            data: {
                labels: Array.from({length: 10}, (_, i) => `${i+1}m ago`),
                datasets: [{
                    label: 'Keystrokes per Minute',
                    data: Array(10).fill(0),
                    backgroundColor: 'rgba(88, 166, 255, 0.6)',
                    borderColor: 'rgba(88, 166, 255, 1)',
                    borderWidth: 2,
                    borderRadius: 4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return `${context.parsed.y} keystrokes`;
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            stepSize: 1,
                            color: '#8b949e'
                        },
                        grid: {
                            color: 'rgba(48, 54, 61, 0.5)'
                        }
                    },
                    x: {
                        ticks: {
                            color: '#8b949e'
                        },
                        grid: {
                            display: false
                        }
                    }
                },
                animation: {
                    duration: 500
                }
            }
        });
    }
    
    startAutoRefresh() {
        this.autoRefreshInterval = setInterval(() => {
            if (!this.isPaused) {
                this.refreshData();
            }
        }, 5000); // Refresh every 5 seconds
    }
    
    startSessionTimer() {
        setInterval(() => {
            const elapsed = Math.floor((Date.now() - this.sessionStart) / 1000);
            const hours = String(Math.floor(elapsed / 3600)).padStart(2, '0');
            const minutes = String(Math.floor((elapsed % 3600) / 60)).padStart(2, '0');
            const seconds = String(elapsed % 60).padStart(2, '0');
            
            const timerElement = document.getElementById('session-time');
            if (timerElement) {
                timerElement.textContent = `${hours}:${minutes}:${seconds}`;
            }
        }, 1000);
    }
    
    loadInitialData() {
        this.fetchLogs();
    }
    
    initWebSocket() {
        try {
            const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
            const wsUrl = `${protocol}//${window.location.host}/ws`;
            this.ws = new WebSocket(wsUrl);
            
            this.ws.onopen = () => {
                console.log(' WebSocket connected');
                this.showNotification('WebSocket connected', 'success');
            };
            
            this.ws.onmessage = (event) => {
                const data = JSON.parse(event.data);
                this.handleWebSocketMessage(data);
            };
            
            this.ws.onerror = (error) => {
                console.error('WebSocket error:', error);
                this.showNotification('WebSocket error', 'danger');
            };
            
            this.ws.onclose = () => {
                console.log('🔌 WebSocket disconnected');
                // Attempt to reconnect after 5 seconds
                setTimeout(() => {
                    if (this.ws.readyState === WebSocket.CLOSED) {
                        this.initWebSocket();
                    }
                }, 5000);
            };
        } catch (e) {
            console.warn('WebSocket not supported, falling back to polling');
        }
    }
    
    handleWebSocketMessage(data) {
        switch(data.type) {
            case 'keystroke':
                this.addKeystroke(data);
                break;
            case 'detection':
                this.handleDetectionAlert(data);
                break;
            case 'stats':
                this.updateStats(data);
                break;
            case 'system':
                this.showNotification(data.message, data.level);
                break;
            default:
                console.log('Unknown WebSocket message:', data);
        }
    }
    
    async fetchLogs() {
        try {
            const response = await fetch('/api/logs');
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            
            const data = await response.json();
            this.logs = data.logs || [];
            this.renderLogs();
            this.updateStats();
            this.updateChart();
        } catch (error) {
            console.error('Error fetching logs:', error);
            this.showNotification('Failed to fetch logs', 'danger');
        }
    }
    
    renderLogs() {
        const tbody = document.getElementById('logs-body');
        if (!tbody) return;
        
        if (this.logs.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="4" class="text-center text-muted">
                        <i class="fas fa-inbox" style="font-size: 2rem; display: block; margin: 20px auto;"></i>
                        <p>No keystrokes logged yet. Start typing to see activity!</p>
                    </td>
                </tr>
            `;
            return;
        }
        
        // Show latest 50 logs (reversed for newest first)
        const recentLogs = this.logs.slice(-50).reverse();
        
        tbody.innerHTML = recentLogs.map(log => {
            const [timestamp, key, windowTitle] = this.parseLogEntry(log);
            const isSensitive = this.isSensitiveKey(key);
            
            return `
                <tr class="fade-in ${isSensitive ? 'sensitive-row' : ''}">
                    <td>${this.escapeHtml(timestamp)}</td>
                    <td>
                        <span class="key-badge ${isSensitive ? 'sensitive-key' : ''}">
                            ${this.escapeHtml(key)}
                        </span>
                    </td>
                    <td>${this.escapeHtml(windowTitle || 'Unknown')}</td>
                    <td>
                        <span class="badge ${isSensitive ? 'badge-danger' : 'badge-success'}">
                            ${isSensitive ? ' Sensitive' : ' Normal'}
                        </span>
                    </td>
                </tr>
            `;
        }).join('');
        
        // Update log count
        document.getElementById('log-count')?.textContent = `${this.logs.length} entries`;
    }
    
    parseLogEntry(log) {
        // Parse log format: "2024-01-15 10:30:45 | key | window"
        const parts = log.split('|').map(p => p.trim());
        
        if (parts.length >= 2) {
            return [parts[0], parts[1], parts[2] || ''];
        }
        
        // Fallback: just return the whole log as key
        return [new Date().toLocaleString(), log, ''];
    }
    
    isSensitiveKey(key) {
        const sensitive = ['password', 'username', 'email', 'login', 'credit', 'card', 'ssn', 'pwd', 'pass'];
        const lowerKey = key.toLowerCase();
        return sensitive.some(s => lowerKey.includes(s));
    }
    
    updateStats() {
        // Update total keystrokes
        document.getElementById('total-keystrokes')?.textContent = this.logs.length;
        
        // Update sensitive count
        const sensitiveCount = this.logs.filter(log => {
            const [, key] = this.parseLogEntry(log);
            return this.isSensitiveKey(key);
        }).length;
        document.getElementById('sensitive-count')?.textContent = sensitiveCount;
        
        // Update typing speed (approximate)
        if (this.logs.length > 10) {
            const recent = this.logs.slice(-20).join(' ');
            const words = recent.split(/\s+/).length;
            const wpm = Math.round(words / 2); // Approximate WPM
            document.getElementById('typing-speed')?.textContent = `${wpm} WPM`;
        }
        
        // Update security score
        const score = Math.max(0, 100 - (sensitiveCount * 2));
        document.getElementById('security-score')?.textContent = `${Math.min(100, score)}%`;
    }
    
    updateChart() {
        if (!this.chart) return;
        
        // Count keystrokes per minute (last 10 minutes)
        const counts = Array(10).fill(0);
        const now = Date.now();
        
        this.logs.forEach(log => {
            const [timestamp] = this.parseLogEntry(log);
            const logTime = new Date(timestamp).getTime();
            if (!isNaN(logTime)) {
                const diffMinutes = Math.floor((now - logTime) / (1000 * 60));
                if (diffMinutes >= 0 && diffMinutes < 10) {
                    counts[9 - diffMinutes]++;
                }
            }
        });
        
        this.chart.data.datasets[0].data = counts;
        this.chart.update();
    }
    
    refreshData() {
        this.fetchLogs();
    }
    
    togglePause() {
        this.isPaused = !this.isPaused;
        const pauseBtn = document.getElementById('pause-btn');
        if (pauseBtn) {
            pauseBtn.innerHTML = this.isPaused ? 
                '<i class="fas fa-play"></i> Resume' : 
                '<i class="fas fa-pause"></i> Pause';
            pauseBtn.classList.toggle('btn-warning', this.isPaused);
            pauseBtn.classList.toggle('btn-primary', !this.isPaused);
        }
        this.showNotification(
            this.isPaused ? '⏸️ Auto-refresh paused' : '▶️ Auto-refresh resumed',
            this.isPaused ? 'warning' : 'info'
        );
    }
    
    async clearLogs() {
        if (!confirm(' Are you sure you want to clear all logs?')) {
            return;
        }
        
        try {
            const response = await fetch('/api/logs/clear', { method: 'POST' });
            if (!response.ok) throw new Error('Failed to clear logs');
            
            this.logs = [];
            this.renderLogs();
            this.updateStats();
            this.updateChart();
            this.showNotification('🗑️ Logs cleared successfully', 'success');
        } catch (error) {
            console.error('Error clearing logs:', error);
            this.showNotification('Failed to clear logs', 'danger');
        }
    }
    
    async exportData() {
        try {
            const response = await fetch('/api/logs/export');
            if (!response.ok) throw new Error('Export failed');
            
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `keylog_${new Date().toISOString().slice(0,10)}.csv`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
            
            this.showNotification('📥 Logs exported successfully', 'success');
        } catch (error) {
            console.error('Export error:', error);
            this.showNotification('Export failed: ' + error.message, 'danger');
        }
    }
    
    filterLogs(searchTerm) {
        if (!searchTerm || searchTerm.trim() === '') {
            this.renderLogs();
            return;
        }
        
        const filtered = this.logs.filter(log => {
            const [timestamp, key, windowTitle] = this.parseLogEntry(log);
            const search = searchTerm.toLowerCase();
            return timestamp.toLowerCase().includes(search) ||
                   key.toLowerCase().includes(search) ||
                   windowTitle.toLowerCase().includes(search);
        });
        
        const tbody = document.getElementById('logs-body');
        if (!tbody) return;
        
        if (filtered.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="4" class="text-center text-muted">
                        <i class="fas fa-search" style="font-size: 2rem; display: block; margin: 20px auto;"></i>
                        <p>No logs match "${this.escapeHtml(searchTerm)}"</p>
                    </td>
                </tr>
            `;
            return;
        }
        
        // Temporarily replace logs with filtered for display
        const originalLogs = this.logs;
        this.logs = filtered;
        this.renderLogs();
        this.logs = originalLogs; // Restore
    }
    
    addKeystroke(data) {
        // Add keystroke to logs
        const timestamp = new Date().toISOString().replace('T', ' ').slice(0, 19);
        const logEntry = `${timestamp} | ${data.key} | ${data.window || 'Active Window'}`;
        this.logs.push(logEntry);
        
        // Limit logs to prevent memory issues
        if (this.logs.length > 10000) {
            this.logs = this.logs.slice(-5000);
        }
        
        // Update UI
        this.renderLogs();
        this.updateStats();
        this.updateChart();
    }
    
    handleDetectionAlert(data) {
        // Show detection alert
        this.showNotification(
            `🚨 ${data.threat} detected: ${data.process} (PID: ${data.pid})`,
            'danger'
        );
        
        // Add to alerts list
        const alertsList = document.getElementById('alerts-list');
        if (alertsList) {
            const alertDiv = document.createElement('div');
            alertDiv.className = `alert alert-danger slide-in`;
            alertDiv.innerHTML = `
                <i class="fas fa-exclamation-triangle"></i>
                <div>
                    <strong>${data.threat}</strong> - ${data.process} (PID: ${data.pid})
                    <br><small>${data.reason || 'Suspicious behavior detected'}</small>
                </div>
                <button class="close-btn" onclick="this.parentElement.remove()">&times;</button>
            `;
            alertsList.prepend(alertDiv);
            
            // Remove old alerts (keep max 10)
            while (alertsList.children.length > 10) {
                alertsList.removeChild(alertsList.lastChild);
            }
        }
    }
    
    showNotification(message, type = 'info') {
        const container = document.getElementById('notification-container');
        if (!container) {
            // Create container if it doesn't exist
            const newContainer = document.createElement('div');
            newContainer.id = 'notification-container';
            newContainer.style.position = 'fixed';
            newContainer.style.top = '80px';
            newContainer.style.right = '20px';
            newContainer.style.zIndex = '9999';
            newContainer.style.maxWidth = '400px';
            document.body.appendChild(newContainer);
            return this.showNotification(message, type);
        }
        
        const icons = {
            success: 'check-circle',
            info: 'info-circle',
            warning: 'exclamation-triangle',
            danger: 'times-circle'
        };
        
        const notification = document.createElement('div');
        notification.className = `alert alert-${type} slide-in`;
        notification.style.cssText = `
            margin-bottom: 10px;
            padding: 12px 18px;
            background: var(--card-bg);
            border: 1px solid var(--border-color);
            border-radius: 8px;
            box-shadow: 0 4px 20px rgba(0,0,0,0.5);
        `;
        notification.innerHTML = `
            <i class="fas fa-${icons[type] || 'info-circle'}"></i>
            ${message}
            <button class="close-btn" onclick="this.parentElement.remove()">&times;</button>
        `;
        
        container.appendChild(notification);
        
        // Auto-remove after 5 seconds
        setTimeout(() => {
            if (notification.parentElement) {
                notification.remove();
            }
        }, 5000);
    }
    
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Initialize dashboard when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.dashboard = new Dashboard();
});

// Expose functions globally
window.refreshLogs = () => window.dashboard?.refreshData();
window.clearLogs = () => window.dashboard?.clearLogs();
window.exportData = () => window.dashboard?.exportData();
window.togglePause = () => window.dashboard?.togglePause();
