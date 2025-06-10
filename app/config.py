class Config:
    SECRET_KEY = 'your-secret-key'
    DB_HOST = '10.150.95.227'
    DB_USER = 'root'
    DB_PASSWORD = 'root'
    DB_PORT = 3306
    DB_NAME = 'warehousemanagementsystem'

class DevelopmentConfig(Config):
    DEBUG = True

class ProductionConfig(Config):
    DEBUG = False

config = {
    'development': DevelopmentConfig,
    'production': ProductionConfig,
    'default': DevelopmentConfig
}

