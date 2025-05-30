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
