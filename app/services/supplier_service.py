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