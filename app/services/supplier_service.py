import pymysql
from flask import g, jsonify
import traceback

def get_all_suppliers():
    """
    从数据库获取所有供应商信息。
    """
    try:
        with g.db.cursor(pymysql.cursors.DictCursor) as cursor: # 使用DictCursor方便通过键访问
            sql = "SELECT Supplier_Num, Supplier_UserName, Supplier_Phone FROM Suppliers"
            cursor.execute(sql)
            suppliers = cursor.fetchall()
            return jsonify(suppliers), 200
    except Exception as e:
        print(f"获取供应商出错: {e}")
        return jsonify({'error': str(e)}), 500

# 修改开始：新增 edit_supplier 函数
def edit_supplier(supplier_num, data):
    """
    更新数据库中指定供应商编号的供应商信息。
    data 字典应包含 Supplier_UserName, Supplier_Phone。
    """
    supplier_username = data.get('Supplier_UserName')
    supplier_phone = data.get('Supplier_Phone')

    if not all([supplier_username, supplier_phone]):
        return jsonify({'error': '缺少必要的更新信息'}), 400

    try:
        with g.db.cursor() as cursor:
            sql = "UPDATE Suppliers SET Supplier_UserName = %s, Supplier_Phone = %s WHERE Supplier_Num = %s"
            affected_rows = cursor.execute(sql, (supplier_username, supplier_phone, supplier_num))
        g.db.commit()
        if affected_rows > 0:
            return jsonify({'message': '供应商信息更新成功'}), 200
        else:
            return jsonify({'error': '未找到该供应商或信息无变化'}), 404
    except Exception as e:
        g.db.rollback()
        print(f"更新供应商出错: {e}")
        return jsonify({'error': str(e)}), 500

def delete_supplier(supplier_num):
    """
    从数据库删除指定供应商编号的供应商。
    """
    try:
        with g.db.cursor() as cursor:
            sql = "DELETE FROM Suppliers WHERE Supplier_Num = %s"
            affected_rows = cursor.execute(sql, (supplier_num,))
        g.db.commit() # 提交事务
        if affected_rows > 0:
            return jsonify({'message': '供应商删除成功'}), 200
        else:
            return jsonify({'error': '未找到该供应商'}), 404
    except Exception as e:
        g.db.rollback() # 回滚事务
        print(f"删除供应商出错: {e}")
        return jsonify({'error': str(e)}), 500
    
def get_supplier_goods(supplier_num):
    """
    获取指定供应商的供货商品列表。
    联查 supplier_goods 和 goods 表，获取商品详细信息和供应商价格。
    """
    try:
        with g.db.cursor(pymysql.cursors.DictCursor) as cursor:
            sql = """
                SELECT 
                    sg.Good_Num,
                    g.Good_Name,
                    g.Description,
                    sg.Good_Price AS Supplier_Price, # 供应商供货价格
                    g.Good_Price AS Retail_Price # 销售价格
                FROM supplier_goods sg
                JOIN goods g ON sg.Good_Num = g.Good_Num
                WHERE sg.Supplier_Num = %s
            """
            cursor.execute(sql, (supplier_num,))
            goods = cursor.fetchall()
            return jsonify(goods), 200
    except Exception as e:
        print(f"获取供应商商品出错: {e}")
        return jsonify({'error': str(e)}), 500

def get_all_warehouse_goods():
    """
    获取仓库中所有商品的列表（用于供应商选择）。
    """
    try:
        with g.db.cursor(pymysql.cursors.DictCursor) as cursor:
            sql = "SELECT Good_Num, Good_Name, Description FROM goods"
            cursor.execute(sql)
            goods = cursor.fetchall()
            return jsonify(goods), 200
    except Exception as e:
        print(f"获取仓库所有商品出错: {e}")
        return jsonify({'error': str(e)}), 500

def add_supplier_good(data, supplier_num):
    """
    为指定供应商添加供货商品。
    data 字典应包含 Good_Num, Good_Price (供应商供货价格)。
    """
    good_num = data.get('Good_Num')
    supplier_price = data.get('Good_Price')

    if not all([good_num, supplier_price is not None]):
        return jsonify({'error': '缺少商品编号或供应商价格'}), 400

    try:
        # 使用 g.db.cursor()，它可能默认返回 DictCursor 或其他类型。
        # 为了兼容性，我们最好在 SQL 中给 COUNT(*) 一个别名。
        with g.db.cursor() as cursor:
            # 检查该商品是否已存在于该供应商的供货列表中
            # 为 COUNT(*) 的结果起一个别名 'count_exists'
            cursor.execute("SELECT COUNT(*) AS count_exists FROM supplier_goods WHERE Supplier_Num = %s AND Good_Num = %s", (supplier_num, good_num))
            
            result = cursor.fetchone() # 获取查询结果，它可能是一个字典或元组
            
            count = 0
            if result:
                if isinstance(result, dict):
                    # 如果结果是字典（DictCursor），通过别名 'count_exists' 获取值
                    count = result.get('count_exists', 0)
                elif isinstance(result, tuple):
                    # 如果结果是元组（默认光标），通过索引 0 获取值
                    count = result[0]
                # else: 如果有其他意外类型，你可以在这里添加处理或警告

            if count > 0: # 这一行现在会正确工作
                return jsonify({'error': '该商品已存在于您的供货列表中'}), 409 # Conflict

            sql = "INSERT INTO supplier_goods (Supplier_Num, Good_Num, Good_Price) VALUES (%s, %s, %s)"
            cursor.execute(sql, (supplier_num, good_num, supplier_price))
        g.db.commit()
        return jsonify({'message': '供货商品添加成功'}), 201
    except Exception as e:
        g.db.rollback()
        print(f"添加供应商商品出错: {e}")
        traceback.print_exc() # 保留这一行，以便将来调试其他错误
        return jsonify({'error': str(e)}), 500


def edit_supplier_good(supplier_num, good_num, data):
    """
    更新指定供应商指定商品的供货价格。
    data 字典应包含 Good_Price。
    """
    supplier_price = data.get('Good_Price')

    if supplier_price is None:
        return jsonify({'error': '缺少供应商价格'}), 400

    try:
        with g.db.cursor() as cursor:
            sql = "UPDATE supplier_goods SET Good_Price = %s WHERE Supplier_Num = %s AND Good_Num = %s"
            affected_rows = cursor.execute(sql, (supplier_price, supplier_num, good_num))
        g.db.commit()
        if affected_rows > 0:
            return jsonify({'message': '供货商品价格更新成功'}), 200
        else:
            return jsonify({'error': '未找到该供货商品或价格无变化'}), 404
    except Exception as e:
        g.db.rollback()
        print(f"编辑供应商商品出错: {e}")
        return jsonify({'error': str(e)}), 500

def delete_supplier_good(supplier_num, good_num):
    """
    删除指定供应商的指定供货商品。
    """
    try:
        with g.db.cursor() as cursor:
            sql = "DELETE FROM supplier_goods WHERE Supplier_Num = %s AND Good_Num = %s"
            affected_rows = cursor.execute(sql, (supplier_num, good_num))
        g.db.commit()
        if affected_rows > 0:
            return jsonify({'message': '供货商品删除成功'}), 200
        else:
            return jsonify({'error': '未找到该供货商品'}), 404
    except Exception as e:
        g.db.rollback()
        print(f"删除供应商商品出错: {e}")
        return jsonify({'error': str(e)}), 500
    
def get_supplier_requests(supplier_num):
    """
    从数据库获取指定供应商的供应请求（来自 Request_Record 表）。
    """
    try:
        with g.db.cursor(pymysql.cursors.DictCursor) as cursor:
            # 筛选 Preferred_Supplier_ID 为当前供应商的请求，并且 Status 为 'Matched' 或 'Pending' (取决于您的业务逻辑)
            # 关联 Goods 表以获取商品名称
            # 关联 Staff 表以获取请求人员信息 (如果需要，但这里只列出请求本身)
            sql = """
                SELECT
                    rr.Request_ID,
                    rr.Good_Num,
                    g.Good_Name,        -- 从Goods表获取商品名称
                    rr.Request_Quantity,
                    rr.Matched_Price,   -- 理论上对于已匹配的请求才会有
                    rr.Status         -- 请求状态，如 'Matched', 'Pending', 'Unmatched'
                FROM
                    Request_Record rr
                JOIN
                    Goods g ON rr.Good_Num = g.Good_Num
                WHERE
                    rr.Preferred_Supplier_ID = %s OR rr.Status = 'Matched' -- 如果您希望供应商处理所有待处理请求，无论是否匹配
                ORDER BY
                    rr.Request_ID DESC
            """
            cursor.execute(sql, (supplier_num,))
            requests = cursor.fetchall()
            return jsonify(requests), 200
    except Exception as e:
        print(f"Error fetching supplier requests: {e}")
        return jsonify({'error': str(e)}), 500
    
def get_good_position_num(good_num):
    """
    根据商品编号获取商品的默认存储位置编号 (Position_Num)。
    """
    try:
        with g.db.cursor(pymysql.cursors.DictCursor) as cursor:
            # 假设 Goods 表中有 Position_Num 字段，或者有一个默认的入库位置
            # 您需要根据实际的数据库设计来修改此查询
            sql = "SELECT Position_Num FROM Goods WHERE Good_Num = %s"
            cursor.execute(sql, (good_num,))
            result = cursor.fetchone()
            if result:
                return result['Position_Num']
            return None # 如果没有找到默认位置
    except Exception as e:
        print(f"Error fetching good position number: {e}")
        return None

def add_in_warehouse_record(order_return_num, good_num, good_quantity, position_num):
    """
    向 in_out_warehouse 表插入一条入库记录。
    Type 为 0 表示入库。
    """
    try:
        with g.db.cursor() as cursor:
            sql = """
                INSERT INTO in_out_warehouse
                (Order_Return_Num, Good_Num, Position_Num, Type, Good_Quantity)
                VALUES (%s, %s, %s, %s, %s)
            """
            cursor.execute(sql, (order_return_num, good_num, position_num, 1, good_quantity))
        return True
    except Exception as e:
        print(f"Error adding in_out_warehouse record: {e}")
        return False

# 修改 update_request_status 函数
def update_request_status(request_id, new_status, supplier_num):
    """
    更新 Request_Record 中指定请求的状态，并在接受时进行入库操作。
    确保只有 Preferred_Supplier_ID 匹配的供应商才能操作。
    """
    if new_status not in ['Accepted', 'Rejected', 'Completed', 'Canceled']: # 定义允许的状态
        return jsonify({'error': '无效的请求状态'}), 400
    try:
        with g.db.cursor() as cursor:
            # 1. 查询请求的 Good_Num 和 Request_Quantity
            sql_select = """
                SELECT Good_Num, Request_Quantity, Status, Preferred_Supplier_ID
                FROM Request_Record
                WHERE Request_ID = %s
            """
            cursor.execute(sql_select, (request_id,))
            request_info = cursor.fetchone()

            if not request_info:
                return jsonify({'error': '请求未找到'}), 404
            
            # 确保当前供应商有权限操作
            if request_info['Preferred_Supplier_ID'] != supplier_num:
                return jsonify({'error': '您无权操作此请求'}), 403 # 403 Forbidden

            # 只有当请求状态为 'Pending' 或 'Matched' 才能接受/拒绝
            if request_info['Status'] not in ['Pending', 'Matched']:
                return jsonify({'error': '请求已处理，无法再次操作'}), 400

            # 2. 更新请求状态
            sql_update = """
                UPDATE Request_Record
                SET Status = %s
                WHERE Request_ID = %s AND Preferred_Supplier_ID = %s
            """
            affected_rows = cursor.execute(sql_update, (new_status, request_id, supplier_num))

            if affected_rows > 0:
                # 3. 如果状态更新为 'Accepted'，则执行入库操作
                if new_status == 'Accepted':
                    good_num = request_info['Good_Num']
                    good_quantity = request_info['Request_Quantity']
                    
                    # 获取商品默认的存储位置
                    position_num = get_good_position_num(good_num)
                    if position_num is None:
                        # 如果没有找到默认位置，可以设置为一个通用入库区，或者报错
                        # 这里为了简化，如果找不到就返回错误
                        g.db.rollback() # 回滚前面的状态更新
                        return jsonify({'error': '无法确定商品入库位置，操作失败'}), 500

                    # 插入入库记录
                    if not add_in_warehouse_record(request_id, good_num, good_quantity, position_num):
                        g.db.rollback() # 如果入库失败，回滚请求状态更新
                        return jsonify({'error': '创建入库记录失败'}), 500

                g.db.commit() # 统一提交事务
                return jsonify({'message': f'请求 {request_id} 已更新为 {new_status}'}), 200
            else:
                g.db.rollback() # 如果没有行被更新，回滚
                return jsonify({'error': '请求更新失败或未找到此请求'}), 404
    except Exception as e:
        g.db.rollback() # 出现任何异常都回滚事务
        print(f"Error updating request status: {e}")
        return jsonify({'error': str(e)}), 500