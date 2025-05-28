from flask import Blueprint, render_template, request, jsonify, g

supplier_bp = Blueprint('supplier', __name__)

@supplier_bp.route('/supplier',methods=['GET'])
def customer():
    return render_template('supplier.html')
