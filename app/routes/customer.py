from flask import Blueprint, render_template, request, jsonify, g,session,redirect,url_for
from app.services.customer_service import (
    show_products,
    save_cart_service,
    load_cart_service,
    save_order_service,
    get_orders_service,
    create_return_order_service,
    get_customer_profile_service,
    update_customer_profile_service,
    update_all_customer_vip_status_service
)

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

# 登出清除session
@customer_bp.route('/logout')
def logout():
    # 在清除session之前调用存储过程
    try:
        # 即使调用失败，也不应阻止用户登出，所以这里只做记录，不返回错误响应
        update_all_customer_vip_status_service() 
    except Exception as e:
        print(f"登出时调用VIP更新存储过程出错: {e}")

    session.clear() # 清除所有session数据
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

# 保存订单数据
@customer_bp.route('/save_order', methods=['POST'])
def save_order():
    # 检查用户是否登录 (使用session)
    if 'user_id' not in session:
        return jsonify({'error': '未授权访问'}), 401

    try:
        data = request.get_json()
        cart = data.get('items')
        user_id = session['user_id']

        # 调用服务层保存订单
        success = save_order_service(user_id, cart)

        if success:
            return jsonify({'success': True, 'message': '订单保存成功'}), 200
        else:
            return jsonify({'success': False, 'error': '订单保存失败'}), 500

    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

# 获取用户订单数据
@customer_bp.route('/orders', methods=['GET'])
def get_orders():
    # 检查用户是否登录 (使用session)
    if 'user_id' not in session:
        return jsonify({'error': '未授权访问'}), 401

    try:
        user_id = session['user_id']
        orders = get_orders_service(user_id)
        return jsonify(orders)
    except Exception as e:
        print(f'获取订单错误: {e}')
        return []

# 新增：创建退订单路由  <-- 从这里开始新增
@customer_bp.route('/return_order', methods=['POST'])
def return_order():
    if 'user_id' not in session:
        return jsonify({'error': '未授权访问'}), 401
    
    try:
        data = request.get_json()
        order_number = data.get('order_number')
        user_id = session['user_id']

        success = create_return_order_service(user_id, order_number)
        if success:
            return jsonify({'success': True, 'message': '退单申请已提交'})
        else:
            return jsonify({'success': False, 'error': '退单失败，请检查订单状态或联系客服'}), 500
    except Exception as e:
        print(f"退单请求处理失败: {e}")
        return jsonify({'success': False, 'error': str(e)}), 500

# 新增：获取用户个人信息路由
@customer_bp.route('/profile', methods=['GET'])
def get_profile():
    if 'user_id' not in session:
        return jsonify({'error': '未授权访问'}), 401
    
    try:
        user_id = session['user_id']
        success, profile_info = get_customer_profile_service(user_id) # 调用服务层函数

        if success:
            return jsonify(profile_info), 200
        else:
            return jsonify({'error': '获取个人信息失败或用户不存在'}), 404 # 用户不存在也返回404
    except Exception as e:
        print(f"获取个人信息路由错误: {e}")
        return jsonify({'error': str(e)}), 500


# 更新用户个人信息路由
@customer_bp.route('/profile', methods=['PUT'])
def update_profile():
    if 'user_id' not in session:
        return jsonify({'error': '未授权访问'}), 401
    
    try:
        user_id = session['user_id']
        data = request.get_json()
        address = data.get('address')
        phone = data.get('phone')
        
        # 验证输入 
        if address is None or phone is None: 
            return jsonify({'error': '缺少必要字段'}), 400

        # 获取用户当前完整的个人信息，以保留不可修改的字段（如VIP）
        success, current_profile = get_customer_profile_service(user_id)
        if not success or not current_profile:
            return jsonify({'success': False, 'error': '无法获取当前个人信息以进行更新'}), 500
        
        # 使用当前 VIP 状态，不从前端更新
        current_vip_status = current_profile['vip'] 

        success = update_customer_profile_service(user_id, address, phone, current_vip_status) # <--- 传递 current_vip_status

        if success:
            return jsonify({'success': True, 'message': '个人信息更新成功'}), 200
        else:
            return jsonify({'success': False, 'error': '个人信息更新失败'}), 500
    except Exception as e:
        print(f"更新个人信息路由错误: {e}")
        return jsonify({'success': False, 'error': str(e)}), 500