import pymysql
from flask import g, current_app

class Database:
    def init_app(self, app):
        app.before_request(self.before_request)
        app.teardown_request(self.teardown_request)
    
    def before_request(self):
        g.db = self.get_db_connection()
    
    def teardown_request(self, exception):
        db = getattr(g, 'db', None)
        if db is not None:
            db.close()
    
    def get_db_connection(self):
        config = current_app.config
        return pymysql.connect(
            host=config['DB_HOST'],
            user=config['DB_USER'],
            password=config['DB_PASSWORD'],
            port=config['DB_PORT'],
            database=config['DB_NAME'],
            cursorclass=pymysql.cursors.DictCursor
        )

db = Database()