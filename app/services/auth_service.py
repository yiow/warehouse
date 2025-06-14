import pymysql
from flask import g

def authenticate_user(user_type, username, password):
    try:
        with g.db.cursor() as cursor:
            if user_type == 'customer':
                sql = "SELECT Customer_Num AS id, Customer_UserName AS username, Password FROM customers WHERE Customer_UserName=%s"
            elif user_type == 'supplier':
                sql = "SELECT Supplier_Num AS id, Supplier_UserName AS username, Password FROM suppliers WHERE Supplier_UserName=%s"
            elif user_type == 'staff' or user_type == 'remover':
                sql = "SELECT Staff_Num AS id, Staff_Name AS username, Password FROM staff WHERE Staff_Name=%s"
            else:
                return {'success': False, 'message': '无效的用户类型'}, 400
                
            cursor.execute(sql, (username,))
            user = cursor.fetchone()
            
            if user:
                if password == user['Password']:
                    # 登录成功，返回用户信息
                    return {
                        'success': True,
                        'message': '登录成功',
                        'user': {
                            'id': user['id'],
                            'username': user['username'],
                            'type': user_type
                        }
                    }
                else:
                    return {'success': False, 'message': '密码错误'}, 401
            else:
                return {'success': False, 'message': '用户名不存在'}, 404
    except pymysql.Error as e:
        return {'success': False, 'message': f'数据库错误：{str(e)}'}, 500


def register_new_user(user_type, username, phone, password):
    try:
        with g.db.cursor() as cursor:
            if user_type == 'customer':
                check_sql = "SELECT 1 FROM customers WHERE Customer_UserName=%s"
                insert_sql = "INSERT customers(Customer_UserName,Customer_Phone,Password) VALUES(%s,%s,%s)"
            elif user_type == 'supplier':
                check_sql = "SELECT 1 FROM suppliers WHERE Supplier_UserName=%s"
                insert_sql = "INSERT suppliers(Supplier_UserName,Supplier_Phone,Password) VALUES(%s,%s,%s)"
            else:
                return {'success': False, 'message': '无效的用户类型'}, 400
                
            cursor.execute(check_sql, (username,))
            if cursor.fetchone():
                return {'success': False, 'message': '用户名重复'}, 409
                
            cursor.execute(insert_sql, (username, phone, password))
            g.db.commit()
            return {'success': True}
    except pymysql.Error as e:
        return {'success': False, 'message': f'数据库错误：{str(e)}'}, 500
