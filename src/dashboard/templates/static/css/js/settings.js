// src/dashboard/static/js/settings.js
/**
 * Settings Manager Module
 * Handles application settings, preferences, and configuration management
 * for the Keylogger Cybersecurity Dashboard
 */

class SettingsManager {
    constructor() {
        // Default configuration
        this.defaults = {
            // General settings
            general: {
                autoRefresh: true,
                refreshInterval: 5000,      // milliseconds
                maxLogsDisplay: 100,
                enableNotifications: true,
                enableSound: false,
                language: 'en',
                timezone: 'UTC'
            },
            
            // Detection settings
            detection: {
                autoScan: false,
                scanInterval: 30000,        // milliseconds
                threatLevel: 'medium',       // low, medium, high
                enableNetworkMonitoring: true,
                enableProcessMonitoring: true,
                enableFileMonitoring: false,
                quarantineOnDetect: false,
                autoMitigate: false
            },
            
            // Logging settings
            logging: {
                logLevel: 'info',            // debug, info, warning, error
                maxLogSize: 10,              // MB
                logRotation: true,
                encryptLogs: true,
                includeTimestamps: true,
                includeWindowTitles: true,
                logSpecialKeys: true,
                logMouseEvents: false,
                logClipboard: false
            },
            
            // Exfiltration settings (simulated)
            exfiltration: {
                enabled: false,
                method: 'email',             // email, ftp, http, none
                emailRecipient: '',
                smtpServer: 'smtp.gmail.com',
                smtpPort: 587,
                useTLS: true,
                ftpHost: '',
                ftpPort: 21,
                ftpUsername: '',
                ftpPassword: '',
                httpEndpoint: '',
                httpApiKey: '',
                sendInterval: 3600,          // seconds
                maxBatchSize: 100,
                encryptExfiltration: true
            },
            
            // UI settings
            ui: {
                theme: 'dark',               // dark, light, system
                compactMode: false,
                showTimestamps: true,
                showWindowTitles: true,
                highlightSensitive: true,
                chartType: 'bar',            // bar, line, area
                dateFormat: 'YYYY-MM-DD HH:mm:ss',
                sidebarCollapsed: false
            },
            
            // Security settings
            security: {
                requireAuthentication: false,
                sessionTimeout: 3600,        // seconds
                maxLoginAttempts: 5,
                enableMFA: false,
                passwordPolicy: 'strong',    // weak, medium, strong
                encryptionKey: '',           // auto-generated
                enableAuditLog: true,
                auditLogRetention: 30        // days
            },
            
            // Advanced settings
            advanced: {
                debugMode: false,
                enableExperimental: false,
                maxConcurrentScans: 3,
                memoryLimit: 512,            // MB
                cpuLimit: 50,                // percentage
                networkTimeout: 30,          // seconds
                proxyEnabled: false,
                proxyHost: '',
                proxyPort: 8080,
                proxyUsername: '',
                proxyPassword: ''
            }
        };
        
        // Current settings
        this.settings = {};
        this.observers = [];
        this.isLoaded = false;
        this.pendingChanges = {};
        
        // Initialize
        this.init();
    }
    
    // ============ INITIALIZATION ============
    
    init() {
        console.log(' Settings Manager initializing...');
        
        // Load settings from storage
        this.loadSettings();
        
        // Setup event listeners
        this.setupEventListeners();
        
        // Apply settings
        this.applySettings();
        
        this.isLoaded = true;
        console.log(' Settings Manager ready');
    }
    
    setupEventListeners() {
        // Auto-save on input change
        document.addEventListener('change', (e) => {
            if (e.target.closest('[data-setting]')) {
                this.handleSettingChange(e.target);
            }
        });
        
        document.addEventListener('input', (e) => {
            if (e.target.closest('[data-setting]') && 
                (e.target.type === 'text' || e.target.type === 'number')) {
                this.handleSettingChange(e.target);
            }
        });
        
        // Save button
        const saveBtn = document.getElementById('save-settings-btn');
        if (saveBtn) {
            saveBtn.addEventListener('click', () => this.saveSettings());
        }
        
        // Reset button
        const resetBtn = document.getElementById('reset-settings-btn');
        if (resetBtn) {
            resetBtn.addEventListener('click', () => this.resetToDefaults());
        }
        
        // Export settings
        const exportBtn = document.getElementById('export-settings-btn');
        if (exportBtn) {
            exportBtn.addEventListener('click', () => this.exportSettings());
        }
        
        // Import settings
        const importBtn = document.getElementById('import-settings-btn');
        if (importBtn) {
            importBtn.addEventListener('click', () => {
                document.getElementById('import-settings-file')?.click();
            });
        }
        
        const importFile = document.getElementById('import-settings-file');
        if (importFile) {
            importFile.addEventListener('change', (e) => {
                this.importSettings(e.target.files[0]);
            });
        }
    }
    
    // ============ SETTINGS MANAGEMENT ============
    
    loadSettings() {
        try {
            const stored = localStorage.getItem('keylogger-settings');
            if (stored) {
                const parsed = JSON.parse(stored);
                this.settings = this.mergeSettings(this.defaults, parsed);
            } else {
                this.settings = JSON.parse(JSON.stringify(this.defaults));
            }
        } catch (e) {
            console.warn('Failed to load settings, using defaults:', e);
            this.settings = JSON.parse(JSON.stringify(this.defaults));
        }
    }
    
    mergeSettings(defaults, userSettings) {
        const merged = JSON.parse(JSON.stringify(defaults));
        
        // Recursively merge objects
        const merge = (target, source) => {
            Object.keys(source).forEach(key => {
                if (source[key] && typeof source[key] === 'object' && 
                    !Array.isArray(source[key])) {
                    if (!target[key]) target[key] = {};
                    merge(target[key], source[key]);
                } else {
                    target[key] = source[key];
                }
            });
        };
        
        merge(merged, userSettings);
        return merged;
    }
    
    saveSettings() {
        try {
            // Validate before saving
            const validationErrors = this.validateSettings(this.settings);
            if (validationErrors.length > 0) {
                this.showValidationErrors(validationErrors);
                return false;
            }
            
            // Save to localStorage
            localStorage.setItem('keylogger-settings', JSON.stringify(this.settings));
            
            // Apply settings
            this.applySettings();
            
            // Notify observers
            this.notifyObservers('settings_saved', this.settings);
            
            this.showNotification(' Settings saved successfully!', 'success');
            return true;
        } catch (e) {
            console.error('Failed to save settings:', e);
            this.showNotification(' Failed to save settings: ' + e.message, 'danger');
            return false;
        }
    }
    
    resetToDefaults() {
        if (!confirm(' Reset all settings to default values?')) {
            return;
        }
        
        this.settings = JSON.parse(JSON.stringify(this.defaults));
        this.saveSettings();
        this.renderSettings();
        this.showNotification(' Settings reset to defaults', 'info');
    }
    
    getSetting(path) {
        const parts = path.split('.');
        let current = this.settings;
        
        for (const part of parts) {
            if (current && typeof current === 'object' && part in current) {
                current = current[part];
            } else {
                // Try to get from defaults
                let defaultVal = this.defaults;
                for (const defaultPart of parts) {
                    if (defaultVal && typeof defaultVal === 'object' && defaultPart in defaultVal) {
                        defaultVal = defaultVal[defaultPart];
                    } else {
                        return undefined;
                    }
                }
                return defaultVal;
            }
        }
        
        return current;
    }
    
    setSetting(path, value) {
        const parts = path.split('.');
        const lastKey = parts.pop();
        let current = this.settings;
        
        // Navigate to the parent object
        for (const part of parts) {
            if (!current[part]) {
                current[part] = {};
            }
            current = current[part];
        }
        
        // Set the value
        current[lastKey] = value;
        
        // Track pending changes for batch save
        this.pendingChanges[path] = value;
        
        // Notify observers
        this.notifyObservers('setting_changed', { path, value });
        
        // Auto-save if enabled
        if (this.getSetting('general.autoSave') !== false) {
            this.debouncedSave();
        }
        
        return true;
    }
    
    // ============ DEBOUNCED SAVE ============
    
    debouncedSave() {
        if (this.saveTimeout) {
            clearTimeout(this.saveTimeout);
        }
        this.saveTimeout = setTimeout(() => {
            this.saveSettings();
            this.saveTimeout = null;
        }, 1000);
    }
    
    // ============ SETTINGS VALIDATION ============
    
    validateSettings(settings) {
        const errors = [];
        
        // Validate general settings
        if (settings.general.refreshInterval < 1000) {
            errors.push('Refresh interval must be at least 1000ms');
        }
        if (settings.general.maxLogsDisplay < 10) {
            errors.push('Maximum logs display must be at least 10');
        }
        
        // Validate detection settings
        if (settings.detection.scanInterval < 5000) {
            errors.push('Scan interval must be at least 5000ms');
        }
        
        // Validate logging settings
        if (settings.logging.maxLogSize < 1) {
            errors.push('Maximum log size must be at least 1 MB');
        }
        
        // Validate exfiltration settings
        if (settings.exfiltration.enabled) {
            if (settings.exfiltration.method === 'email') {
                if (!this.validateEmail(settings.exfiltration.emailRecipient)) {
                    errors.push('Invalid email recipient for exfiltration');
                }
            }
            if (settings.exfiltration.method === 'http') {
                if (!this.validateURL(settings.exfiltration.httpEndpoint)) {
                    errors.push('Invalid HTTP endpoint for exfiltration');
                }
            }
        }
        
        // Validate security settings
        if (settings.security.requireAuthentication) {
            if (settings.security.sessionTimeout < 300) {
                errors.push('Session timeout must be at least 300 seconds');
            }
        }
        
        // Validate advanced settings
        if (settings.advanced.memoryLimit < 128) {
            errors.push('Memory limit must be at least 128 MB');
        }
        if (settings.advanced.cpuLimit < 10 || settings.advanced.cpuLimit > 100) {
            errors.push('CPU limit must be between 10 and 100');
        }
        
        return errors;
    }
    
    validateEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }
    
    validateURL(url) {
        try {
            new URL(url);
            return true;
        } catch {
            return false;
        }
    }
    
    // ============ UI RENDERING ============
    
    renderSettings() {
        // Populate all setting inputs
        document.querySelectorAll('[data-setting]').forEach(element => {
            const settingPath = element.dataset.setting;
            const value = this.getSetting(settingPath);
            
            if (value !== undefined) {
                this.setElementValue(element, value);
            }
        });
        
        // Update displayed values
        this.updateDisplayValues();
    }
    
    setElementValue(element, value) {
        switch (element.type) {
            case 'checkbox':
                element.checked = !!value;
                break;
            case 'range':
                element.value = value;
                this.updateRangeDisplay(element);
                break;
            case 'select-one':
            case 'select-multiple':
                element.value = value;
                break;
            case 'color':
                element.value = value;
                break;
            default:
                element.value = value;
        }
    }
    
    getElementValue(element) {
        switch (element.type) {
            case 'checkbox':
                return element.checked;
            case 'range':
                return parseInt(element.value);
            case 'select-one':
                return element.value;
            case 'select-multiple':
                return Array.from(element.selectedOptions).map(opt => opt.value);
            case 'number':
                return parseFloat(element.value);
            default:
                return element.value;
        }
    }
    
    updateRangeDisplay(element) {
        const display = element.parentElement.querySelector('.range-display');
        if (display) {
            const value = element.value;
            const min = parseInt(element.min) || 0;
            const max = parseInt(element.max) || 100;
            const percent = ((value - min) / (max - min)) * 100;
            
            display.textContent = value;
            display.style.left = `calc(${percent}% - ${display.offsetWidth / 2}px)`;
        }
    }
    
    updateDisplayValues() {
        // Update all range displays
        document.querySelectorAll('input[type="range"]').forEach(element => {
            this.updateRangeDisplay(element);
        });
        
        // Update summary sections
        document.querySelectorAll('[data-setting-display]').forEach(element => {
            const settingPath = element.dataset.settingDisplay;
            const value = this.getSetting(settingPath);
            if (value !== undefined) {
                element.textContent = this.formatSettingValue(settingPath, value);
            }
        });
    }
    
    formatSettingValue(path, value) {
        // Format values for display
        if (typeof value === 'boolean') {
            return value ? ' Enabled' : ' Disabled';
        }
        if (typeof value === 'number') {
            if (path.includes('interval') || path.includes('timeout')) {
                return `${value}ms`;
            }
            if (path.includes('size')) {
                return `${value}MB`;
            }
            return value.toString();
        }
        return value || 'Not set';
    }
    
    // ============ SETTINGS APPLICATION ============
    
    applySettings() {
        // Apply UI theme
        if (this.settings.ui.theme && window.themeManager) {
            window.themeManager.setTheme(this.settings.ui.theme);
        }
        
        // Apply compact mode
        document.body.classList.toggle('compact-mode', this.settings.ui.compactMode);
        
        // Apply date format
        if (this.settings.ui.dateFormat) {
            // Update date formatters
        }
        
        // Apply detection settings
        if (this.settings.detection.autoScan && window.detection) {
            window.detection.startMonitoring();
        }
        
        // Apply log level
        this.setLogLevel(this.settings.logging.logLevel);
        
        // Apply notification settings
        if (!this.settings.general.enableNotifications) {
            // Disable notifications
        }
    }
    
    setLogLevel(level) {
        const levels = ['debug', 'info', 'warning', 'error'];
        const index = levels.indexOf(level);
        if (index === -1) return;
        
        // Set log level for console
        console.logLevel = index;
        
        // Update log filters
        document.querySelectorAll('.log-entry').forEach(entry => {
            const entryLevel = entry.dataset.logLevel;
            if (entryLevel) {
                entry.style.display = levels.indexOf(entryLevel) >= index ? '' : 'none';
            }
        });
    }
    
    // ============ SETTINGS EXPORT/IMPORT ============
    
    exportSettings() {
        const exportData = {
            version: '1.0',
            exportedAt: new Date().toISOString(),
            settings: this.settings,
            metadata: {
                application: 'Keylogger Cybersecurity Dashboard',
                environment: this.settings.general.environment || 'development'
            }
        };
        
        const json = JSON.stringify(exportData, null, 2);
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `settings-backup-${new Date().toISOString().slice(0,10)}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        this.showNotification(' Settings exported successfully!', 'success');
    }
    
    importSettings(file) {
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = JSON.parse(e.target.result);
                
                if (!data.settings) {
                    throw new Error('Invalid settings file format');
                }
                
                // Validate imported settings
                const merged = this.mergeSettings(this.defaults, data.settings);
                const errors = this.validateSettings(merged);
                
                if (errors.length > 0) {
                    this.showValidationErrors(errors);
                    return;
                }
                
                // Confirm import
                if (!confirm(' Import settings? This will overwrite current settings.')) {
                    return;
                }
                
                this.settings = merged;
                this.saveSettings();
                this.renderSettings();
                this.showNotification(' Settings imported successfully!', 'success');
                
            } catch (error) {
                console.error('Import failed:', error);
                this.showNotification(' Failed to import settings: ' + error.message, 'danger');
            }
        };
        reader.readAsText(file);
    }
    
    // ============ SETTINGS OBSERVERS ============
    
    observe(callback) {
        if (typeof callback === 'function') {
            this.observers.push(callback);
            // Immediately notify with current settings
            callback('init', this.settings);
        }
    }
    
    unobserve(callback) {
        const index = this.observers.indexOf(callback);
        if (index !== -1) {
            this.observers.splice(index, 1);
        }
    }
    
    notifyObservers(event, data) {
        this.observers.forEach(callback => {
            try {
                callback(event, data);
            } catch (e) {
                console.error('Settings observer error:', e);
            }
        });
    }
    
    // ============ SETTINGS VALIDATION UI ============
    
    showValidationErrors(errors) {
        const container = document.getElementById('validation-errors');
        if (!container) {
            // Create container if it doesn't exist
            const newContainer = document.createElement('div');
            newContainer.id = 'validation-errors';
            newContainer.className = 'validation-errors';
            document.querySelector('.settings-content')?.prepend(newContainer);
            return this.showValidationErrors(errors);
        }
        
        container.innerHTML = `
            <div class="alert alert-danger">
                <h4><i class="fas fa-exclamation-circle"></i> Validation Errors</h4>
                <ul>
                    ${errors.map(error => `<li>${error}</li>`).join('')}
                </ul>
            </div>
        `;
        container.style.display = 'block';
        
        // Auto-hide after 10 seconds
        setTimeout(() => {
            container.style.display = 'none';
        }, 10000);
    }
    
    // ============ NOTIFICATIONS ============
    
    showNotification(message, type = 'info') {
        if (window.dashboard && typeof window.dashboard.showNotification === 'function') {
            window.dashboard.showNotification(message, type);
        } else {
            // Fallback notification
            const container = document.getElementById('settings-notifications') || 
                             this.createNotificationContainer();
            
            const notification = document.createElement('div');
            notification.className = `settings-notification settings-notification-${type}`;
            notification.textContent = message;
            container.appendChild(notification);
            
            setTimeout(() => {
                if (notification.parentElement) {
                    notification.remove();
                }
            }, 3000);
        }
    }
    
    createNotificationContainer() {
        const container = document.createElement('div');
        container.id = 'settings-notifications';
        container.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            z-index: 9999;
            display: flex;
            flex-direction: column;
            gap: 10px;
        `;
        document.body.appendChild(container);
        
        // Add styles
        const style = document.createElement('style');
        style.textContent = `
            .settings-notification {
                padding: 12px 20px;
                border-radius: 8px;
                background: var(--card-bg);
                border: 1px solid var(--border-color);
                box-shadow: 0 4px 20px rgba(0,0,0,0.3);
                animation: slideIn 0.3s ease-out;
                color: var(--text-color);
                font-size: 0.95rem;
            }
            .settings-notification-success {
                border-left: 4px solid var(--success-color);
            }
            .settings-notification-info {
                border-left: 4px solid var(--info-color);
            }
            .settings-notification-warning {
                border-left: 4px solid var(--warning-color);
            }
            .settings-notification-danger {
                border-left: 4px solid var(--danger-color);
            }
        `;
        document.head.appendChild(style);
        
        return container;
    }
    
    // ============ SETTINGS CATEGORIES ============
    
    getSettingsByCategory(category) {
        return this.settings[category] || {};
    }
    
    getCategorySchema(category) {
        // Return schema for settings category
        const schemas = {
            general: {
                title: 'General Settings',
                description: 'Basic application settings',
                icon: 'fa-cog'
            },
            detection: {
                title: 'Detection Settings',
                description: 'Threat detection configuration',
                icon: 'fa-shield-alt'
            },
            logging: {
                title: 'Logging Settings',
                description: 'Keystroke logging configuration',
                icon: 'fa-clipboard-list'
            },
            exfiltration: {
                title: 'Exfiltration Settings',
                description: 'Data exfiltration simulation (Educational)',
                icon: 'fa-upload'
            },
            ui: {
                title: 'UI Settings',
                description: 'User interface preferences',
                icon: 'fa-paint-brush'
            },
            security: {
                title: 'Security Settings',
                description: 'Security and authentication',
                icon: 'fa-lock'
            },
            advanced: {
                title: 'Advanced Settings',
                description: 'Advanced configuration options',
                icon: 'fa-code'
            }
        };
        
        return schemas[category] || schemas.general;
    }
    
    // ============ SETTINGS SEARCH ============
    
    searchSettings(query) {
        if (!query || query.trim() === '') {
            return this.flattenSettings(this.settings);
        }
        
        const results = [];
        const searchTerm = query.toLowerCase();
        const flat = this.flattenSettings(this.settings);
        
        for (const [path, value] of Object.entries(flat)) {
            const pathStr = path.replace(/\./g, ' ');
            const valueStr = String(value).toLowerCase();
            
            if (pathStr.includes(searchTerm) || valueStr.includes(searchTerm)) {
                results.push({ path, value });
            }
        }
        
        return results;
    }
    
    flattenSettings(obj, prefix = '') {
        const result = {};
        
        for (const [key, value] of Object.entries(obj)) {
            const newKey = prefix ? `${prefix}.${key}` : key;
            
            if (value && typeof value === 'object' && !Array.isArray(value)) {
                Object.assign(result, this.flattenSettings(value, newKey));
            } else {
                result[newKey] = value;
            }
        }
        
        return result;
    }
    
    // ============ SETTINGS COMPARISON ============
    
    compareSettings(otherSettings) {
        const differences = [];
        const current = this.flattenSettings(this.settings);
        const other = this.flattenSettings(otherSettings);
        
        const allKeys = new Set([...Object.keys(current), ...Object.keys(other)]);
        
        for (const key of allKeys) {
            const currentVal = current[key];
            const otherVal = other[key];
            
            if (JSON.stringify(currentVal) !== JSON.stringify(otherVal)) {
                differences.push({
                    path: key,
                    current: currentVal,
                    other: otherVal
                });
            }
        }
        
        return differences;
    }
    
    // ============ SETTINGS CHANGE HANDLER ============
    
    handleSettingChange(element) {
        const path = element.dataset.setting;
        const value = this.getElementValue(element);
        
        this.setSetting(path, value);
        this.updateDisplayValues();
        
        // Show indicator for unsaved changes
        this.showUnsavedIndicator(true);
    }
    
    showUnsavedIndicator(hasUnsaved) {
        const indicator = document.getElementById('unsaved-indicator');
        if (indicator) {
            indicator.style.display = hasUnsaved ? 'inline' : 'none';
        }
    }
    
    // ============ BATCH SETTINGS UPDATE ============
    
    updateMultipleSettings(updates) {
        for (const [path, value] of Object.entries(updates)) {
            this.setSetting(path, value);
        }
        this.renderSettings();
        this.saveSettings();
    }
    
    // ============ SETTINGS INJECTION ============
    
    injectSettings(settings) {
        // Merge with current settings without saving
        this.settings = this.mergeSettings(this.settings, settings);
        this.renderSettings();
        this.applySettings();
        this.notifyObservers('settings_injected', settings);
    }
    
    // ============ GET SETTINGS SUMMARY ============
    
    getSettingsSummary() {
        return {
            general: {
                autoRefresh: this.getSetting('general.autoRefresh'),
                refreshInterval: this.getSetting('general.refreshInterval')
            },
            detection: {
                autoScan: this.getSetting('detection.autoScan'),
                threatLevel: this.getSetting('detection.threatLevel')
            },
            ui: {
                theme: this.getSetting('ui.theme'),
                compactMode: this.getSetting('ui.compactMode')
            },
            totalSettings: Object.keys(this.flattenSettings(this.settings)).length,
            lastSaved: localStorage.getItem('keylogger-settings-last-saved') || 'Never'
        };
    }
}

// ============ INITIALIZATION ============

let settingsManager = null;

document.addEventListener('DOMContentLoaded', () => {
    settingsManager = new SettingsManager();
    
    // Populate settings UI
    const settingsContainer = document.getElementById('settings-container');
    if (settingsContainer) {
        settingsManager.renderSettings();
    }
    
    // Make globally available
    window.settingsManager = settingsManager;
});

// ============ EXPOSE GLOBALLY ============

window.SettingsManager = SettingsManager;
window.settingsManager = settingsManager;

// Expose common functions
window.getSetting = (path) => settingsManager?.getSetting(path);
window.setSetting = (path, value) => settingsManager?.setSetting(path, value);
window.saveSettings = () => settingsManager?.saveSettings();
window.resetSettings = () => settingsManager?.resetToDefaults();

// ============ KEYBOARD SHORTCUTS ============

document.addEventListener('keydown', (e) => {
    // Ctrl+Shift+S: Save settings
    if (e.ctrlKey && e.shiftKey && e.key === 'S') {
        e.preventDefault();
        saveSettings();
    }
});

// ============ CONSOLE HELP ============

console.log(`
 Settings Manager Available Commands:
  - settingsManager.getSetting('path')     - Get a setting value
  - settingsManager.setSetting('path', val) - Set a setting value
  - settingsManager.saveSettings()         - Save all settings
  - settingsManager.resetToDefaults()      - Reset to defaults
  - settingsManager.exportSettings()       - Export settings to file
  - settingsManager.getSettingsSummary()   - Get settings overview
  
Example: settingsManager.getSetting('general.autoRefresh')
`);

// ============ SETTINGS WATCHER ============

// Watch for settings changes from other tabs/windows
window.addEventListener('storage', (e) => {
    if (e.key === 'keylogger-settings') {
        // Settings changed in another tab
        const oldSettings = JSON.parse(JSON.stringify(settingsManager?.settings));
        settingsManager?.loadSettings();
        settingsManager?.renderSettings();
        settingsManager?.applySettings();
        settingsManager?.notifyObservers('settings_external_change', {
            old: oldSettings,
            new: settingsManager?.settings
        });
    }
});
