import pymysql
from flask import g,jsonify
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
