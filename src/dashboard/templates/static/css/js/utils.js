// src/dashboard/static/js/utils.js
/**
 * Utility Functions Module
 * Common helper functions used across the application
 */

const Utils = {
    // ============ STRING UTILITIES ============
    
    /**
     * Escape HTML entities to prevent XSS
     */
    escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    },
    
    /**
     * Truncate string to specified length
     */
    truncate(text, length = 50, suffix = '...') {
        if (!text) return '';
        if (text.length <= length) return text;
        return text.substring(0, length) + suffix;
    },
    
    /**
     * Capitalize first letter of each word
     */
    capitalizeWords(text) {
        return text.replace(/\b\w/g, c => c.toUpperCase());
    },
    
    /**
     * Generate random string
     */
    randomString(length = 8) {
        const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        return Array.from({length}, () => chars[Math.floor(Math.random() * chars.length)]).join('');
    },
    
    // ============ DATE/TIME UTILITIES ============
    
    /**
     * Format timestamp to readable string
     */
    formatTimestamp(timestamp) {
        const date = new Date(timestamp);
        return date.toLocaleString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
    },
    
    /**
     * Format duration in seconds to HH:MM:SS
     */
    formatDuration(seconds) {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = seconds % 60;
        return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    },
    
    /**
     * Time ago in words
     */
    timeAgo(date) {
        const diff = Date.now() - new Date(date).getTime();
        const minutes = Math.floor(diff / 60000);
        
        if (minutes < 1) return 'Just now';
        if (minutes < 60) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
        
        const hours = Math.floor(minutes / 60);
        if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
        
        const days = Math.floor(hours / 24);
        if (days < 7) return `${days} day${days > 1 ? 's' : ''} ago`;
        
        return this.formatTimestamp(date);
    },
    
    // ============ DOM UTILITIES ============
    
    /**
     * Get element or throw error
     */
    getElement(selector, context = document) {
        const element = context.querySelector(selector);
        if (!element) {
            throw new Error(`Element not found: ${selector}`);
        }
        return element;
    },
    
    /**
     * Toggle element visibility
     */
    toggleVisibility(element, visible) {
        if (typeof element === 'string') {
            element = document.querySelector(element);
        }
        if (element) {
            element.style.display = visible ? '' : 'none';
        }
    },
    
    /**
     * Add multiple event listeners
     */
    addEventListeners(element, events) {
        Object.entries(events).forEach(([event, handler]) => {
            element.addEventListener(event, handler);
        });
    },
    
    /**
     * Create DOM element with attributes
     */
    createElement(tag, attributes = {}, children = []) {
        const element = document.createElement(tag);
        
        Object.entries(attributes).forEach(([key, value]) => {
            if (key === 'text') {
                element.textContent = value;
            } else if (key === 'html') {
                element.innerHTML = value;
            } else if (key === 'className') {
                element.className = value;
            } else if (key === 'style' && typeof value === 'object') {
                Object.assign(element.style, value);
            } else {
                element.setAttribute(key, value);
            }
        });
        
        children.forEach(child => {
            element.appendChild(typeof child === 'string' ? 
                document.createTextNode(child) : child);
        });
        
        return element;
    },
    
    // ============ DATA UTILITIES ============
    
    /**
     * Parse log entry
     */
    parseLogEntry(log) {
        const parts = log.split('|').map(p => p.trim());
        return {
            timestamp: parts[0] || '',
            key: parts[1] || '',
            window: parts[2] || '',
            full: log
        };
    },
    
    /**
     * Group array by key
     */
    groupBy(array, key) {
        return array.reduce((result, item) => {
            const groupKey = typeof key === 'function' ? key(item) : item[key];
            if (!result[groupKey]) {
                result[groupKey] = [];
            }
            result[groupKey].push(item);
            return result;
        }, {});
    },
    
    /**
     * Calculate frequency distribution
     */
    frequencyDistribution(array) {
        return array.reduce((freq, item) => {
            freq[item] = (freq[item] || 0) + 1;
            return freq;
        }, {});
    },
    
    /**
     * Check if value is sensitive
     */
    isSensitive(value, keywords = ['password', 'username', 'email', 'login', 'credit']) {
        if (!value) return false;
        const lower = value.toLowerCase();
        return keywords.some(keyword => lower.includes(keyword));
    },
    
    // ============ VALIDATION UTILITIES ============
    
    /**
     * Validate email
     */
    validateEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    },
    
    /**
     * Validate URL
     */
    validateURL(url) {
        try {
            new URL(url);
            return true;
        } catch {
            return false;
        }
    },
    
    /**
     * Validate IP address
     */
    validateIP(ip) {
        return /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/.test(ip);
    },
    
    // ============ COLOR UTILITIES ============
    
    /**
     * Get color for threat level
     */
    getThreatColor(level) {
        const colors = {
            low: '#4caf50',
            medium: '#ff9800',
            high: '#f44336',
            critical: '#d32f2f'
        };
        return colors[level] || colors.medium;
    },
    
    /**
     * Get color for status
     */
    getStatusColor(status) {
        const colors = {
            online: '#4caf50',
            offline: '#f44336',
            warning: '#ff9800',
            idle: '#2196f3'
        };
        return colors[status] || colors.idle;
    },
    
    /**
     * Generate gradient color
     */
    gradientColor(percent, startColor = '#4caf50', endColor = '#f44336') {
        const start = this.hexToRgb(startColor);
        const end = this.hexToRgb(endColor);
        
        const r = Math.round(start.r + (end.r - start.r) * (percent / 100));
        const g = Math.round(start.g + (end.g - start.g) * (percent / 100));
        const b = Math.round(start.b + (end.b - start.b) * (percent / 100));
        
        return `rgb(${r}, ${g}, ${b})`;
    },
    
    hexToRgb(hex) {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : { r: 0, g: 0, b: 0 };
    },
    
    // ============ FILE UTILITIES ============
    
    /**
     * Download file
     */
    downloadFile(content, filename, type = 'text/plain') {
        const blob = new Blob([content], { type });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    },
    
    /**
     * Read file as text
     */
    readFile(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target.result);
            reader.onerror = (e) => reject(e.target.error);
            reader.readAsText(file);
        });
    },
    
    /**
     * Format file size
     */
    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    },
    
    // ============ PERFORMANCE UTILITIES ============
    
    /**
     * Debounce function
     */
    debounce(func, wait = 300) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },
    
    /**
     * Throttle function
     */
    throttle(func, limit = 300) {
        let inThrottle;
        return function executedFunction(...args) {
            if (!inThrottle) {
                func(...args);
                inThrottle = true;
                setTimeout(() => {
                    inThrottle = false;
                }, limit);
            }
        };
    },
    
    /**
     * Measure function execution time
     */
    measureTime(fn) {
        const start = performance.now();
        const result = fn();
        const end = performance.now();
        return {
            result: result,
            time: end - start
        };
    },
    
    // ============ BROWSER UTILITIES ============
    
    /**
     * Check if browser supports WebSocket
     */
    supportsWebSocket() {
        return 'WebSocket' in window && window.WebSocket.CLOSING !== undefined;
    },
    
    /**
     * Check if browser supports localStorage
     */
    supportsLocalStorage() {
        try {
            localStorage.setItem('test', 'test');
            localStorage.removeItem('test');
            return true;
        } catch {
            return false;
        }
    },
    
    /**
     * Get browser info
     */
    getBrowserInfo() {
        const ua = navigator.userAgent;
        return {
            name: this.getBrowserName(ua),
            version: this.getBrowserVersion(ua),
            platform: navigator.platform,
            language: navigator.language,
            screen: `${window.screen.width}x${window.screen.height}`
        };
    },
    
    getBrowserName(ua) {
        if (ua.includes('Firefox')) return 'Firefox';
        if (ua.includes('Edg')) return 'Edge';
        if (ua.includes('Chrome')) return 'Chrome';
        if (ua.includes('Safari')) return 'Safari';
        if (ua.includes('Opera')) return 'Opera';
        return 'Unknown';
    },
    
    getBrowserVersion(ua) {
        const match = ua.match(/(?:Firefox|Edg|Chrome|Safari|Opera)[\/\s](\d+\.\d+)/);
        return match ? match[1] : 'Unknown';
    }
};

// Export for use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Utils;
}
