from flask import Blueprint, render_template, request, jsonify, g,session,redirect,url_for
from app.services.customer_service import show_products

customer_bp = Blueprint('customer', __name__)

@customer_bp.route('/customer',methods=['GET'])
def customer():
    user_info={
        'username':session['username'],
        'userid':session['user_id']
    }
    return render_template('customer.html',user=user_info)

#获取商品数据
@customer_bp.route('/products',methods=['GET'])
def get_products():
    return show_products()

#登出清除session
@customer_bp.route('/logout')
def logout():
    session.clear()
    return redirect(url_for('auth.show_login'))

@customer_bp.route('/save_cart',methds='POST')
def save_cart():
    cart=request.get_json()
    