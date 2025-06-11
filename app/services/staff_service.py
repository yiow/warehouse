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
    
def add_request_record(data):
    """
    向数据库添加新的请求记录（订单）。
    data 字典应包含 Good_Num, Request_Quantity。
    """
    good_num = data.get('Good_Num')
    request_quantity = data.get('Request_Quantity')

    if not all([good_num, request_quantity]) or request_quantity <= 0:
        return jsonify({'error': '缺少必要的订购信息或订购数量无效'}), 400

    try:
        with g.db.cursor() as cursor:
            # 插入请求记录，触发器会自动处理 Preferred_Supplier_ID, Status, Matched_Price
            sql = """
                INSERT INTO Request_Record (Good_Num, Request_Quantity, Status)
                VALUES (%s, %s, %s)
            """
            # 初始状态可以设为 'Pending' 或其他，触发器会将其更新为 'Matched' 或 'Unmatched'
            cursor.execute(sql, (good_num, request_quantity, 'Pending'))
            g.db.commit() # 提交事务

            return jsonify({'message': '订单已成功提交！'}), 201
    except Exception as e:
        print(f"Error adding request record: {e}")
        return jsonify({'error': str(e)}), 500
    
def get_all_request_records():
    """
    从数据库获取所有订购请求记录，并关联商品名称。
    """
    try:
        with g.db.cursor(pymysql.cursors.DictCursor) as cursor:
            sql = """
                SELECT
                    rr.Request_ID,
                    rr.Good_Num,
                    g.Good_Name,
                    rr.Request_Quantity,
                    rr.Preferred_Supplier_ID,
                    rr.Status,
                    rr.Matched_Price
                FROM request_record rr
                JOIN goods g ON rr.Good_Num = g.Good_Num
                ORDER BY rr.Request_ID DESC
            """
            cursor.execute(sql)
            records = cursor.fetchall()
            return jsonify(records), 200
    except Exception as e:
        print(f"Error fetching request records: {e}")
        return jsonify({'error': str(e)}), 500


# 新增：获取供应商商品价格视图数据
def get_supplier_prices_view():
    """
    从数据库获取供应商商品价格视图的数据。
    """
    try:
        with g.db.cursor(pymysql.cursors.DictCursor) as cursor:
            # 假设您的视图名为 `view_supplier_prices`
            sql = """
                SELECT Good_Num, Good_Name, Supplier_Num, Supplier_UserName, Good_Price
                FROM supplier_goods_pricing_analysis
                ORDER BY Good_Name, Supplier_UserName
            """
            cursor.execute(sql)
            supplier_prices = cursor.fetchall()
            return jsonify(supplier_prices), 200
    except Exception as e:
        print(f"Error fetching supplier prices view: {e}")
        return jsonify({'error': str(e)}), 500
