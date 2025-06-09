from flask import Blueprint, render_template, request, jsonify, g,session
# 修改开始
from app.services.remover_service import get_pending_tasks, update_task_status, get_completed_tasks
# 修改结束
remover_bp = Blueprint('remover', __name__)

@remover_bp.route('/remover',methods=['GET'])
def customer():
    user_info={
        'username':session['username'],
        'userid':session['user_id']
    }
    return render_template('remover.html',user=user_info)
# 修改开始 - 新增API端点，用于前端通过AJAX获取待处理任务
@remover_bp.route('/get_pending_tasks', methods=['GET'])
def api_get_pending_tasks():
    pending_tasks = get_pending_tasks()
    return jsonify(pending_tasks)
# 修改结束

# 修改开始 - 新增API端点，用于前端通过AJAX确认任务
@remover_bp.route('/confirm_task', methods=['POST'])
def api_confirm_task():
    data = request.get_json()
    # Good_Num 作为任务的唯一标识
    task_good_num = data.get('goodNum')

    if task_good_num is None:
        return jsonify({'status': 'error', 'message': '缺少 Good_Num 参数'}), 400

    if update_task_status(task_good_num, 'processed'): # 将 Good_Num 作为任务ID更新状态为 'completed'
        return jsonify({'status': 'success', 'message': '任务状态更新成功'})
    else:
        return jsonify({'status': 'error', 'message': '任务状态更新失败'}), 500
# 修改结束

# 修改开始 - 新增API端点，用于前端通过AJAX获取已完成任务
@remover_bp.route('/get_completed_tasks', methods=['GET'])
def api_get_completed_tasks():
    completed_tasks = get_completed_tasks()
    return jsonify(completed_tasks)
# 修改结束