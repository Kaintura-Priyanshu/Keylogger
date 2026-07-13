# src/detection/detector.py
import psutil
import os
import re

class KeyloggerDetector:
    # Known keylogging process names/patterns
    SUSPICIOUS_NAMES = [
        'keylog', 'spy', 'monitor', 'capture', 
        'logger', 'record', 'stealth'
    ]
    
    # Keylogging API patterns
    SUSPICIOUS_API_CALLS = [
        'GetAsyncKeyState',      # Polling [citation:6]
        'SetWindowsHookEx',      # Keyboard hooking [citation:6]
        'GetKeyState',           # Keystate polling
        'WH_KEYBOARD_LL',        # Low-level hook
        'RegisterRawInputDevices' # Raw input capture
    ]
    
    def __init__(self):
        self.detected_processes = []
        
    def scan_processes(self):
        """Scan all running processes for suspicious indicators"""
        suspicious = []
        for proc in psutil.process_iter(['pid', 'name', 'cmdline']):
            try:
                proc_info = proc.info
                proc_name = proc_info['name'].lower()
                
                # Check process name
                for pattern in self.SUSPICIOUS_NAMES:
                    if pattern in proc_name:
                        suspicious.append({
                            'pid': proc_info['pid'],
                            'name': proc_info['name'],
                            'reason': f'Name contains "{pattern}"'
                        })
                        break
                        
                # Check loaded DLLs for keylogging APIs
                # (Advanced: scan memory for API hook patterns)
                
            except (psutil.NoSuchProcess, psutil.AccessDenied):
                continue
                
        self.detected_processes = suspicious
        return suspicious
        
    def generate_alert(self):
        """Generate detection alert"""
        if not self.detected_processes:
            return "✅ No suspicious processes detected"
            
        alert = "⚠️ KEYLOGGER DETECTED!\n"
        alert += "=" * 50 + "\n"
        for proc in self.detected_processes:
            alert += f"PID: {proc['pid']} | Process: {proc['name']}\n"
            alert += f"Reason: {proc['reason']}\n\n"
        return alert
