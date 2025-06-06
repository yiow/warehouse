from flask import Blueprint, render_template, request, jsonify, g,session

supplier_bp = Blueprint('supplier', __name__)

@supplier_bp.route('/supplier',methods=['GET'])
def customer():
    user_info={
        'username':session['username'],
        'userid':session['user_id']
    }
    return render_template('supplier.html',user=user_info)
