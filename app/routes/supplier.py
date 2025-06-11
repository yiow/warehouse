from flask import Blueprint, render_template, request, jsonify, g,session
from app.services.supplier_service import(
    get_supplier_goods,          
    get_all_warehouse_goods,     
    add_supplier_good,           
    edit_supplier_good,          
    delete_supplier_good,
    get_supplier_requests,
    update_request_status
)
supplier_bp = Blueprint('supplier', __name__)

@supplier_bp.route('/supplier',methods=['GET'])
def supplier_index():
    user_info={
        'username':session['username'],
        'userid':session['user_id']
    }
    return render_template('supplier.html',user=user_info)

@supplier_bp.route('/supplier/my_goods', methods=['GET'])
def get_my_goods_route():
    supplier_num = session.get('user_id') 
    if not supplier_num:
        return jsonify({'error': '未登录或无法获取供应商编号'}), 401
    return get_supplier_goods(supplier_num)

# 获取仓库所有商品列表
@supplier_bp.route('/supplier/warehouse_goods', methods=['GET'])
def get_warehouse_goods_route():
    return get_all_warehouse_goods()

# 添加供应商供货商品
@supplier_bp.route('/supplier/add_my_good', methods=['POST'])
def add_my_good_route():
    supplier_num = session.get('user_id')
    if not supplier_num:
        return jsonify({'error': '未登录或无法获取供应商编号'}), 401
    data = request.get_json()
    return add_supplier_good(data, supplier_num)

# 编辑供应商供货商品价格
@supplier_bp.route('/supplier/edit_my_good/<int:good_num>', methods=['PUT'])
def edit_my_good_route(good_num):
    supplier_num = session.get('user_id')
    if not supplier_num:
        return jsonify({'error': '未登录或无法获取供应商编号'}), 401
    data = request.get_json()
    return edit_supplier_good(supplier_num, good_num, data)

# 删除供应商供货商品
@supplier_bp.route('/supplier/delete_my_good/<int:good_num>', methods=['DELETE'])
def delete_my_good_route(good_num):
    supplier_num = session.get('user_id')
    if not supplier_num:
        return jsonify({'error': '未登录或无法获取供应商编号'}), 401
    return delete_supplier_good(supplier_num, good_num)


# 获取供应商的供应请求列表
@supplier_bp.route('/supplier/requests', methods=['GET'])
def get_supplier_requests_route():
    supplier_num = session.get('user_id')
    if not supplier_num:
        return jsonify({'error': '未登录或无法获取供应商编号'}), 401
    return get_supplier_requests(supplier_num)


@supplier_bp.route('/supplier/handle_request/<int:request_id>', methods=['POST'])
def handle_supplier_request_route(request_id):
    supplier_num = session.get('user_id')
    if not supplier_num:
        return jsonify({'error': '未登录或无法获取供应商编号'}), 401

    data = request.get_json()
    action_type = data.get('action') # 'accept' 或 'reject'

    if action_type == 'accept':
        new_status = 'Accepted' # 或 'Processing'
    elif action_type == 'reject':
        new_status = 'Rejected'
    else:
        return jsonify({'error': '无效的操作类型'}), 400

    return update_request_status(request_id, new_status, supplier_num)
