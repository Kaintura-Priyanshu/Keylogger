# src/detection/network_monitor.py
import psutil
import socket
from collections import defaultdict

class NetworkMonitor:
    def __init__(self):
        self.connections = defaultdict(list)
        
    def monitor_connections(self, suspicious_ports=None):
        """Monitor outbound connections for data exfiltration"""
        if suspicious_ports is None:
            suspicious_ports = [25, 465, 587,  # SMTP ports
                               143, 993,        # IMAP
                               80, 443,         # HTTP/HTTPS
                               21, 22]          # FTP/SSH
                                
        alerts = []
        for conn in psutil.net_connections(kind='tcp'):
            if conn.status == 'ESTABLISHED':
                # Check if connection is to suspicious port
                if conn.raddr and conn.raddr.port in suspicious_ports:
                    alerts.append({
                        'pid': conn.pid,
                        'local_addr': f"{conn.laddr.ip}:{conn.laddr.port}",
                        'remote_addr': f"{conn.raddr.ip}:{conn.raddr.port}",
                        'status': conn.status
                    })
        return alerts
        
    def detect_data_exfiltration(self, alert_threshold=10):
        """Detect unusual data volume that may indicate exfiltration"""
        # Monitor network traffic volume per process
        # Implementation requires packet sniffing (e.g., scapy)
        pass
