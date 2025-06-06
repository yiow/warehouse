import pymysql
from flask import g, jsonify
#从数据库中获取出入库通知
def getinform():
    return 1