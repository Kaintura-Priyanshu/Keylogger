// src/dashboard/static/js/theme.js
/**
 * Theme Manager Module
 * Handles dark/light theme switching, system preference detection,
 * and custom theme customization for the Keylogger Cybersecurity Dashboard
 */

class ThemeManager {
    constructor() {
        // Default configuration
        this.config = {
            defaultTheme: 'dark',          // 'dark' | 'light' | 'system'
            persistTheme: true,
            persistKey: 'keylogger-theme',
            transitionDuration: 300,        // ms for theme transitions
            customThemes: {}                // User-defined custom themes
        };
        
        // Theme definitions
        this.themes = {
            dark: {
                name: 'Dark',
                icon: 'fa-moon',
                colors: {
                    '--background-primary': '#0d1117',
                    '--background-secondary': '#161b22',
                    '--card-bg': '#1c2333',
                    '--border-color': '#30363d',
                    '--text-color': '#e6edf3',
                    '--text-muted': '#8b949e',
                    '--primary-color': '#58a6ff',
                    '--success-color': '#3fb950',
                    '--danger-color': '#f85149',
                    '--warning-color': '#d29922',
                    '--info-color': '#58a6ff',
                    '--shadow-color': 'rgba(0,0,0,0.5)'
                }
            },
            light: {
                name: 'Light',
                icon: 'fa-sun',
                colors: {
                    '--background-primary': '#ffffff',
                    '--background-secondary': '#f6f8fa',
                    '--card-bg': '#ffffff',
                    '--border-color': '#d0d7de',
                    '--text-color': '#24292f',
                    '--text-muted': '#57606a',
                    '--primary-color': '#0969da',
                    '--success-color': '#1a7f37',
                    '--danger-color': '#cf222e',
                    '--warning-color': '#9a6700',
                    '--info-color': '#0550ae',
                    '--shadow-color': 'rgba(0,0,0,0.1)'
                }
            },
            matrix: {
                name: 'Matrix',
                icon: 'fa-terminal',
                colors: {
                    '--background-primary': '#000000',
                    '--background-secondary': '#001a00',
                    '--card-bg': '#001a00',
                    '--border-color': '#00ff00',
                    '--text-color': '#00ff00',
                    '--text-muted': '#00cc00',
                    '--primary-color': '#00ff41',
                    '--success-color': '#00ff41',
                    '--danger-color': '#ff0040',
                    '--warning-color': '#ffff00',
                    '--info-color': '#00ffff',
                    '--shadow-color': 'rgba(0,255,0,0.2)'
                }
            },
            cyberpunk: {
                name: 'Cyberpunk',
                icon: 'fa-robot',
                colors: {
                    '--background-primary': '#0a0015',
                    '--background-secondary': '#15002a',
                    '--card-bg': '#1a0033',
                    '--border-color': '#ff00ff',
                    '--text-color': '#00ffff',
                    '--text-muted': '#aa00ff',
                    '--primary-color': '#ff00ff',
                    '--success-color': '#00ffaa',
                    '--danger-color': '#ff0044',
                    '--warning-color': '#ffff00',
                    '--info-color': '#00ddff',
                    '--shadow-color': 'rgba(255,0,255,0.3)'
                }
            },
            ocean: {
                name: 'Ocean',
                icon: 'fa-water',
                colors: {
                    '--background-primary': '#001a2e',
                    '--background-secondary': '#002b4a',
                    '--card-bg': '#003a60',
                    '--border-color': '#006699',
                    '--text-color': '#e0f2fe',
                    '--text-muted': '#7dd3fc',
                    '--primary-color': '#38bdf8',
                    '--success-color': '#4ade80',
                    '--danger-color': '#f87171',
                    '--warning-color': '#fbbf24',
                    '--info-color': '#60a5fa',
                    '--shadow-color': 'rgba(0,150,255,0.2)'
                }
            },
            sunset: {
                name: 'Sunset',
                icon: 'fa-sunset',
                colors: {
                    '--background-primary': '#1a0a00',
                    '--background-secondary': '#2a1500',
                    '--card-bg': '#3a1f00',
                    '--border-color': '#ff6b35',
                    '--text-color': '#ffe6d5',
                    '--text-muted': '#ffb08c',
                    '--primary-color': '#ff6b35',
                    '--success-color': '#66bb6a',
                    '--danger-color': '#ff1744',
                    '--warning-color': '#ffab00',
                    '--info-color': '#40c4ff',
                    '--shadow-color': 'rgba(255,107,53,0.3)'
                }
            },
            forest: {
                name: 'Forest',
                icon: 'fa-tree',
                colors: {
                    '--background-primary': '#0a1a0a',
                    '--background-secondary': '#142814',
                    '--card-bg': '#1e3a1e',
                    '--border-color': '#2d5a2d',
                    '--text-color': '#d4edda',
                    '--text-muted': '#8bb88b',
                    '--primary-color': '#4caf50',
                    '--success-color': '#66bb6a',
                    '--danger-color': '#ef5350',
                    '--warning-color': '#ffa726',
                    '--info-color': '#42a5f5',
                    '--shadow-color': 'rgba(76,175,80,0.2)'
                }
            }
        };
        
        // State
        this.currentTheme = this.config.defaultTheme;
        this.isTransitioning = false;
        this.activeCustomizations = {};
        this.themeObservers = [];
        
        // Initialize
        this.init();
    }
    
    // ============ INITIALIZATION ============
    
    init() {
        console.log(' Theme Manager initializing...');
        
        // Load persisted theme
        const savedTheme = this.loadThemePreference();
        if (savedTheme) {
            this.currentTheme = savedTheme;
        }
        
        // Apply theme
        this.applyTheme(this.currentTheme);
        
        // Setup event listeners
        this.setupEventListeners();
        
        // Watch system preference changes
        this.watchSystemPreference();
        
        // Setup transition
        this.setupTransition();
        
        console.log(` Theme Manager initialized with theme: ${this.currentTheme}`);
    }
    
    setupEventListeners() {
        // Theme toggle button
        const toggleBtn = document.getElementById('theme-toggle');
        if (toggleBtn) {
            toggleBtn.addEventListener('click', () => this.toggleTheme());
        }
        
        // Theme selector dropdown
        const themeSelect = document.getElementById('theme-selector');
        if (themeSelect) {
            themeSelect.addEventListener('change', (e) => {
                this.setTheme(e.target.value);
            });
        }
        
        // Custom theme form
        const customForm = document.getElementById('custom-theme-form');
        if (customForm) {
            customForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.applyCustomTheme(new FormData(e.target));
            });
        }
        
        // Reset theme button
        const resetBtn = document.getElementById('reset-theme-btn');
        if (resetBtn) {
            resetBtn.addEventListener('click', () => this.resetTheme());
        }
        
        // Keyboard shortcut: Ctrl+Shift+T for theme toggle
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.shiftKey && e.key === 'T') {
                e.preventDefault();
                this.toggleTheme();
            }
        });
    }
    
    setupTransition() {
        // Add transition to root element
        document.documentElement.style.transition = 
            `background-color ${this.config.transitionDuration}ms ease, ` +
            `color ${this.config.transitionDuration}ms ease`;
        
        // Add transition class for smooth changes
        const style = document.createElement('style');
        style.textContent = `
            .theme-transition {
                transition: background-color ${this.config.transitionDuration}ms ease,
                           color ${this.config.transitionDuration}ms ease,
                           border-color ${this.config.transitionDuration}ms ease,
                           box-shadow ${this.config.transitionDuration}ms ease !important;
            }
            .theme-transition * {
                transition: background-color ${this.config.transitionDuration}ms ease,
                           color ${this.config.transitionDuration}ms ease,
                           border-color ${this.config.transitionDuration}ms ease,
                           box-shadow ${this.config.transitionDuration}ms ease !important;
            }
        `;
        document.head.appendChild(style);
    }
    
    watchSystemPreference() {
        // Watch for system preference changes
        if (window.matchMedia) {
            const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
            mediaQuery.addEventListener('change', (e) => {
                if (this.currentTheme === 'system') {
                    this.applySystemTheme();
                }
            });
        }
    }
    
    // ============ CORE THEME FUNCTIONS ============
    
    applyTheme(themeName) {
        if (this.isTransitioning) return;
        
        this.isTransitioning = true;
        
        // Handle system theme
        if (themeName === 'system') {
            this.applySystemTheme();
            this.currentTheme = 'system';
            this.saveThemePreference('system');
            this.isTransitioning = false;
            this.dispatchThemeChange('system');
            return;
        }
        
        // Check if theme exists
        const theme = this.themes[themeName];
        if (!theme) {
            console.warn(`Theme "${themeName}" not found, using default`);
            this.applyTheme(this.config.defaultTheme);
            this.isTransitioning = false;
            return;
        }
        
        // Apply colors
        this.applyColors(theme.colors);
        
        // Update theme name
        this.currentTheme = themeName;
        
        // Update UI elements
        this.updateThemeUI(themeName);
        
        // Save preference
        this.saveThemePreference(themeName);
        
        // Dispatch event
        this.dispatchThemeChange(themeName);
        
        // Complete transition
        setTimeout(() => {
            this.isTransitioning = false;
        }, this.config.transitionDuration);
        
        console.log(` Applied theme: ${themeName}`);
    }
    
    applySystemTheme() {
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        const themeName = prefersDark ? 'dark' : 'light';
        const theme = this.themes[themeName];
        
        if (theme) {
            this.applyColors(theme.colors);
            this.updateThemeUI('system');
        }
    }
    
    applyColors(colors) {
        const root = document.documentElement;
        
        // Apply each color variable
        Object.entries(colors).forEach(([key, value]) => {
            root.style.setProperty(key, value);
        });
        
        // Update CSS variables in JavaScript
        this.activeCustomizations = colors;
    }
    
    applyCustomTheme(formData) {
        const themeName = formData.get('theme-name') || 'custom';
        const colors = {};
        
        // Collect color values from form
        document.querySelectorAll('[data-theme-color]').forEach(input => {
            const key = input.dataset.themeColor;
            const value = input.value;
            if (key && value) {
                colors[key] = value;
            }
        });
        
        // Create custom theme
        this.themes[themeName] = {
            name: themeName.charAt(0).toUpperCase() + themeName.slice(1),
            icon: 'fa-palette',
            colors: colors
        };
        
        // Apply theme
        this.applyTheme(themeName);
        
        // Add to selector
        this.populateThemeSelector();
        
        // Show success message
        this.showNotification('Custom theme applied successfully!', 'success');
    }
    
    toggleTheme() {
        // Cycle through themes
        const themeNames = Object.keys(this.themes);
        const currentIndex = themeNames.indexOf(this.currentTheme);
        const nextIndex = (currentIndex + 1) % themeNames.length;
        const nextTheme = themeNames[nextIndex];
        
        this.applyTheme(nextTheme);
    }
    
    setTheme(themeName) {
        if (themeName === this.currentTheme) return;
        this.applyTheme(themeName);
    }
    
    resetTheme() {
        this.activeCustomizations = {};
        this.applyTheme(this.config.defaultTheme);
        this.showNotification('Theme reset to default', 'info');
    }
    
    // ============ UI UPDATES ============
    
    updateThemeUI(themeName) {
        // Update theme toggle button
        const toggleBtn = document.getElementById('theme-toggle');
        if (toggleBtn) {
            const theme = this.themes[themeName] || this.themes[this.currentTheme];
            if (theme) {
                toggleBtn.innerHTML = `<i class="fas ${theme.icon}"></i>`;
                toggleBtn.title = `Switch Theme (Current: ${theme.name})`;
            }
        }
        
        // Update theme selector
        const themeSelect = document.getElementById('theme-selector');
        if (themeSelect) {
            themeSelect.value = themeName;
        }
        
        // Update theme label
        const themeLabel = document.getElementById('current-theme-label');
        if (themeLabel) {
            const theme = this.themes[themeName] || this.themes[this.currentTheme];
            themeLabel.textContent = theme ? theme.name : 'Unknown';
        }
        
        // Update body class
        document.body.className = document.body.className
            .split(' ')
            .filter(cls => !cls.startsWith('theme-'))
            .join(' ');
        document.body.classList.add(`theme-${themeName}`);
        
        // Update meta theme-color
        this.updateMetaThemeColor();
    }
    
    updateMetaThemeColor() {
        const meta = document.querySelector('meta[name="theme-color"]');
        if (meta) {
            const bgColor = getComputedStyle(document.documentElement)
                .getPropertyValue('--background-primary').trim();
            if (bgColor) {
                meta.content = bgColor;
            }
        }
    }
    
    populateThemeSelector() {
        const themeSelect = document.getElementById('theme-selector');
        if (!themeSelect) return;
        
        const currentValue = themeSelect.value;
        themeSelect.innerHTML = '';
        
        // Add themes
        Object.entries(this.themes).forEach(([key, theme]) => {
            const option = document.createElement('option');
            option.value = key;
            option.textContent = theme.name;
            if (key === currentValue) {
                option.selected = true;
            }
            themeSelect.appendChild(option);
        });
        
        // Add system option
        const systemOption = document.createElement('option');
        systemOption.value = 'system';
        systemOption.textContent = ' System Preference';
        if (currentValue === 'system') {
            systemOption.selected = true;
        }
        themeSelect.appendChild(systemOption);
    }
    
    // ============ PERSISTENCE ============
    
    loadThemePreference() {
        if (!this.config.persistTheme) return null;
        
        try {
            const saved = localStorage.getItem(this.config.persistKey);
            if (saved) {
                const data = JSON.parse(saved);
                // Validate theme exists
                if (this.themes[data.theme] || data.theme === 'system') {
                    return data.theme;
                }
            }
        } catch (e) {
            console.warn('Failed to load theme preference:', e);
        }
        return null;
    }
    
    saveThemePreference(theme) {
        if (!this.config.persistTheme) return;
        
        try {
            localStorage.setItem(this.config.persistKey, JSON.stringify({
                theme: theme,
                timestamp: Date.now()
            }));
        } catch (e) {
            console.warn('Failed to save theme preference:', e);
        }
    }
    
    // ============ THEME OBSERVERS ============
    
    observe(callback) {
        if (typeof callback === 'function') {
            this.themeObservers.push(callback);
        }
    }
    
    unobserve(callback) {
        const index = this.themeObservers.indexOf(callback);
        if (index !== -1) {
            this.themeObservers.splice(index, 1);
        }
    }
    
    dispatchThemeChange(themeName) {
        this.themeObservers.forEach(callback => {
            try {
                callback(themeName, this.themes[themeName]);
            } catch (e) {
                console.error('Theme observer error:', e);
            }
        });
    }
    
    // ============ THEME PREVIEW ============
    
    previewTheme(themeName) {
        if (!this.themes[themeName]) return;
        
        // Save current theme
        const previousTheme = this.currentTheme;
        
        // Apply preview
        this.applyTheme(themeName);
        
        // Show preview banner
        this.showPreviewBanner(themeName, previousTheme);
    }
    
    showPreviewBanner(themeName, previousTheme) {
        // Remove existing banner
        const existing = document.getElementById('theme-preview-banner');
        if (existing) existing.remove();
        
        // Create banner
        const banner = document.createElement('div');
        banner.id = 'theme-preview-banner';
        banner.className = 'theme-preview-banner';
        banner.innerHTML = `
            <div class="theme-preview-content">
                <span> Previewing: <strong>${this.themes[themeName].name}</strong></span>
                <div>
                    <button class="btn btn-success btn-sm" onclick="themeManager.applyTheme('${themeName}')">
                        <i class="fas fa-check"></i> Apply
                    </button>
                    <button class="btn btn-secondary btn-sm" onclick="themeManager.applyTheme('${previousTheme}')">
                        <i class="fas fa-times"></i> Cancel
                    </button>
                </div>
            </div>
        `;
        document.body.appendChild(banner);
        
        // Add styles
        const style = document.createElement('style');
        style.textContent = `
            .theme-preview-banner {
                position: fixed;
                bottom: 20px;
                left: 50%;
                transform: translateX(-50%);
                background: var(--card-bg);
                border: 1px solid var(--border-color);
                border-radius: 12px;
                padding: 15px 25px;
                box-shadow: 0 10px 40px rgba(0,0,0,0.5);
                z-index: 10000;
                backdrop-filter: blur(10px);
                animation: slideUp 0.3s ease-out;
            }
            .theme-preview-content {
                display: flex;
                align-items: center;
                gap: 20px;
                flex-wrap: wrap;
            }
            @keyframes slideUp {
                from { transform: translateX(-50%) translateY(20px); opacity: 0; }
                to { transform: translateX(-50%) translateY(0); opacity: 1; }
            }
            @media (max-width: 600px) {
                .theme-preview-banner {
                    bottom: 10px;
                    padding: 12px 18px;
                    width: 95%;
                }
                .theme-preview-content {
                    flex-direction: column;
                    text-align: center;
                }
            }
        `;
        document.head.appendChild(style);
        
        // Auto-close after 30 seconds
        setTimeout(() => {
            if (banner.parentElement) {
                banner.remove();
            }
        }, 30000);
    }
    
    // ============ NOTIFICATIONS ============
    
    showNotification(message, type = 'info') {
        // Use dashboard notification system if available
        if (window.dashboard && typeof window.dashboard.showNotification === 'function') {
            window.dashboard.showNotification(message, type);
            return;
        }
        
        // Fallback notification
        const container = document.getElementById('notification-container') || 
                         this.createNotificationContainer();
        
        const icons = {
            success: 'fa-check-circle',
            info: 'fa-info-circle',
            warning: 'fa-exclamation-triangle',
            danger: 'fa-times-circle'
        };
        
        const notification = document.createElement('div');
        notification.className = `theme-notification theme-notification-${type}`;
        notification.innerHTML = `
            <i class="fas ${icons[type] || icons.info}"></i>
            <span>${message}</span>
        `;
        container.appendChild(notification);
        
        // Auto-remove
        setTimeout(() => {
            if (notification.parentElement) {
                notification.remove();
            }
        }, 3000);
    }
    
    createNotificationContainer() {
        const container = document.createElement('div');
        container.id = 'theme-notification-container';
        container.style.cssText = `
            position: fixed;
            top: 80px;
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
            .theme-notification {
                padding: 12px 20px;
                border-radius: 8px;
                background: var(--card-bg);
                border: 1px solid var(--border-color);
                box-shadow: 0 4px 20px rgba(0,0,0,0.3);
                display: flex;
                align-items: center;
                gap: 10px;
                animation: slideIn 0.3s ease-out;
                color: var(--text-color);
                font-size: 0.95rem;
            }
            .theme-notification-success {
                border-left: 4px solid var(--success-color);
            }
            .theme-notification-info {
                border-left: 4px solid var(--info-color);
            }
            .theme-notification-warning {
                border-left: 4px solid var(--warning-color);
            }
            .theme-notification-danger {
                border-left: 4px solid var(--danger-color);
            }
            @keyframes slideIn {
                from { transform: translateX(20px); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
        `;
        document.head.appendChild(style);
        
        return container;
    }
    
    // ============ GETTERS ============
    
    getCurrentTheme() {
        return this.currentTheme;
    }
    
    getThemeInfo(themeName) {
        return this.themes[themeName] || null;
    }
    
    getAvailableThemes() {
        return Object.keys(this.themes);
    }
    
    getThemeColors(themeName) {
        const theme = this.themes[themeName];
        return theme ? theme.colors : null;
    }
    
    getColorValue(variable) {
        return getComputedStyle(document.documentElement)
            .getPropertyValue(variable).trim();
    }
    
    // ============ ADVANCED THEME FEATURES ============
    
    /**
     * Generate a random theme
     */
    generateRandomTheme() {
        const colors = {};
        const cssVars = [
            '--background-primary', '--background-secondary', '--card-bg',
            '--border-color', '--text-color', '--text-muted',
            '--primary-color', '--success-color', '--danger-color',
            '--warning-color', '--info-color'
        ];
        
        cssVars.forEach(varName => {
            colors[varName] = this.randomColor();
        });
        
        const themeName = `random-${Date.now()}`;
        this.themes[themeName] = {
            name: 'Random',
            icon: 'fa-random',
            colors: colors
        };
        
        this.applyTheme(themeName);
        this.populateThemeSelector();
        
        this.showNotification(' Random theme generated!', 'success');
        return themeName;
    }
    
    randomColor() {
        const hue = Math.floor(Math.random() * 360);
        const sat = 40 + Math.floor(Math.random() * 60);
        const light = 20 + Math.floor(Math.random() * 30);
        return `hsl(${hue}, ${sat}%, ${light}%)`;
    }
    
    /**
     * Import theme from JSON
     */
    importTheme(jsonData) {
        try {
            const theme = typeof jsonData === 'string' ? JSON.parse(jsonData) : jsonData;
            
            if (!theme.name || !theme.colors) {
                throw new Error('Invalid theme format: missing name or colors');
            }
            
            const themeName = theme.id || theme.name.toLowerCase().replace(/\s/g, '-');
            this.themes[themeName] = {
                name: theme.name,
                icon: theme.icon || 'fa-palette',
                colors: theme.colors
            };
            
            this.applyTheme(themeName);
            this.populateThemeSelector();
            
            this.showNotification(` Theme "${theme.name}" imported successfully!`, 'success');
            return themeName;
        } catch (error) {
            console.error('Theme import failed:', error);
            this.showNotification(' Theme import failed: ' + error.message, 'danger');
            return null;
        }
    }
    
    /**
     * Export current theme
     */
    exportTheme(themeName = null) {
        const name = themeName || this.currentTheme;
        const theme = this.themes[name];
        
        if (!theme) {
            console.error('Theme not found:', name);
            return null;
        }
        
        const exportData = {
            id: name,
            name: theme.name,
            icon: theme.icon,
            colors: theme.colors,
            exportedAt: new Date().toISOString(),
            version: '1.0'
        };
        
        const json = JSON.stringify(exportData, null, 2);
        
        // Download file
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `theme-${name}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        this.showNotification(` Theme "${theme.name}" exported successfully!`, 'success');
        return exportData;
    }
    
    /**
     * Get theme statistics
     */
    getStats() {
        const themeNames = Object.keys(this.themes);
        const totalThemes = themeNames.length;
        const customThemes = themeNames.filter(name => 
            !['dark', 'light', 'system'].includes(name)
        );
        
        return {
            total: totalThemes,
            custom: customThemes.length,
            presets: totalThemes - customThemes.length - 1, // -1 for system
            current: this.currentTheme,
            available: themeNames,
            customNames: customThemes
        };
    }
}

// ============ INITIALIZATION ============

// Create global theme manager instance
let themeManager = null;

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    themeManager = new ThemeManager();
    
    // Populate theme selector
    themeManager.populateThemeSelector();
    
    // Add theme toggle to navigation if it doesn't exist
    const navMenu = document.querySelector('.nav-menu');
    if (navMenu && !document.getElementById('theme-toggle')) {
        const themeItem = document.createElement('li');
        themeItem.className = 'nav-item';
        themeItem.innerHTML = `
            <button id="theme-toggle" class="nav-link" title="Toggle Theme">
                <i class="fas fa-moon"></i>
            </button>
        `;
        navMenu.appendChild(themeItem);
        
        // Re-initialize event listener for new button
        document.getElementById('theme-toggle').addEventListener('click', () => {
            themeManager.toggleTheme();
        });
    }
    
    // Add theme selector to settings page if it exists
    const settingsContainer = document.getElementById('theme-settings');
    if (settingsContainer) {
        settingsContainer.innerHTML = `
            <div class="theme-settings">
                <h3> Theme Settings</h3>
                <div class="form-group">
                    <label for="theme-selector">Select Theme</label>
                    <select id="theme-selector" class="form-control">
                        <!-- Populated by JavaScript -->
                    </select>
                </div>
                <div class="theme-actions">
                    <button class="btn btn-secondary" onclick="themeManager.generateRandomTheme()">
                        <i class="fas fa-random"></i> Random Theme
                    </button>
                    <button class="btn btn-secondary" onclick="themeManager.resetTheme()">
                        <i class="fas fa-undo"></i> Reset
                    </button>
                </div>
                <div class="theme-export-import">
                    <button class="btn btn-info" onclick="themeManager.exportTheme()">
                        <i class="fas fa-download"></i> Export Theme
                    </button>
                    <label class="btn btn-info">
                        <i class="fas fa-upload"></i> Import Theme
                        <input type="file" accept=".json" style="display:none" 
                               onchange="themeManager.importTheme(await this.files[0].text())">
                    </label>
                </div>
                <div class="theme-stats">
                    <small class="text-muted">
                        ${Object.keys(themeManager.themes).length} themes available
                    </small>
                </div>
            </div>
        `;
        
        // Populate selector
        themeManager.populateThemeSelector();
    }
    
    console.log(' Theme Manager ready!');
});

// ============ EXPOSE GLOBALLY ============

// Make theme manager available globally
window.ThemeManager = ThemeManager;
window.themeManager = themeManager;

// Expose theme functions globally
window.switchTheme = (theme) => themeManager?.setTheme(theme);
window.toggleTheme = () => themeManager?.toggleTheme();
window.exportTheme = (name) => themeManager?.exportTheme(name);
window.importTheme = (data) => themeManager?.importTheme(data);
window.randomTheme = () => themeManager?.generateRandomTheme();

// ============ KEYBOARD SHORTCUTS ============

document.addEventListener('keydown', (e) => {
    // Ctrl+Shift+T: Toggle theme
    if (e.ctrlKey && e.shiftKey && e.key === 'T') {
        e.preventDefault();
        toggleTheme();
    }
    
    // Ctrl+Shift+R: Random theme
    if (e.ctrlKey && e.shiftKey && e.key === 'R') {
        e.preventDefault();
        randomTheme();
    }
});

// ============ CONSOLE HELP ============

console.log(`
 Theme Manager Available Commands:
  - themeManager.toggleTheme()     - Cycle through themes
  - themeManager.setTheme('dark')  - Set specific theme
  - themeManager.randomTheme()     - Generate random theme
  - themeManager.exportTheme()     - Export current theme
  - themeManager.resetTheme()      - Reset to default theme
  - themeManager.getStats()        - Show theme statistics
  
Available Themes: ${Object.keys(themeManager?.themes || {}).join(', ')}
`);

// ============ THEME PREVIEW ON HOVER ============

// Add theme preview on hover for theme selector options
document.addEventListener('DOMContentLoaded', () => {
    const themeSelect = document.getElementById('theme-selector');
    if (themeSelect) {
        themeSelect.addEventListener('mouseover', (e) => {
            if (e.target.tagName === 'OPTION') {
                const themeName = e.target.value;
                if (themeName && themeManager) {
                    // Preview theme on hover (optional)
                    // themeManager.previewTheme(themeName);
                }
            }
        });
    }
});

// ============ THEME COMPATIBILITY CHECK ============

/**
 * Check if browser supports CSS custom properties
 */
function supportsCSSVariables() {
    try {
        const testElement = document.createElement('div');
        testElement.style.setProperty('--test', 'test');
        return testElement.style.getPropertyValue('--test') === 'test';
    } catch {
        return false;
    }
}

if (!supportsCSSVariables()) {
    console.warn(' Browser does not support CSS custom properties. Theme switching may not work.');
    document.body.innerHTML += `
        <div style="position: fixed; top: 0; left: 0; right: 0; background: #f44336; color: white; padding: 10px; text-align: center; z-index: 99999;">
             Your browser doesn't support theme switching. Please update to a modern browser.
        </div>
    `;
}
