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

# 新增：创建退订单服务  <-- 从这里开始新增
def create_return_order_service(user_id, order_number):
    try:
        with g.db.cursor() as cursor:
            # 1. 检查订单是否存在且属于当前用户，并且状态为“已完成”
            sql_check_order = "SELECT Order_Amout, Order_Status FROM Orders WHERE Order_Num = %s AND Customer_Num = %s"
            cursor.execute(sql_check_order, (order_number, user_id))
            order_info = cursor.fetchone()

            if not order_info:
                print(f"订单 {order_number} 不存在或不属于用户 {user_id}")
                return False
            
            if order_info['Order_Status'] != '待处理':
                print(f"订单 {order_number} 状态为 {order_info['Order_Status']}，不能退货。")
                return False

            order_amount = order_info['Order_Amout']

            # 2. 插入退货主信息
            # 注意：这里在 retur_list 表中新增了 Order_Num 字段，如果您的数据库表中没有，需要先添加。
            sql_insert_return = """
                INSERT INTO return_list (Return_Status, Return_Amout, Customer_Num, Order_Num) 
                VALUES (%s, %s, %s, %s)
            """
            cursor.execute(sql_insert_return, ('待处理', order_amount, user_id, order_number))
            return_num = cursor.lastrowid

            # 3. 获取订单明细
            sql_order_details = "SELECT Good_Num, Quantity FROM Order_Detail WHERE Order_Num = %s"
            cursor.execute(sql_order_details, (order_number,))
            order_details = cursor.fetchall()

            # 4. 插入退货明细
            sql_insert_return_detail = """
                INSERT INTO return_detail (Return_Num, Good_Num, Quantity) 
                VALUES (%s, %s, %s)
            """
            for item in order_details:
                cursor.execute(sql_insert_return_detail, (return_num, item['Good_Num'], item['Quantity']))
            
            # 5. 更新原订单状态为“已退货”（可选，根据业务需求）
            sql_update_order_status = "UPDATE Orders SET Order_Status = %s WHERE Order_Num = %s"
            cursor.execute(sql_update_order_status, ('已退货', order_number))

            g.db.commit()
            return True
    except Exception as e:
        print(f"创建退订单失败: {e}")
        g.db.rollback()
        return False