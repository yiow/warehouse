import pymysql
import json
from flask import g,jsonify
#显示商品
def show_products():
    try:
        with g.db.cursor() as cursor:
            sql="SELECT Good_Num AS id,Good_Name AS name,Good_Price AS price,Good_Quantity AS stock,description,category,image FROM goods" 
            cursor.execute(sql)
            products=cursor.fetchall()
            for row in products:
                category= row['category']
                row['image'] = {
                    '电子产品': '💻',
                    '办公用品': '📁',
                    '家居用品': '☕',
                    '工具设备': '🔧'
                }.get(category, '📦')
            return jsonify(products)
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    

#保存购物车数据
def save_cart_service(user_id,cart):
    cart=json.dumps(cart)
    try:
        with g.db.cursor() as cursor:
            cursor.callproc('SyncCustomerCart', (user_id,cart))
            g.db.commit()
    except Exception as e:
        return 
    
#加载购物车数据
def load_cart_service(user_id):
    try:
        cart_items = []
        with g.db.cursor() as cursor:  # 移除 dictionary=True 参数
            cursor.callproc('GetCustomerCart', (user_id,))
            cart_items=cursor.fetchall()
            return jsonify(cart_items)
    except Exception as e:
        print(f"获取购物车失败: {e}")
        return []

#保存订单数据
def save_order_service(user_id, cart):
    try:
        with g.db.cursor() as cursor:
            # 计算订单总金额
            total_amount = sum(float(item['price']) * item['quantity'] for item in cart)
            
            # 插入订单主信息
            sql = """
                INSERT INTO Orders (Order_Status, Order_Amout, Customer_Num) 
                VALUES (%s, %s, %s)
            """
            cursor.execute(sql, ('待处理', total_amount, user_id))
            order_id = cursor.lastrowid

            # 插入订单明细信息
            for item in cart:
                product_id = item['id']
                quantity = item['quantity']
                price = item['price']
                sql = """
                    INSERT INTO Order_Detail (Order_Num, Good_Num, Quantity) 
                    VALUES (%s, %s, %s)
                """
                cursor.execute(sql, (order_id, product_id, quantity))

            g.db.commit()
            return True
    except Exception as e:
        print(f"保存订单失败: {e}")
        g.db.rollback()
        return False

# 获取用户订单数据
def get_orders_service(user_id):
    try:
        with g.db.cursor() as cursor:
            sql = """
                SELECT o.Order_Num, o.Order_Status, o.Generate_Time, o.Order_Amout,
                       od.Good_Num, g.Good_Name, g.Good_Price, od.Quantity
                FROM Orders o
                JOIN Order_Detail od ON o.Order_Num = od.Order_Num
                JOIN Goods g ON od.Good_Num = g.Good_Num
                WHERE o.Customer_Num = %s
                ORDER BY o.Generate_Time DESC
            """
            cursor.execute(sql, (user_id,))
            orders = cursor.fetchall()

            result = {}
            for row in orders:
                order_id = row['Order_Num']
                if order_id not in result:
                    result[order_id] = {
                        'order_number': order_id,
                        'order_date': row['Generate_Time'],
                        'total_amount': row['Order_Amout'],
                        'status': row['Order_Status'],
                        'items': []
                    }
                result[order_id]['items'].append({
                    'product_id': row['Good_Num'],
                    'product_name': row['Good_Name'],
                    'quantity': row['Quantity'],
                    'price': row['Good_Price']
                })

            return list(result.values())
    except Exception as e:
        print(f"获取订单失败: {e}")
        return []