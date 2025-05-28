from flask import Blueprint, render_template, request, jsonify, g,session
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
    if isinstance(result, tuple):
        result_data, status = result
    else:
        result_data = result
        status = 200

    if result_data.get('success'):
        user = result_data['user']  
        session['user_id'] = user['id']
        session['username'] = user['username']
        session['user_type'] = user['type']

    return jsonify(result_data), status


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
