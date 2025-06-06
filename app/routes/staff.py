from flask import Blueprint, render_template, request, jsonify, g,session
# 修改开始
from app.services.staff_service import get_all_employees,add_employee,delete_employee,edit_employee
# 修改结束
staff_bp = Blueprint('staff', __name__)

@staff_bp.route('/staff',methods=['GET'])
def customer():
    user_info={
        'username':session['username'],
        'userid':session['user_id']
    }
    return render_template('staff.html',user=user_info)

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