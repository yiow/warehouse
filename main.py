from flask import Flask,render_template
app=Flask(__name__)
@app.route('/')
def home():
    return render_template('login.html')
@app.route('/customer')
def customer():
    return render_template('customer.html')
@app.route('/supplier')
def supplier():
    return render_template('supplier.html')
@app.route('/staff')
def staff():
    return render_template('staff.html')
if __name__=='__main__':
    app.run()