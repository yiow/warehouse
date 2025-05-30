from flask import Blueprint, render_template, request, jsonify, g,session,redirect,url_for
from app.services.customer_service import show_products,save_cart_service,load_cart_service

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

#保存购物车数据
@customer_bp.route('/save_cart',methods=['POST'])
def save_cart():
    # 检查用户是否登录 (使用session)
    if 'user_id' not in session:
        return jsonify({'error': '未授权访问'}), 401
    
    try:
        data = request.get_json()
        cart_data = data.get('cart')
        user_id = session['user_id']
        
        # 调用服务层保存购物车
        save_cart_service(user_id, cart_data)
        
        return jsonify({'success': True, 'message': '购物车保存成功'}), 200
    
    except Exception as e:
        return jsonify({'success':False,'error': str(e)}), 500

#加载购物车数据
@customer_bp.route('/load_cart',methods=['GET'])
def load_cart():
    # 检查用户是否登录 (使用session)
    if 'user_id' not in session:
        return jsonify({'error': '未授权访问'}), 401
    try:
        user_id=session['user_id']
        result=load_cart_service(user_id)
        return result
    except Exception as e:
        print(f'加载购物车错误{e}')
        return []
