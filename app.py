from flask import Flask,render_template,request,jsonify,redirect,url_for,g
import pymysql

app=Flask(__name__)
def get_db_connection():
    return pymysql.connect(
        host='10.150.95.227',
        user='root',
        password='root',
        port=3306,
        database='warehousemanagementsystem',
        cursorclass=pymysql.cursors.DictCursor)
#管理数据库连接的生命周期
@app.before_request
def before_request():
    g.db=get_db_connection()
@app.teardown_request
def teardown_request(exception):
    db=getattr(g,'db',None)
    if db is not None:
        db.close()

@app.route('/login',methods=['GET'])
def show_login():
    return render_template('login.html')
@app.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    userType = data.get('userType')
    username = data.get('username')
    password = data.get('password')
    try:
        with g.db.cursor() as cursor:
            if userType=='customer':
                sql = "SELECT Password FROM customers WHERE Customer_UserName=%s"
            if userType=='supplier':
                sql = "SELECT Password FROM suppliers WHERE Supplier_UserName=%s"
            if userType=='staff':
                sql = "SELECT Password FROM staff WHERE Staff_Name=%s"
            cursor.execute(sql, (username,))  
            user = cursor.fetchone()
            if user:
                if password == user['Password']:
                    return jsonify({'success': True, 'message': '登陆成功'})
                else:
                    return jsonify({'success': False, 'message': '密码错误'}), 401
            else:
                return jsonify({'success': False, 'message': '用户名不存在'}), 404  
    except pymysql.Error as e:
        return jsonify({'success': False, 'message': f'数据库错误：{str(e)}'}), 500
    
@app.route('/register',methods=['GET'])
def show_register():
    return render_template('register.html')
@app.route('/register',methods=['POST'])
def register():
    data=request.get_json()
    userType=data.get('userType')
    username=data.get('username')
    phone=data.get('phone')
    password=data.get('password')
    try:
        with g.db.cursor() as cursor:
            if userType=='customer':
                check_sql="SELECT 1 FROM customers WHERE Customer_UserName=%s"
                insert_sql="INSERT customers(Customer_UserName,Customer_Phone,Password) VALUES(%s,%s,%s)"
            if userType=='supplier':
                check_sql="SELECT 1 FROM supplier WHERE Supplier_UserName=%s"
                insert_sql="INSERT suppliers(Supplier_UserName,Supplier_Phone,Password) VALUES(%s,%s,%s)"
            cursor.execute(check_sql,(username,))
            if cursor.fetchone():
                return jsonify({'success':False,'message':'用户名重复'}),409
            cursor.execute(insert_sql,(username,phone,password))
            g.db.commit()
            return jsonify({'success':True})
    except pymysql.Error as e:
        return jsonify({'success': False, 'message': f'数据库错误：{str(e)}'}), 500

@app.route('/customer/dashboard')
def customer():
    return render_template('customer.html')
@app.route('/supplier/dashboard')
def supplier():
    return render_template('supplier.html')
@app.route('/staff/dashboard')
def staff():
    return render_template('staff.html')
if __name__=='__main__':
    app.run()