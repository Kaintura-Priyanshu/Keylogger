#!/usr/bin/env python3
"""
Keylogger Detection Module
"""
import psutil
import os

class KeyloggerDetector:
    SUSPICIOUS_NAMES = ['keylog', 'spy', 'monitor', 'capture', 'logger', 'record']
    SUSPICIOUS_API = ['GetAsyncKeyState', 'SetWindowsHookEx', 'GetKeyState']
    
    def __init__(self):
        self.detected = []
        
    def scan_processes(self):
        """Scan running processes"""
        self.detected = []
        for proc in psutil.process_iter(['pid', 'name']):
            try:
                name = proc.info['name'].lower()
                for pattern in self.SUSPICIOUS_NAMES:
                    if pattern in name:
                        self.detected.append({
                            'pid': proc.info['pid'],
                            'name': proc.info['name'],
                            'reason': f'Contains "{pattern}"'
                        })
                        break
            except (psutil.NoSuchProcess, psutil.AccessDenied):
                continue
        return self.detected
        
    def generate_report(self):
        """Generate detection report"""
        if not self.detected:
            return " No suspicious processes detected"
        
        report = " SUSPICIOUS PROCESSES FOUND:\n"
        report += "=" * 40 + "\n"
        for proc in self.detected:
            report += f"PID: {proc['pid']} | Name: {proc['name']} | {proc['reason']}\n"
        return report

if __name__ == "__main__":
    detector = KeyloggerDetector()
    detector.scan_processes()
    print(detector.generate_report())
