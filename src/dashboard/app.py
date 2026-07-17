#!/usr/bin/env python3
"""
Keylogger Dashboard - Flask Web Interface
"""
from flask import Flask, render_template, jsonify, request, send_from_directory
import os
import sys
import json
from datetime import datetime

# Add parent directory to path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))

app = Flask(__name__, 
            template_folder='templates',
            static_folder='static',
            static_url_path='/static')

app.secret_key = 'dev-secret-key-change-in-production'

# Paths
BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
LOG_FILE = os.path.join(BASE_DIR, 'logs', 'keystrokes.log')

# Ensure directories exist
os.makedirs(os.path.dirname(LOG_FILE), exist_ok=True)
os.makedirs(os.path.join(BASE_DIR, 'data'), exist_ok=True)

# ============================================================================
# PAGE ROUTES
# ============================================================================

@app.route('/')
def index():
    """Home page - Disclaimer"""
    return render_template('disclaimer.html')

@app.route('/dashboard')
def dashboard():
    """Dashboard page"""
    logs = []
    if os.path.exists(LOG_FILE):
        with open(LOG_FILE, 'r') as f:
            logs = f.readlines()[-100:]
    return render_template('dashboard.html', logs=logs)

@app.route('/detection')
def detection():
    """Detection page"""
    return render_template('detection.html')

@app.route('/analytics')
def analytics():
    """Analytics page"""
    return render_template('analytics.html')

@app.route('/settings')
def settings():
    """Settings page"""
    return render_template('settings.html')

@app.route('/about')
def about():
    """About page"""
    return render_template('about.html')

# ============================================================================
# API ROUTES
# ============================================================================

@app.route('/api/logs')
def api_logs():
    """Get logs"""
    logs = []
    if os.path.exists(LOG_FILE):
        with open(LOG_FILE, 'r') as f:
            logs = f.read().splitlines()
    return jsonify({'logs': logs[-100:]})

@app.route('/api/logs/clear', methods=['POST'])
def api_logs_clear():
    """Clear logs"""
    if os.path.exists(LOG_FILE):
        open(LOG_FILE, 'w').close()
    return jsonify({'success': True})

@app.route('/api/logs/export')
def api_logs_export():
    """Export logs"""
    logs = []
    if os.path.exists(LOG_FILE):
        with open(LOG_FILE, 'r') as f:
            logs = f.read().splitlines()
    
    output = "Timestamp,Key,Window\n"
    for log in logs[-1000:]:
        parts = log.split('|')
        if len(parts) >= 2:
            output += f"{parts[0].strip()},{parts[1].strip()},{parts[2].strip() if len(parts) > 2 else ''}\n"
    
    response = app.response_class(
        output,
        mimetype='text/csv',
        headers={'Content-Disposition': 'attachment; filename=logs.csv'}
    )
    return response

@app.route('/api/scan', methods=['POST'])
def api_scan():
    """Scan for threats"""
    from src.detection.detector import KeyloggerDetector
    detector = KeyloggerDetector()
    threats = detector.scan_processes()
    return jsonify({
        'threats': threats,
        'count': len(threats)
    })

@app.route('/api/analytics-data')
def api_analytics_data():
    """Analytics data"""
    logs = []
    if os.path.exists(LOG_FILE):
        with open(LOG_FILE, 'r') as f:
            logs = f.read().splitlines()
    
    return jsonify({
        'total': len(logs),
        'sessions': 1,
        'security_score': 100,
        'avg_session': '00:00:00',
        'time_series': [0, 0, 0, 0, 0, 0, 0],
        'key_frequency': {}
    })

# ============================================================================
# STATIC FILES
# ============================================================================

@app.route('/static/<path:filename>')
def static_files(filename):
    """Serve static files"""
    return send_from_directory('static', filename)

# ============================================================================
# ERROR HANDLERS
# ============================================================================

@app.errorhandler(404)
def not_found(e):
    return render_template('disclaimer.html'), 404

@app.errorhandler(500)
def server_error(e):
    return f"<h1>500 Error</h1><p>{str(e)}</p>", 500

# ============================================================================
# MAIN
# ============================================================================

if __name__ == '__main__':
    print("=" * 60)
    print(" Keylogger Dashboard Starting...")
    print("=" * 60)
    print(f" http://127.0.0.1:5000")
    print(f" http://localhost:5000")
    print("=" * 60)
    print("  Press CTRL+C to stop")
    print("=" * 60)
    
    app.run(host='0.0.0.0', port=5000, debug=True)
