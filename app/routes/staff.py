from flask import Blueprint, render_template, request, jsonify, g

staff_bp = Blueprint('staff', __name__)

@staff_bp.route('/staff',methods=['GET'])
def customer():
    return render_template('staff.html')
