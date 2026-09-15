#Importing modules from Packages

from flask import Flask,request,url_for,jsonify
from otp import generate_otp
from cmail import send_mail
from mysql.connector import connection
import os
from dotenv import load_dotenv
load_dotenv()

#Intializing App FLASK
app=Flask(__name__)

mydb=connection.MySQLConnection(
    user=os.getenv('user'),host=os.getenv('host'),
    db=os.getenv('db'),password=os.getenv('dbpassword'))


@app.route('/',methods=['GET'])
def home():
    return jsonify({"status:":"success","message":"Welcome...Buy & Sale"}),200

@app.route('/api/admin/register',methods=['POST'])
def admincreate():
    cursor=None
    try:
        print(request.get_json())
        data=request.get_json()
        if not data:
            return jsonify({"status":"failed","message":"No Input Data given"}),400
        adminname=data.get('username')
        adminemail=data.get('useremail')
        if not adminname or not adminemail:
            return jsonify({"status":"failed","message":"Email And Username Required"})
        adminpassword=data.get('password')
        if len(adminpassword)<6:
            return jsonify({"status":"failed","meassge":"Password is too short"})
        adminaddress=data.get('useraddress')
        if not adminaddress:
            return jsonify({"status":"failed","meassage":"Address is Required"})
        adminagree=data.get('agree')

        #DB Connection
        mydb.ping(reconnect=True)
        cursor=mydb.cursor(buffered=True)
        cursor.execute('select account_status from admin_data where admin_email=%s',[adminemail])
        response=cursor.fetchone()
        if response:
            if response[0]=='active':
                return jsonify({"status":"success","meassage":"User Already Existed"}),200
        #Otp Generating & Sending
        otp=generate_otp()
        subject="Admin Registaration For ecommerce"
        body=f"Use given Otp for Verification ,{otp}"
        send_mail(subject=subject,to=adminemail,body=body)
        return jsonify({"status":"success","message":"Email Has been Sent successfully"}),200
    except Exception as e:
        print("Error:",e)
        return jsonify({"status":"Failed","message":f"{str(e)}"}),500



@app.route('/api/admin/otp',methods=['POST'])
def otpverify():
    pass


if __name__=="__main__":
    app.run(use_reloader=True,debug=True)
