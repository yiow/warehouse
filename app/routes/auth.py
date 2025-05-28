from flask import Blueprint, render_template, request, jsonify, g
from app.services.auth_service import authenticate_user, register_new_user

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/login', methods=['GET'])
def show_login():
    return render_template('login.html')

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    result = authenticate_user(
        data.get('userType'),
        data.get('username'),
        data.get('password')
    )
    return jsonify(result)

@auth_bp.route('/register', methods=['GET'])
def show_register():
    return render_template('register.html')

@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    result = register_new_user(
        data.get('userType'),
        data.get('username'),
        data.get('phone'),
        data.get('password')
    )
    return jsonify(result)
