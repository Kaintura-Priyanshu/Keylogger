// src/dashboard/static/js/detection.js
/**
 * Detection Module
 * Handles real-time detection scanning and alerts
 */

class DetectionEngine {
    constructor() {
        this.isScanning = false;
        this.isMonitoring = false;
        this.scanInterval = null;
        this.detectionHistory = [];
        this.threatLevels = {
            LOW: 'low',
            MEDIUM: 'medium',
            HIGH: 'high',
            CRITICAL: 'critical'
        };
        
        this.init();
    }
    
    init() {
        this.setupEventListeners();
        this.loadDetectionHistory();
        this.updateStatus('ready');
    }
    
    setupEventListeners() {
        // Scan button
        document.getElementById('scan-btn')?.addEventListener('click', () => {
            this.startScan();
        });
        
        // Monitor toggle
        document.getElementById('monitor-btn')?.addEventListener('click', () => {
            this.toggleMonitoring();
        });
        
        // Quick scan buttons
        document.querySelectorAll('.quick-scan-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const type = e.target.dataset.scanType;
                this.quickScan(type);
            });
        });
    }
    
    async startScan() {
        if (this.isScanning) {
            this.showAlert('Scan already in progress', 'warning');
            return;
        }
        
        this.isScanning = true;
        this.updateStatus('scanning');
        this.showProgress('scan-progress', 0);
        
        try {
            const response = await fetch('/api/detection/scan', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            
            if (!response.ok) throw new Error('Scan failed');
            
            const results = await response.json();
            this.displayResults(results);
            this.addHistoryEntry('Manual Scan', results);
            this.showAlert(`Scan completed: ${results.threats?.length || 0} threats found`, 
                          results.threats?.length > 0 ? 'warning' : 'success');
            
        } catch (error) {
            console.error('Scan error:', error);
            this.showAlert('Scan failed: ' + error.message, 'danger');
        } finally {
            this.isScanning = false;
            this.updateStatus('ready');
            this.hideProgress('scan-progress');
        }
    }
    
    toggleMonitoring() {
        if (this.isMonitoring) {
            this.stopMonitoring();
        } else {
            this.startMonitoring();
        }
    }
    
    startMonitoring() {
        if (this.isMonitoring) return;
        
        this.isMonitoring = true;
        this.updateStatus('monitoring');
        
        document.getElementById('monitor-btn').innerHTML = 
            '<i class="fas fa-stop"></i> Stop Monitoring';
        document.getElementById('monitor-btn').className = 'btn btn-danger';
        
        this.showAlert(' Continuous monitoring started', 'info');
        
        // Start monitoring interval
        this.scanInterval = setInterval(() => {
            this.quickScan('process');
        }, 10000); // Scan every 10 seconds
    }
    
    stopMonitoring() {
        if (!this.isMonitoring) return;
        
        this.isMonitoring = false;
        this.updateStatus('ready');
        
        if (this.scanInterval) {
            clearInterval(this.scanInterval);
            this.scanInterval = null;
        }
        
        document.getElementById('monitor-btn').innerHTML = 
            '<i class="fas fa-play"></i> Start Monitoring';
        document.getElementById('monitor-btn').className = 'btn btn-success';
        
        this.showAlert(' Monitoring stopped', 'info');
    }
    
    async quickScan(type) {
        try {
            const response = await fetch(`/api/detection/quick-scan?type=${type}`);
            if (!response.ok) throw new Error('Quick scan failed');
            
            const results = await response.json();
            
            if (results.threats && results.threats.length > 0) {
                results.threats.forEach(threat => {
                    this.handleThreat(threat);
                });
            }
            
            return results;
        } catch (error) {
            console.error('Quick scan error:', error);
            return null;
        }
    }
    
    handleThreat(threat) {
        // Determine threat level
        const level = this.determineThreatLevel(threat);
        
        // Show alert
        const alertType = level === this.threatLevels.CRITICAL || level === this.threatLevels.HIGH 
            ? 'danger' 
            : 'warning';
        
        this.showAlert(
            `🚨 ${threat.type} detected: ${threat.process} (PID: ${threat.pid})`,
            alertType,
            threat.details
        );
        
        // Add to detection history
        this.addHistoryEntry('Threat', {
            ...threat,
            level: level,
            timestamp: new Date().toISOString()
        });
        
        // Update security score
        this.updateSecurityScore(level);
        
        // Add to threats list
        this.addThreatToList(threat);
    }
    
    determineThreatLevel(threat) {
        // Simple threat level logic
        const highRisk = ['keylogger', 'spy', 'trojan', 'rootkit'];
        const mediumRisk = ['suspicious', 'unusual', 'hook'];
        
        const name = (threat.process || threat.name || '').toLowerCase();
        
        if (highRisk.some(term => name.includes(term))) {
            return this.threatLevels.CRITICAL;
        }
        if (mediumRisk.some(term => name.includes(term))) {
            return this.threatLevels.HIGH;
        }
        return this.threatLevels.MEDIUM;
    }
    
    displayResults(results) {
        const container = document.getElementById('scan-results');
        if (!container) return;
        
        if (!results.threats || results.threats.length === 0) {
            container.innerHTML = `
                <div class="scan-clean">
                    <i class="fas fa-check-circle" style="color: var(--success-color); font-size: 3rem;"></i>
                    <h4> No threats detected</h4>
                    <p class="text-muted">System appears clean</p>
                    <small class="text-muted">Last scan: ${new Date().toLocaleString()}</small>
                </div>
            `;
            return;
        }
        
        container.innerHTML = `
            <div class="scan-results-header">
                <h4> ${results.threats.length} threat(s) detected</h4>
                <span class="badge badge-danger">Action Required</span>
            </div>
            ${results.threats.map(threat => `
                <div class="threat-item threat-${this.determineThreatLevel(threat)}">
                    <div class="threat-info">
                        <span class="threat-name">${threat.process || threat.name}</span>
                        <span class="threat-pid">PID: ${threat.pid}</span>
                    </div>
                    <div class="threat-details">
                        <span class="threat-type">${threat.type || 'Unknown'}</span>
                        <span class="threat-level ${this.determineThreatLevel(threat)}">
                            ${this.determineThreatLevel(threat).toUpperCase()}
                        </span>
                        <button class="btn btn-danger btn-sm" onclick="window.detection?.mitigateThreat('${threat.pid}')">
                            <i class="fas fa-skull"></i> Terminate
                        </button>
                    </div>
                </div>
            `).join('')}
        `;
    }
    
    addThreatToList(threat) {
        const list = document.getElementById('threats-list');
        if (!list) return;
        
        const item = document.createElement('div');
        item.className = `threat-item threat-${threat.level || 'medium'} slide-in`;
        item.innerHTML = `
            <div class="threat-info">
                <span class="threat-name">${threat.process || threat.name}</span>
                <span class="threat-pid">PID: ${threat.pid}</span>
            </div>
            <div class="threat-details">
                <span class="threat-type">${threat.type || 'Unknown'}</span>
                <span class="threat-level ${threat.level || 'medium'}">
                    ${(threat.level || 'medium').toUpperCase()}
                </span>
                <small class="text-muted">${new Date().toLocaleTimeString()}</small>
            </div>
        `;
        list.prepend(item);
        
        // Keep only last 20 threats
        while (list.children.length > 20) {
            list.removeChild(list.lastChild);
        }
    }
    
    async mitigateThreat(pid) {
        if (!confirm(` Terminate process ${pid}?`)) return;
        
        try {
            const response = await fetch(`/api/detection/mitigate/${pid}`, {
                method: 'POST'
            });
            
            if (!response.ok) throw new Error('Mitigation failed');
            
            const result = await response.json();
            this.showAlert(` Process ${pid} terminated successfully`, 'success');
            
            // Remove from threats list
            document.querySelectorAll(`.threat-item`).forEach(item => {
                if (item.textContent.includes(pid)) {
                    item.remove();
                }
            });
            
        } catch (error) {
            console.error('Mitigation error:', error);
            this.showAlert('Failed to terminate process: ' + error.message, 'danger');
        }
    }
    
    addHistoryEntry(type, data) {
        const entry = {
            id: Date.now(),
            timestamp: new Date().toISOString(),
            type: type,
            data: data
        };
        
        this.detectionHistory.unshift(entry);
        
        // Keep only last 100 entries
        if (this.detectionHistory.length > 100) {
            this.detectionHistory.pop();
        }
        
        this.renderHistory();
        this.saveDetectionHistory();
    }
    
    renderHistory() {
        const container = document.getElementById('history-body');
        if (!container) return;
        
        if (this.detectionHistory.length === 0) {
            container.innerHTML = `
                <tr>
                    <td colspan="5" class="text-center text-muted">
                        <i class="fas fa-history" style="font-size: 2rem; display: block; margin: 10px auto;"></i>
                        No detection history
                    </td>
                </tr>
            `;
            return;
        }
        
        container.innerHTML = this.detectionHistory.slice(0, 20).map(entry => {
            const data = entry.data;
            const level = data.level || 'info';
            const badgeClass = level === 'critical' || level === 'high' ? 'danger' : 
                             level === 'medium' ? 'warning' : 'info';
            
            return `
                <tr>
                    <td>${new Date(entry.timestamp).toLocaleString()}</td>
                    <td><span class="badge badge-${badgeClass}">${entry.type}</span></td>
                    <td>${data.process || data.name || 'N/A'}</td>
                    <td>${data.pid || 'N/A'}</td>
                    <td><span class="threat-level ${level}">${level.toUpperCase()}</span></td>
                </tr>
            `;
        }).join('');
    }
    
    updateSecurityScore(level) {
        const scoreElement = document.getElementById('security-score');
        if (!scoreElement) return;
        
        let currentScore = parseInt(scoreElement.textContent) || 100;
        
        // Deduct points based on threat level
        const deductions = {
            low: 2,
            medium: 5,
            high: 10,
            critical: 20
        };
        
        currentScore = Math.max(0, currentScore - (deductions[level] || 5));
        scoreElement.textContent = `${currentScore}%`;
        
        // Update color
        if (currentScore > 70) {
            scoreElement.style.color = 'var(--success-color)';
        } else if (currentScore > 40) {
            scoreElement.style.color = 'var(--warning-color)';
        } else {
            scoreElement.style.color = 'var(--danger-color)';
        }
    }
    
    updateStatus(status) {
        const statusElement = document.getElementById('monitor-status');
        if (!statusElement) return;
        
        const statusMap = {
            ready: { text: 'Ready', icon: 'check', color: 'success' },
            scanning: { text: 'Scanning...', icon: 'spinner fa-spin', color: 'info' },
            monitoring: { text: 'Monitoring', icon: 'eye', color: 'success' },
            threat: { text: 'Threat Detected!', icon: 'exclamation-triangle', color: 'danger' }
        };
        
        const info = statusMap[status] || statusMap.ready;
        statusElement.innerHTML = `
            <span class="badge badge-${info.color}">
                <i class="fas fa-${info.icon}"></i> ${info.text}
            </span>
        `;
    }
    
    showAlert(message, type = 'info', details = '') {
        const container = document.getElementById('detection-alerts');
        if (!container) return;
        
        const icons = {
            success: 'check-circle',
            info: 'info-circle',
            warning: 'exclamation-triangle',
            danger: 'times-circle'
        };
        
        const alert = document.createElement('div');
        alert.className = `alert alert-${type} slide-in`;
        alert.innerHTML = `
            <i class="fas fa-${icons[type] || 'info-circle'}"></i>
            <div>
                <strong>${message}</strong>
                ${details ? `<br><small>${details}</small>` : ''}
            </div>
            <button class="close-btn" onclick="this.parentElement.remove()">&times;</button>
        `;
        container.prepend(alert);
        
        // Auto-remove after 30 seconds for non-critical alerts
        if (type !== 'danger') {
            setTimeout(() => {
                if (alert.parentElement) {
                    alert.remove();
                }
            }, 30000);
        }
    }
    
    showProgress(id, value) {
        const element = document.getElementById(id);
        if (!element) return;
        
        element.style.display = 'block';
        const progressBar = element.querySelector('.progress-bar');
        if (progressBar) {
            progressBar.style.width = `${value}%`;
            progressBar.textContent = `${value}%`;
        }
    }
    
    hideProgress(id) {
        const element = document.getElementById(id);
        if (element) {
            element.style.display = 'none';
        }
    }
    
    saveDetectionHistory() {
        try {
            localStorage.setItem('detectionHistory', 
                JSON.stringify(this.detectionHistory));
        } catch (e) {
            console.warn('Could not save detection history:', e);
        }
    }
    
    loadDetectionHistory() {
        try {
            const stored = localStorage.getItem('detectionHistory');
            if (stored) {
                this.detectionHistory = JSON.parse(stored);
                this.renderHistory();
            }
        } catch (e) {
            console.warn('Could not load detection history:', e);
        }
    }
}

// Initialize detection engine
document.addEventListener('DOMContentLoaded', () => {
    window.detection = new DetectionEngine();
});

// Expose functions
window.startScan = () => window.detection?.startScan();
window.toggleMonitoring = () => window.detection?.toggleMonitoring();
window.mitigateThreat = (pid) => window.detection?.mitigateThreat(pid);
