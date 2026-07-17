/**
 * Detection JavaScript - Scanning and monitoring
 */

function startScan() {
    const results = document.getElementById('scan-results');
    if (!results) return;
    
    results.innerHTML = '<div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 200px;"><i class="fas fa-spinner fa-spin" style="font-size: 3rem; margin-bottom: 15px;"></i><p>Scanning...</p></div>';
    
    fetch('/api/scan', { method: 'POST' })
        .then(r => r.json())
        .then(data => {
            if (data.threats && data.threats.length > 0) {
                results.innerHTML = data.threats.map(t => `
                    <div style="padding: 10px 15px; margin: 5px 0; background: rgba(248, 81, 73, 0.1); border-left: 3px solid var(--danger-color); border-radius: 4px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 5px;">
                        <span style="font-weight: 600; color: var(--danger-color);">${t.name}</span>
                        <span style="color: var(--text-muted); font-size: 0.85rem;">PID: ${t.pid}</span>
                        <span style="font-size: 0.85rem; color: var(--warning-color);">${t.reason}</span>
                    </div>
                `).join('');
                addAlert('warning', ` ${data.threats.length} suspicious process(es) detected!`);
            } else {
                results.innerHTML = `
                    <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 200px; color: var(--success-color);">
                        <i class="fas fa-check-circle" style="font-size: 3rem; margin-bottom: 15px;"></i>
                        <p> No threats detected</p>
                    </div>
                `;
                addAlert('success', ' Scan complete - No threats detected');
            }
        })
        .catch(() => {
            results.innerHTML = `
                <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 200px; color: var(--danger-color);">
                    <i class="fas fa-exclamation-circle" style="font-size: 3rem; margin-bottom: 15px;"></i>
                    <p> Scan failed</p>
                </div>
            `;
        });
}

let monitoringInterval = null;

function startMonitoring() {
    if (monitoringInterval) return;
    
    const status = document.getElementById('monitor-status');
    if (status) {
        status.innerHTML = `<span style="color: var(--success-color);"><i class="fas fa-play"></i> Monitoring</span>`;
    }
    
    addAlert('info', ' Continuous monitoring started');
    
    monitoringInterval = setInterval(() => {
        fetch('/api/monitor')
            .then(r => r.json())
            .then(data => {
                if (data.threats && data.threats.length > 0) {
                    data.threats.forEach(t => {
                        addAlert('danger', ` Threat: ${t.name} (PID: ${t.pid})
