import pymysql
from flask import g, jsonify

def get_all_employees():
    """
    从数据库获取所有员工信息。
    """
    try:
        with g.db.cursor(pymysql.cursors.DictCursor) as cursor: # 使用DictCursor方便通过键访问
            sql = "SELECT Staff_Num, Staff_Name, Staff_Position, Is_On_Duty FROM Staff"
            cursor.execute(sql)
            employees = cursor.fetchall()
            return jsonify(employees), 200
    except Exception as e:
        print(f"Error fetching employees: {e}")
        return jsonify({'error': str(e)}), 500

def add_employee(data):
    """
    向数据库添加新员工。
    data 字典应包含 Staff_Num, Staff_Name, Staff_Position, Is_On_Duty, Password。
    """
    staff_num = data.get('Staff_Num')
    staff_name = data.get('Staff_Name')
    staff_position = data.get('Staff_Position')
    is_on_duty = data.get('Is_On_Duty')
    password = data.get('Password') # 密码需要哈希处理，这里简化为直接存储

    if not all([staff_num, staff_name, staff_position, password is not None]):
        return jsonify({'error': '缺少必要的员工信息'}), 400

    try:
        with g.db.cursor() as cursor:
            # 检查工号是否已存在
            check_sql = "SELECT Staff_Num FROM Staff WHERE Staff_Num = %s"
            cursor.execute(check_sql, (staff_num,))
            if cursor.fetchone():
                return jsonify({'error': '工号已存在'}), 409 # Conflict

            sql = "INSERT INTO Staff (Staff_Num, Staff_Name, Staff_Position, Is_On_Duty, Password) VALUES (%s, %s, %s, %s, %s)"
            cursor.execute(sql, (staff_num, staff_name, staff_position, is_on_duty, password))
        g.db.commit()
        return jsonify({'message': '员工添加成功'}), 201 # Created
    except Exception as e:
        g.db.rollback()
        print(f"Error adding employee: {e}")
        return jsonify({'error': str(e)}), 500

def delete_employee(staff_num):
    """
    从数据库删除指定工号的员工。
    """
    try:
        with g.db.cursor() as cursor:
            sql = "DELETE FROM Staff WHERE Staff_Num = %s"
            affected_rows = cursor.execute(sql, (staff_num,))
        g.db.commit()
        if affected_rows > 0:
            return jsonify({'message': '员工删除成功'}), 200
        else:
            return jsonify({'error': '未找到该员工'}), 404
    except Exception as e:
        g.db.rollback()
        print(f"Error deleting employee: {e}")
        return jsonify({'error': str(e)}), 500

def edit_employee(staff_num, data):
    """
    更新数据库中指定工号的员工信息。
    data 字典应包含 Staff_Name, Staff_Position, Is_On_Duty, 可选的 Password。
    """
    staff_name = data.get('Staff_Name')
    staff_position = data.get('Staff_Position')
    is_on_duty = data.get('Is_On_Duty')
    password = data.get('Password')

    if not all([staff_name, staff_position, is_on_duty is not None]):
        return jsonify({'error': '缺少必要的更新信息'}), 400

    update_fields = []
    params = []

    update_fields.append("Staff_Name = %s")
    params.append(staff_name)
    update_fields.append("Staff_Position = %s")
    params.append(staff_position)
    update_fields.append("Is_On_Duty = %s")
    params.append(is_on_duty)
    
    if password: # 如果提供了新密码，则更新
        update_fields.append("Password = %s")
        params.append(password)

    if not update_fields:
        return jsonify({'error': '没有提供任何更新字段'}), 400

    try:
        with g.db.cursor() as cursor:
            sql = f"UPDATE Staff SET {', '.join(update_fields)} WHERE Staff_Num = %s"
            params.append(staff_num)
            affected_rows = cursor.execute(sql, tuple(params))
        g.db.commit()
        if affected_rows > 0:
            return jsonify({'message': '员工信息更新成功'}), 200
        else:
            return jsonify({'error': '未找到该员工或数据未修改'}), 404
    except Exception as e:
        g.db.rollback()
        print(f"Error editing employee: {e}")
        return jsonify({'error': str(e)}), 500
    
def get_inventory_summary():
    """
    从数据库获取库存流水信息。
    """
    try:
        with g.db.cursor(pymysql.cursors.DictCursor) as cursor:
            sql = "SELECT goods_id, goods_name, current_stock, total_in, total_out FROM vw_warehouse_inventory_summary"
            cursor.execute(sql)
            inventory_summary = cursor.fetchall()
            return jsonify(inventory_summary), 200
    except Exception as e:
        print(f"Error fetching inventory summary: {e}")
        return jsonify({'error': str(e)}), 500
    
def get_goods_alerts():
    """
    从数据库视图 view_goods_alert 获取库存预警信息。
    """
    try:
        with g.db.cursor(pymysql.cursors.DictCursor) as cursor:
            sql = """
                SELECT 
                    Good_Num,
                    Good_Name,
                    Current_Quantity,
                    Min_Quantity,
                    Quantity_Gap,
                    Alert_Level,
                    Alert_Time
                FROM view_goods_alert
            """
            cursor.execute(sql)
            alerts = cursor.fetchall()
            return jsonify(alerts), 200
    except Exception as e:
        print(f"Error fetching goods alerts: {e}")
        return jsonify({'error': str(e)}), 500


def get_dashboard_stats():
    """
    从数据库获取仪表盘所需的统计数据。
    包括客户数量、员工数量、供应商数量和预警商品数量。
    """
    stats = {
        'total_customers': 0,
        'total_employees': 0,
        'total_suppliers': 0,
        'alert_items_count': 0
    }
    try:
        with g.db.cursor(pymysql.cursors.DictCursor) as cursor:
            # 获取客户数量
            cursor.execute("SELECT COUNT(*) AS count FROM customers")
            stats['total_customers'] = cursor.fetchone()['count']

            # 获取员工数量
            cursor.execute("SELECT COUNT(*) AS count FROM staff")
            stats['total_employees'] = cursor.fetchone()['count']

            # 获取供应商数量
            cursor.execute("SELECT COUNT(*) AS count FROM suppliers")
            stats['total_suppliers'] = cursor.fetchone()['count']

            # 获取预警商品数量（从 view_goods_alert 视图）
            cursor.execute("SELECT COUNT(*) AS count FROM view_goods_alert WHERE Alert_Level != 'NORMAL'") # 只统计非NORMAL级别的预警
            stats['alert_items_count'] = cursor.fetchone()['count']

        return jsonify(stats), 200
    except Exception as e:
        print(f"Error fetching dashboard stats: {e}")
        return jsonify({'error': str(e)}), 500