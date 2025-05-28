from flask import Blueprint, render_template, request, jsonify, g
from app.services.customer_service import show_products

customer_bp = Blueprint('customer', __name__)

@customer_bp.route('/customer',methods=['GET'])
def customer():
    return render_template('customer.html')
#获取商品数据
@customer_bp.route('/products',methods=['GET'])
def get_products():
    return show_products()