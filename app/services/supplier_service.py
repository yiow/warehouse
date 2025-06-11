import pymysql
from flask import g, jsonify

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