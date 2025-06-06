from flask import Flask

def create_app(config_name='default'):
    app = Flask(__name__)
    
    # 加载配置
    from app.config import config
    app.config.from_object(config[config_name])
    app.secret_key = 'your-very-secure-secret-key'

    # 初始化扩展
    from app.extensions import db
    db.init_app(app)
    
    # 注册蓝图
    from app.routes.auth import auth_bp
    from app.routes.customer import customer_bp
    from app.routes.supplier import supplier_bp
    from app.routes.staff import staff_bp
    from app.routes.remover import remover_bp

    
    app.register_blueprint(auth_bp)
    app.register_blueprint(customer_bp)
    app.register_blueprint(supplier_bp)
    app.register_blueprint(staff_bp)
    app.register_blueprint(remover_bp)

    return app
