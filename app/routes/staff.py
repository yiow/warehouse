from flask import Blueprint, render_template, request, jsonify, g,session
# 修改开始
from app.services.staff_service import (
    get_all_employees,
    add_employee,
    delete_employee,
    edit_employee,
    get_inventory_summary,
    get_goods_alerts,
    get_dashboard_stats)
from app.services.supplier_service import (
    get_all_suppliers, 
    delete_supplier, 
    edit_supplier)

# 修改结束
staff_bp = Blueprint('staff', __name__)

@staff_bp.route('/staff',methods=['GET'])
def customer():
    user_info={
        'username':session['username'],
        'userid':session['user_id']
    }
    return render_template('staff.html',user=user_info)

#获取主页的数据
@staff_bp.route('/staff/dashboard_stats', methods=['GET'])
def get_dashboard_stats_route():
    return get_dashboard_stats()

# 修改开始：获取所有员工的路由
@staff_bp.route('/staff/employees', methods=['GET'])
def get_employees_route():
    return get_all_employees()
# 添加员工的路由
@staff_bp.route('/staff/add_employee', methods=['POST'])
def add_employee_route():
    data = request.get_json()
    return add_employee(data)

# 删除员工的路由
@staff_bp.route('/staff/delete_employee/<int:staff_num>', methods=['DELETE'])
def delete_employee_route(staff_num):
    return delete_employee(staff_num)

# 编辑员工的路由
@staff_bp.route('/staff/edit_employee/<int:staff_num>', methods=['PUT'])
def edit_employee_route(staff_num):
    data = request.get_json()
    return edit_employee(staff_num, data)

@staff_bp.route('/staff/suppliers', methods=['GET']) # 获取所有供应商
def get_suppliers_route():
    return get_all_suppliers()

@staff_bp.route('/staff/edit_supplier/<int:supplier_num>', methods=['PUT']) # 新增：编辑供应商路由
def edit_supplier_route(supplier_num):
    data = request.get_json()
    return edit_supplier(supplier_num, data)

@staff_bp.route('/staff/delete_supplier/<int:supplier_num>', methods=['DELETE']) # 删除供应商
def delete_supplier_route(supplier_num):
    return delete_supplier(supplier_num)

@staff_bp.route('/staff/inventory_summary', methods=['GET'])
def get_inventory_summary_route():
    return get_inventory_summary()

@staff_bp.route('/staff/alerts', methods=['GET'])
def get_alerts_route():
    return get_goods_alerts()