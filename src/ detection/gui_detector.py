# src/detection/gui_detector.py
import tkinter as tk
from tkinter import scrolledtext, messagebox, ttk
from detector import KeyloggerDetector

class DetectionGUI:
    def __init__(self):
        self.root = tk.Tk()
        self.root.title("Keylogger Detection Tool")
        self.root.geometry("700x500")
        self.detector = KeyloggerDetector()
        self.setup_ui()
        
    def setup_ui(self):
        # Title
        title = tk.Label(self.root, text="🔐 Keylogger Detection System", 
                         font=("Arial", 18, "bold"))
        title.pack(pady=10)
        
        # Scan button
        scan_btn = tk.Button(self.root, text="🔍 Scan for Keyloggers",
                            command=self.scan_system,
                            bg="#4CAF50", fg="white", font=("Arial", 12))
        scan_btn.pack(pady=10)
        
        # Results area
        self.results = scrolledtext.ScrolledText(self.root, width=80, 
                                                 height=20, font=("Courier", 10))
        self.results.pack(padx=20, pady=10)
        
        # Mitigation button
        mit_btn = tk.Button(self.root, text="⚡ Terminate & Quarantine",
                           command=self.mitigate_threat,
                           bg="#f44336", fg="white", font=("Arial", 12))
        mit_btn.pack(pady=10)
        
    def scan_system(self):
        self.results.delete(1.0, tk.END)
        self.results.insert(tk.END, "🔄 Scanning running processes...\n\n")
        self.root.update()
        
        suspicious = self.detector.scan_processes()
        alert = self.detector.generate_alert()
        self.results.insert(tk.END, alert)
        
        if self.detector.detected_processes:
            self.results.insert(tk.END, "\n💡 MITIGATION STEPS:\n")
            self.results.insert(tk.END, "1. Terminate suspicious processes\n")
            self.results.insert(tk.END, "2. Delete log files\n")
            self.results.insert(tk.END, "3. Run full antivirus scan\n")
            self.results.insert(tk.END, "4. Change all passwords\n")
            self.results.insert(tk.END, "5. Enable MFA on all accounts\n")
            
    def mitigate_threat(self):
        if not self.detector.detected_processes:
            messagebox.showinfo("Info", "No threats detected to mitigate")
            return
            
        for proc in self.detector.detected_processes:
            try:
                import os
                os.system(f"taskkill /F /PID {proc['pid']}")
                self.results.insert(tk.END, f"✅ Terminated PID {proc['pid']}\n")
            except Exception as e:
                self.results.insert(tk.END, f"❌ Failed to terminate: {e}\n")
                
    def run(self):
        self.root.mainloop()
