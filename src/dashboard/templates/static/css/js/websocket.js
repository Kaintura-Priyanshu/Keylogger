// src/dashboard/static/js/websocket.js
/**
 * WebSocket Manager
 * Handles real-time bidirectional communication
 */

class WebSocketManager {
    constructor(options = {}) {
        this.url = options.url || this.getWebSocketURL();
        this.reconnectDelay = options.reconnectDelay || 3000;
        this.maxReconnectAttempts = options.maxReconnectAttempts || 10;
        this.reconnectAttempts = 0;
        this.isConnected = false;
        this.isReconnecting = false;
        this.ws = null;
        this.handlers = new Map();
        this.messageQueue = [];
        
        this.init();
    }
    
    init() {
        this.connect();
        this.setupVisibilityHandling();
    }
    
    getWebSocketURL() {
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const host = window.location.host;
        return `${protocol}//${host}/ws`;
    }
    
    connect() {
        if (this.isConnected) return;
        
        try {
            console.log(' Connecting WebSocket...');
            this.ws = new WebSocket(this.url);
            
            this.ws.onopen = () => {
                this.isConnected = true;
                this.reconnectAttempts = 0;
                this.isReconnecting = false;
                console.log(' WebSocket connected');
                
                this.flushMessageQueue();
                this.dispatchEvent('connected', {});
                this.updateConnectionStatus('online');
            };
            
            this.ws.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data);
                    this.handleMessage(data);
                } catch (error) {
                    console.error('Failed to parse WebSocket message:', error);
                }
            };
            
            this.ws.onerror = (error) => {
                console.error('WebSocket error:', error);
                this.dispatchEvent('error', error);
            };
            
            this.ws.onclose = (event) => {
                this.isConnected = false;
                console.log(' WebSocket disconnected', event.code, event.reason);
                this.dispatchEvent('disconnected', event);
                this.updateConnectionStatus('offline');
                
                // Attempt reconnect
                if (!this.isReconnecting) {
                    this.reconnect();
                }
            };
        } catch (error) {
            console.error('WebSocket connection failed:', error);
            this.reconnect();
        }
    }
    
    reconnect() {
        if (this.isReconnecting) return;
        
        this.isReconnecting = true;
        this.reconnectAttempts++;
        
        if (this.reconnectAttempts > this.maxReconnectAttempts) {
            console.error('Max reconnection attempts reached');
            this.dispatchEvent('reconnect_failed', { attempts: this.reconnectAttempts });
            this.updateConnectionStatus('error');
            return;
        }
        
        const delay = Math.min(this.reconnectDelay * this.reconnectAttempts, 30000);
        console.log(` Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts})`);
        
        setTimeout(() => {
            this.connect();
        }, delay);
    }
    
    handleMessage(data) {
        // Dispatch to registered handlers
        this.dispatchEvent('message', data);
        
        // Handle specific message types
        switch(data.type) {
            case 'keystroke':
                this.dispatchEvent('keystroke', data);
                break;
            case 'detection':
                this.dispatchEvent('detection', data);
                break;
            case 'stats':
                this.dispatchEvent('stats', data);
                break;
            case 'system':
                this.dispatchEvent('system', data);
                break;
            case 'pong':
                this.handlePong(data);
                break;
            default:
                console.log('Unknown message type:', data.type);
        }
    }
    
    send(data) {
        const message = typeof data === 'string' ? data : JSON.stringify(data);
        
        if (this.isConnected && this.ws?.readyState === WebSocket.OPEN) {
            this.ws.send(message);
        } else {
            console.log(' Queueing message');
            this.messageQueue.push(message);
        }
    }
    
    flushMessageQueue() {
        while (this.messageQueue.length > 0) {
            const message = this.messageQueue.shift();
            this.send(message);
        }
    }
    
    on(event, handler) {
        if (!this.handlers.has(event)) {
            this.handlers.set(event, []);
        }
        this.handlers.get(event).push(handler);
    }
    
    off(event, handler) {
        if (this.handlers.has(event)) {
            const handlers = this.handlers.get(event);
            const index = handlers.indexOf(handler);
            if (index !== -1) {
                handlers.splice(index, 1);
            }
        }
    }
    
    dispatchEvent(event, data) {
        if (this.handlers.has(event)) {
            this.handlers.get(event).forEach(handler => {
                try {
                    handler(data);
                } catch (error) {
                    console.error(`Error in handler for ${event}:`, error);
                }
            });
        }
    }
    
    // ============ SPECIFIC FUNCTIONS ============
    
    sendKeystroke(key, window, timestamp) {
        this.send({
            type: 'keystroke',
            key: key,
            window: window || 'Active Window',
            timestamp: timestamp || new Date().toISOString()
        });
    }
    
    requestStats() {
        this.send({ type: 'request_stats' });
    }
    
    ping() {
        this.send({ type: 'ping', timestamp: Date.now() });
    }
    
    handlePong(data) {
        const latency = Date.now() - data.timestamp;
        this.dispatchEvent('latency', { latency });
        this.updateLatency(latency);
    }
    
    // ============ UI UPDATES ============
    
    updateConnectionStatus(status) {
        const indicator = document.getElementById('connection-status');
        if (!indicator) return;
        
        const statusMap = {
            online: { text: 'Online', icon: 'fa-circle', color: '#4caf50' },
            offline: { text: 'Offline', icon: 'fa-circle', color: '#f44336' },
            error: { text: 'Error', icon: 'fa-exclamation-triangle', color: '#ff9800' },
            connecting: { text: 'Connecting...', icon: 'fa-spinner fa-spin', color: '#2196f3' }
        };
        
        const info = statusMap[status] || statusMap.offline;
        
        indicator.innerHTML = `
            <span style="display: flex; align-items: center; gap: 6px;">
                <i class="fas ${info.icon}" style="color: ${info.color};"></i>
                <span style="color: ${info.color};">${info.text}</span>
            </span>
        `;
        
        indicator.className = `connection-status status-${status}`;
    }
    
    updateLatency(latency) {
        const element = document.getElementById('connection-latency');
        if (element) {
            element.textContent = `${latency}ms`;
            element.style.color = latency < 100 ? '#4caf50' : 
                                 latency < 300 ? '#ff9800' : '#f44336';
        }
    }
    
    setupVisibilityHandling() {
        // Handle page visibility changes
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                // Page hidden - reduce pings
                console.log(' Page hidden, reducing activity');
            } else {
                // Page visible - check connection
                console.log(' Page visible, checking connection');
                if (!this.isConnected && !this.isReconnecting) {
                    this.connect();
                }
                this.ping();
            }
        });
        
        // Handle online/offline events
        window.addEventListener('online', () => {
            console.log('🌐 Network back online');
            if (!this.isConnected) {
                this.connect();
            }
        });
        
        window.addEventListener('offline', () => {
            console.log('🌐 Network offline');
            if (this.ws) {
                this.ws.close();
            }
        });
    }
    
    // ============ CLEANUP ============
    
    disconnect() {
        if (this.ws) {
            this.ws.close();
            this.ws = null;
        }
        this.isConnected = false;
        this.isReconnecting = false;
        this.updateConnectionStatus('offline');
    }
    
    destroy() {
        this.disconnect();
        this.handlers.clear();
        this.messageQueue = [];
    }
}

// Initialize WebSocket when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    const ws = new WebSocketManager({
        reconnectDelay: 3000,
        maxReconnectAttempts: 10
    });
    
    // Store globally
    window.wsManager = ws;
    
    // Listen for keystrokes
    ws.on('keystroke', (data) => {
        if (window.dashboard) {
            window.dashboard.addKeystroke(data);
        }
    });
    
    // Listen for detection alerts
    ws.on('detection', (data) => {
        if (window.detection) {
            window.detection.handleThreat(data);
        }
    });
    
    // Listen for stats updates
    ws.on('stats', (data) => {
        if (window.dashboard) {
            window.dashboard.updateStats(data);
        }
    });
    
    // Update connection status
    ws.on('connected', () => {
        console.log(' WebSocket connection established');
        ws.updateConnectionStatus('online');
    });
    
    ws.on('disconnected', () => {
        console.log(' WebSocket connection lost');
        ws.updateConnectionStatus('offline');
    });
});

// Expose WebSocket functions
window.sendKeystroke = (key, window) => {
    window.wsManager?.sendKeystroke(key, window);
};

window.sendMessage = (data) => {
    window.wsManager?.send(data);
};
