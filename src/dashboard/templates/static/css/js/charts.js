// src/dashboard/static/js/charts.js
/**
 * Charts Module
 * Handles all Chart.js visualizations with real-time updates
 */

class ChartManager {
    constructor() {
        this.charts = {};
        this.colors = {
            primary: 'rgba(88, 166, 255, 0.8)',
            success: 'rgba(63, 185, 80, 0.8)',
            danger: 'rgba(248, 81, 73, 0.8)',
            warning: 'rgba(210, 153, 34, 0.8)',
            purple: 'rgba(188, 140, 255, 0.8)',
            cyan: 'rgba(121, 192, 255, 0.8)'
        };
        
        this.init();
    }
    
    init() {
        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.createCharts());
        } else {
            this.createCharts();
        }
    }
    
    createCharts() {
        this.createKeystrokeChart();
        this.createKeyFrequencyChart();
        this.createActivityChart();
        this.createHourlyChart();
        this.createSecurityChart();
    }
    
    createKeystrokeChart() {
        const canvas = document.getElementById('keystroke-chart');
        if (!canvas) return;
        
        this.charts.keystroke = new Chart(canvas, {
            type: 'bar',
            data: {
                labels: Array.from({length: 10}, (_, i) => `${i+1}m ago`),
                datasets: [{
                    label: 'Keystrokes',
                    data: Array(10).fill(0),
                    backgroundColor: 'rgba(88, 166, 255, 0.6)',
                    borderColor: 'rgba(88, 166, 255, 1)',
                    borderWidth: 2,
                    borderRadius: 4,
                    hoverBackgroundColor: 'rgba(88, 166, 255, 0.8)'
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
                            label: (ctx) => `${ctx.parsed.y} keystrokes`
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
                    duration: 750,
                    easing: 'easeInOutQuart'
                }
            }
        });
    }
    
    createKeyFrequencyChart() {
        const canvas = document.getElementById('key-frequency-chart');
        if (!canvas) return;
        
        this.charts.frequency = new Chart(canvas, {
            type: 'bar',
            data: {
                labels: ['Space', 'E', 'T', 'A', 'O', 'I', 'N', 'S', 'H', 'R'],
                datasets: [{
                    label: 'Frequency',
                    data: Array(10).fill(0),
                    backgroundColor: [
                        'rgba(88, 166, 255, 0.8)',
                        'rgba(63, 185, 80, 0.8)',
                        'rgba(210, 153, 34, 0.8)',
                        'rgba(248, 81, 73, 0.8)',
                        'rgba(188, 140, 255, 0.8)',
                        'rgba(121, 192, 255, 0.8)',
                        'rgba(191, 90, 242, 0.8)',
                        'rgba(255, 112, 112, 0.8)',
                        'rgba(79, 195, 247, 0.8)',
                        'rgba(165, 214, 167, 0.8)'
                    ],
                    borderWidth: 1,
                    borderRadius: 4
                }]
            },
            options: {
                indexAxis: 'y',
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        callbacks: {
                            label: (ctx) => `${ctx.parsed.x} uses`
                        }
                    }
                },
                scales: {
                    x: {
                        beginAtZero: true,
                        ticks: {
                            color: '#8b949e'
                        },
                        grid: {
                            color: 'rgba(48, 54, 61, 0.5)'
                        }
                    },
                    y: {
                        ticks: {
                            color: '#8b949e'
                        },
                        grid: {
                            display: false
                        }
                    }
                },
                animation: {
                    duration: 750,
                    easing: 'easeInOutQuart'
                }
            }
        });
    }
    
    createActivityChart() {
        const canvas = document.getElementById('activity-chart');
        if (!canvas) return;
        
        this.charts.activity = new Chart(canvas, {
            type: 'line',
            data: {
                labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
                datasets: [{
                    label: 'Keystrokes',
                    data: Array(7).fill(0),
                    borderColor: 'rgba(88, 166, 255, 1)',
                    backgroundColor: 'rgba(88, 166, 255, 0.1)',
                    fill: true,
                    tension: 0.4,
                    pointBackgroundColor: 'rgba(88, 166, 255, 1)',
                    pointRadius: 4,
                    pointHoverRadius: 6
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
                            label: (ctx) => `${ctx.parsed.y} keystrokes`
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
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
                    duration: 750,
                    easing: 'easeInOutQuart'
                }
            }
        });
    }
    
    createHourlyChart() {
        const canvas = document.getElementById('hourly-chart');
        if (!canvas) return;
        
        this.charts.hourly = new Chart(canvas, {
            type: 'radar',
            data: {
                labels: ['12a', '2a', '4a', '6a', '8a', '10a', '12p', '2p', '4p', '6p', '8p', '10p'],
                datasets: [{
                    label: 'Activity Level',
                    data: Array(12).fill(0),
                    borderColor: 'rgba(188, 140, 255, 1)',
                    backgroundColor: 'rgba(188, 140, 255, 0.2)',
                    pointBackgroundColor: 'rgba(188, 140, 255, 1)',
                    pointRadius: 3
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    r: {
                        beginAtZero: true,
                        ticks: {
                            color: '#8b949e',
                            backdropColor: 'transparent'
                        },
                        grid: {
                            color: 'rgba(48, 54, 61, 0.5)'
                        },
                        angleLines: {
                            color: 'rgba(48, 54, 61, 0.5)'
                        },
                        pointLabels: {
                            color: '#8b949e'
                        }
                    }
                },
                animation: {
                    duration: 750,
                    easing: 'easeInOutQuart'
                }
            }
        });
    }
    
    createSecurityChart() {
        const canvas = document.getElementById('security-chart');
        if (!canvas) return;
        
        this.charts.security = new Chart(canvas, {
            type: 'doughnut',
            data: {
                labels: ['Safe', 'Warning', 'Critical'],
                datasets: [{
                    data: [95, 4, 1],
                    backgroundColor: [
                        'rgba(63, 185, 80, 0.8)',
                        'rgba(210, 153, 34, 0.8)',
                        'rgba(248, 81, 73, 0.8)'
                    ],
                    borderColor: [
                        'rgba(63, 185, 80, 1)',
                        'rgba(210, 153, 34, 1)',
                        'rgba(248, 81, 73, 1)'
                    ],
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            color: '#8b949e',
                            padding: 15
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: (ctx) => `${ctx.label}: ${ctx.parsed}%`
                        }
                    }
                },
                cutout: '70%',
                animation: {
                    animateRotate: true,
                    duration: 1000
                }
            }
        });
    }
    
    // Update methods
    updateKeystrokeData(data) {
        if (this.charts.keystroke) {
            const counts = Array(10).fill(0);
            const now = Date.now();
            
            data.forEach(log => {
                const timestamp = log.timestamp || log.split('|')[0]?.trim();
                if (timestamp) {
                    const logTime = new Date(timestamp).getTime();
                    if (!isNaN(logTime)) {
                        const diffMinutes = Math.floor((now - logTime) / (1000 * 60));
                        if (diffMinutes >= 0 && diffMinutes < 10) {
                            counts[9 - diffMinutes]++;
                        }
                    }
                }
            });
            
            this.charts.keystroke.data.datasets[0].data = counts;
            this.charts.keystroke.update();
        }
    }
    
    updateFrequencyData(keyCounts) {
        if (this.charts.frequency && keyCounts) {
            const sorted = Object.entries(keyCounts)
                .sort((a, b) => b[1] - a[1])
                .slice(0, 10);
            
            this.charts.frequency.data.labels = sorted.map(([key]) => key);
            this.charts.frequency.data.datasets[0].data = sorted.map(([, count]) => count);
            this.charts.frequency.update();
        }
    }
    
    updateActivityData(dailyCounts) {
        if (this.charts.activity && dailyCounts) {
            this.charts.activity.data.datasets[0].data = dailyCounts;
            this.charts.activity.update();
        }
    }
    
    updateHourlyData(hourlyCounts) {
        if (this.charts.hourly && hourlyCounts) {
            this.charts.hourly.data.datasets[0].data = hourlyCounts;
            this.charts.hourly.update();
        }
    }
    
    updateSecurityData(safe, warning, critical) {
        if (this.charts.security) {
            this.charts.security.data.datasets[0].data = [safe, warning, critical];
            this.charts.security.update();
        }
    }
    
    updateAll(logs) {
        this.updateKeystrokeData(logs);
        
        // Calculate key frequency
        const keyCounts = {};
        logs.forEach(log => {
            const key = log.split('|')[1]?.trim() || '';
            if (key) {
                keyCounts[key] = (keyCounts[key] || 0) + 1;
            }
        });
        this.updateFrequencyData(keyCounts);
    }
}

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => {
    window.chartManager = new ChartManager();
});

// Expose functions
window.updateCharts = (data) => window.chartManager?.updateAll(data);
