from flask import Blueprint, render_template, request, jsonify, g,session
# 修改开始
from app.services.remover_service import getinform
# 修改结束
remover_bp = Blueprint('remover', __name__)

@remover_bp.route('/remover',methods=['GET'])
def customer():
    user_info={
        'username':session['username'],
        'userid':session['user_id']
    }
    return render_template('remover.html',user=user_info)