#!/usr/bin/env python3
"""
GUI Detection Tool
"""
import tkinter as tk
from tkinter import scrolledtext, messagebox
from detector import KeyloggerDetector

class DetectionGUI:
    def __init__(self):
        self.root = tk.Tk()
        self.root.title("🔍 Keylogger Detection Tool")
        self.root.geometry("600x400")
        self.root.configure(bg='#1e1e1e')
        self.detector = KeyloggerDetector()
        self.setup_ui()
        
    def setup_ui(self):
        # Title
        title = tk.Label(self.root, text=" Keylogger Detection Tool", 
                         font=("Arial", 18, "bold"), fg="#ffffff", bg='#1e1e1e')
        title.pack(pady=10)
        
        # Scan Button
        scan_btn = tk.Button(self.root, text="🔍 Scan System", 
                             command=self.scan, bg="#4CAF50", fg="white", 
                             font=("Arial", 12), padx=20, pady=10)
        scan_btn.pack(pady=10)
        
        # Results
        self.results = scrolledtext.ScrolledText(self.root, width=70, height=20,
                                                  bg='#2d2d2d', fg='#e0e0e0',
                                                  font=("Courier", 10))
        self.results.pack(padx=20, pady=10)
        
    def scan(self):
        self.results.delete(1.0, tk.END)
        self.results.insert(tk.END, "🔄 Scanning...\n\n")
        self.root.update()
        
        suspicious = self.detector.scan_processes()
        report = self.detector.generate_report()
        self.results.insert(tk.END, report)
        
        if self.detector.detected:
            self.results.insert(tk.END, "\n MITIGATION:\n")
            self.results.insert(tk.END, "1. Terminate suspicious processes\n")
            self.results.insert(tk.END, "2. Change all passwords\n")
            self.results.insert(tk.END, "3. Run full antivirus scan\n")
            
    def run(self):
        self.root.mainloop()

if __name__ == "__main__":
    gui = DetectionGUI()
    gui.run()
