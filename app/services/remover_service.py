import pymysql
from flask import g, jsonify
import datetime # 导入 datetime 模块用于格式化时间
# # 从数据库中获取待处理的出入库通知
def get_pending_tasks():
    # 直接从g对象获取数据库连接
    connection = g.db
    try:
        with connection.cursor(pymysql.cursors.DictCursor) as cursor: # 明确指定DictCursor
            # 假设出入库表名为 'inout_records' 货物表名为 'goods'
            # 注意：请根据你的实际表名替换 'inout_records' 和 'goods'
            # Type 0 代表出库，1 代表入库
            # Status 字段用于表示任务状态，'pending' 表示待处理
            sql = """
                SELECT
                    ir.Good_Num,
                    g.Good_Name,
                    ir.Good_Quantity,
                    ir.Position_Num,
                    ir.Type,
                    ir.TIME
                FROM
                    in_out_warehouse ir
                JOIN
                    goods g ON ir.Good_Num = g.Good_Num
                WHERE
                    ir.Status = 'pending'
                ORDER BY
                    ir.TIME DESC
            """
            cursor.execute(sql)
            result = cursor.fetchall()
            # 格式化时间戳为前端友好的字符串
            for row in result:
                if row['TIME']:
                    row['TIME'] = row['TIME'].strftime('%Y-%m-%d %H:%M:%S')
            return result
    except Exception as e:
        print(f"Error fetching pending tasks: {e}")
        return []

# 从数据库中获取已完成的出入库通知
def get_completed_tasks():
    connection = g.db
    try:
        with connection.cursor(pymysql.cursors.DictCursor) as cursor: # 明确指定DictCursor
            sql = """
                SELECT
                    ir.Good_Num,
                    g.Good_Name,
                    ir.Good_Quantity,
                    ir.Position_Num,
                    ir.Type,
                    ir.TIME
                FROM
                    in_out_warehouse ir
                JOIN
                    goods g ON ir.Good_Num = g.Good_Num
                WHERE
                    ir.Status = 'processed'
                ORDER BY
                    ir.TIME DESC
            """
            cursor.execute(sql)
            result = cursor.fetchall()
            # 格式化时间戳为前端友好的字符串
            for row in result:
                if row['TIME']:
                    row['TIME'] = row['TIME'].strftime('%Y-%m-%d %H:%M:%S')
            return result
    except Exception as e:
        print(f"Error fetching completed tasks: {e}")
        return []

# 更新任务状态
def update_task_status(good_num, status):
    connection = g.db
    try:
        with connection.cursor() as cursor: # 对于更新操作，普通游标即可
            # 更新出入库表中的任务状态
            sql = "UPDATE in_out_warehouse SET Status = %s WHERE Good_Num = %s"
            cursor.execute(sql, (status, good_num))
            connection.commit()
            return True
    except Exception as e:
        print(f"Error updating task status for Good_Num {good_num}: {e}")
        connection.rollback()
        return False