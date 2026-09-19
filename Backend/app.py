#Importing modules from Packages

from flask import Flask,request,url_for,jsonify,session
from flask_session import Session
from otp import generate_otp
from cmail import send_mail
from mysql.connector import connection
from flask_bcrypt import Bcrypt
from werkzeug.utils import secure_filename #It Remooves Unsafes characters from filename

import os
import datetime
from dotenv import load_dotenv
load_dotenv()

#Finding path if present else creating folders
base_dir=os.path.dirname(os.path.abspath('__file__'))
upload_folder_path=os.path.join(base_dir,'static','uploads')
os.makedirs(upload_folder_path,exist_ok=True)

#Intializing App FLASK
app=Flask(__name__)

#Creating Object for bcrypt
bcrypt=Bcrypt(app)

#Creating session type where the session can be stored
app.config['SESSION_TYPE']='filesystem'

#Session Life Time Needed
app.config['SESSION_SESSION_LIFETIME']=datetime.timedelta(days=7)

#Cross-Origin Cookie Security Configuration
#"Lax" or "None" is required for react & flask are on differenet domains/ports
app.config['SESSION_COOKIE_SAMESITE']='None'

#Protect against XSS Attacks (prevents Js from reading the cookeie)
app.config['SESSION_COOKIE_HTTPONLY']=True

#Required If Session_cookie_samesit is set to be 'None' (requires HTTPs)
app.config['SESSION_COOKIE_SECURE']=False

#Intergrating Session with flask app
Session(app)

#Making That extension which file can stored in Files-Images
Allowed_extensions={"jpg","jpeg","png","gif","webp"}
max_length=6*1024*1021 #6 MB

app.config['UPLOAD_FOLDER']=upload_folder_path
app.config['ALLOWED_EXTENSION']=Allowed_extensions
app.config['MAX_LENGTH']=max_length

#DB CONNECTION
mydb=connection.MySQLConnection(
    user=os.getenv('user'),host=os.getenv('host'),
    db=os.getenv('db'),password=os.getenv('dbpassword'))

@app.route('/',methods=['GET'])
def home():
    return jsonify({"status:":"success","message":"Welcome...Buy & Sale"}),200


#---------------------------------------------------------------------------------------------
#---------------------------------ADMIN PANEL-------------------------------------------------
#---------------------------------------------------------------------------------------------

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
        hash_password=bcrypt.generate_password_hash(adminpassword).decode('utf-8')
        adminaddress=data.get('useraddress')
        if not adminaddress:
            return jsonify({"status":"failed","meassage":"Address is Required"})
        adminagree=data.get('agree','off')

        #DB Connection
        mydb.ping(reconnect=True)
        cursor=mydb.cursor(buffered=True)
        cursor.execute('select account_status from admindata where admin_email=%s',[adminemail])
        response=cursor.fetchone()
        otp=generate_otp()
        otp_expiry_time=datetime.datetime.now()+datetime.timedelta(minutes=5)
        if response:
            if response[0]=='active':
                return jsonify({"status":"success","meassage":"User Already Existed"}),200
            elif response[0]=='inactive':
                cursor.execute('update admindata set otp=%s,otp_expiry_time=%s where admin_email=%s',[otp,otp_expiry_time,adminemail])
                mydb.commit()
            elif response[0]=='suspended':
                return jsonify({"status":"success","meassage":"User Already Existed"}),200
        else:
            cursor.execute('insert into admindata (adminid,admin_name,admin_email,admin_address,admin_password,admin_agree,otp,otp_expiry_time,account_status) values(uuid_to_bin(uuid()),%s,%s,%s,%s,%s,%s,%s,%s)',[adminname,adminemail,adminaddress,hash_password,adminagree,otp,otp_expiry_time,'inactive'])
            mydb.commit()
        #Otp Generating & Sending
        subject="Admin Registaration For ecommerce"
        body=f"Use given Otp for Verification ,{otp}"
        send_mail(subject=subject,to=adminemail,body=body)
        if cursor:
            cursor.close()
        return jsonify({"status":"success","message":"Email Has been Sent successfully"}),200
    except Exception as e:
        print("Error:",e)
        return jsonify({"status":"Failed","message":f"{str(e)}"}),500
    
@app.route('/api/admin/otpverify',methods=['POST'])
def admin_otpverify():
    cursor=None
    try:
        data=request.get_json()
        if not data:
            return jsonify({"status":"failed","message":"No Input Data given"}),400
        user_otp=data.get('otp')
        user_email=data.get('email')
        user_otp_time=datetime.datetime.now()
        if not user_otp:
            return jsonify({"status":"failed","message":"OTP Must Needed TO Verify"}),400
        if not user_email:
            return jsonify({"status":"failed","message":"Email Required To Verify"}),400
        mydb.ping(reconnect=True)
        cursor=mydb.cursor(buffered=True)
        cursor.execute('select account_status from admindata where admin_email=%s',[user_email])
        response=cursor.fetchone()
        if response:
            if response[0]=='active':
                return jsonify({"status":"success","meassage":"User Already verified"}),200
            elif response[0]=='inactive':
                cursor.execute('select otp,otp_expiry_time from admindata where admin_email=%s',[user_email])
                mysql_response=cursor.fetchone()
                if user_otp_time>mysql_response[1]:
                    return jsonify({"status":"failed","meassage":"otp expired"}),400
                else:
                    if mysql_response[0]==user_otp:
                        cursor.execute('update admindata set otp=null,otp_expiry_time=null,account_status="active" where admin_email=%s',[user_email])
                        mydb.commit()
                        return jsonify({"status":"success","meassage":"OTP Verifeed successfully"}),200
                    else:
                        return jsonify({"status":"failed","message":"Otp Incorrect"}),400
            elif response[0]=='suspended':
                return jsonify({"status":"success","meassage":"User Susspended"}),400
        else:
            return jsonify({"status":"failed","meassage":"User Not Found"}),400

    except Exception as e:
        print("Error:",e)
        return jsonify({"status":"Failed","message":f"{str(e)}"}),500
    finally:
        if cursor:
            cursor.close()

@app.route('/api/admin/login',methods=['POST'])
def adminlogin():
    cursor=None
    try:
        data=request.get_json()
        if not data:
            return jsonify({"status":"failed","message":"No Input Data given"}),400
        user_email=data.get('email')
        user_password=data.get('password')
        if not user_email:
            return jsonify({"status":"failed","message":"Email Must be Present"}),400
        if not user_password:
            return jsonify({"status":"failed","message":"Password Must be Present"}),400
        mydb.ping(reconnect=True)
        cursor=mydb.cursor(buffered=True)
        cursor.execute('select account_status from admindata where admin_email=%s',[user_email])
        response=cursor.fetchone()
        if not response:
            return jsonify({"status":"failed","message":"User Not Found"}),400
        if response[0]=='inactive':
            return jsonify({"status":"failed","message":"User have to be Verified Register Again"}),400
        if response[0]=='suspended':
            return jsonify({"status":"failed","message":"Account Suspended"}),400
        if response[0]=='active':
            cursor.execute('select admin_password,bin_to_uuid(adminid) from admindata where admin_email=%s',[user_email])
            db_response=cursor.fetchone()
            if bcrypt.check_password_hash(db_response[0],user_password):
                session['adminid']=db_response[1]
                session['admin_email']=user_email
                session.permanent=True
                return jsonify({"status":"success","message":"Login SuccessFull",
                                "admin":{"adminid":session['adminid'],"adminemail":session['admin_email']}
                                }),200
            else:
                return jsonify({"status":"failed","message":"Email or Password Incorrect"}),400
    except Exception as e:
        print("Error:",e)
        return jsonify({"status":"Failed","message":f"{str(e)}"}),500
    finally:
           if cursor:
               cursor.close()

@app.route('/api/admin/dashboard',methods=['GET'])
def admindashboard():
    if not session.get('adminid'):
        return jsonify({"status":"failed","message":"Admin have to Login TO Access The dashboard"}),400
    return jsonify({"status":"Success","message":"Welcome to Admin Dashboard"}),200

@app.route('/api/admin/logout',methods=['GET'])
def adminlogout():
    if not session.get('adminid'):
        return jsonify({"status":"failed","message":"Login TO LOGOUT"}),400
    session.pop('adminid')
    session.pop('admin_email')
    session.modified=True
    return jsonify({"status":"Success","message":"Logout SuccessFull"}),200

def allowed_extensions(filename:str)->bool:
    return '.' in filename and filename.rsplit('.',-1)[-1] in app.config['ALLOWED_EXTENSION']

@app.route('/api/admin/additem',methods=['POST'])
def additem():
    cursor=None
    try:
        if not session.get('adminid'):
            return jsonify({"status":"failed","message":"Admin have to Login TO Add Item"}),400
        data=request.form
        print(data)
        if not data:
            return jsonify({"status":"failed","message":"Data Must Be Send"}),400
        item_name=data.get('title')
        if not item_name:
            return jsonify({"status":"failed","message":"Item must be Required"}),400
        item_description=data.get('Description')
        item_about=data.get('About_item')
        item_quantity=data.get('quantity',0)
        item_price=data.get('price')
        if not item_price :
            return jsonify({"status":"failed","message":"Item must be Required"}),400
        try:
            item_price=float(item_price)
            item_quantity=int(item_quantity)
        except ValueError:
            return jsonify({"status":"failed","message":"Invalid type of price or Quantity"})
        item_category=data.get('category','home_appliences')
        item_filedata=request.files.get('file')
        if not item_filedata:
            return jsonify({"status":"failed","message":"Image Requreid"})
        if not item_filedata.mimetype.startswith('image/'):
            return jsonify({"status":"failed","message":"Image Type Required"})

        item_filename=item_filedata.filename
        if not allowed_extensions(item_filename):
            return jsonify({"status":"failed","messagee":"File Extension Inavlid"}),400
        sec_filename=secure_filename(item_filename)
        ext=os.path.splitext(sec_filename)[1]
        new_filename=generate_otp()+" "+sec_filename+ext
        save_path=os.path.join(app.config['UPLOAD_FOLDER'],new_filename)
        if save_path:
            item_filedata.save(save_path)
        return jsonify({"status":"success","message":"data accepted"}),200
    except Exception as e:
        print("Error:",e)
        return jsonify({"status":"Failed","message":f"{str(e)}"}),500
    finally:
        if cursor:
            cursor.close()

#---------------------------------------------------------------------------------------------
#----------------------------------USER PANEL-------------------------------------------------
#---------------------------------------------------------------------------------------------

@app.route('/api/user/register',methods=['POST'])
def userregister():
    cursor=None
    try:
        print(request.get_json())
        data=request.get_json()
        if not data:
            return jsonify({"status":"failed","message":"No Input Data given"}),400
        username=data.get('username')
        useremail=data.get('useremail')
        if not username or not useremail:
            return jsonify({"status":"failed","message":"Email And Username Required"})
        userpassword=data.get('userpassword')
        if len(userpassword)<6:
            return jsonify({"status":"failed","meassge":"Password is too short"})
        hash_password=bcrypt.generate_password_hash(userpassword).decode('utf-8')
        useraddress=data.get('useraddress')
        if not useraddress:
            return jsonify({"status":"failed","meassage":"Address is Required"})
        userphone=data.get('userphone')
        if not userphone:
            return jsonify({"status":"failed","meassage":"Phone is Required"})
        useragree=data.get('useragree','off')
        usergender=data.get('usergender','male')

        #DB Connection
        mydb.ping(reconnect=True)
        cursor=mydb.cursor(buffered=True)
        cursor.execute('select account_status from userdata where useremail=%s',[useremail])
        response=cursor.fetchone()
        otp=generate_otp()
        otp_expiry_time=datetime.datetime.now()+datetime.timedelta(minutes=5)
        if response:
            if response[0]=='active':
                return jsonify({"status":"success","meassage":"User Already Existed"}),200
            elif response[0]=='inactive':
                cursor.execute('update userdata set otp=%s,otp_expiry_time=%s where useremail=%s',[otp,otp_expiry_time,useremail])
                mydb.commit()
            elif response[0]=='suspended':
                return jsonify({"status":"success","meassage":"User Already Existed"}),200
        else:
            cursor.execute('insert into userdata(userid,username,useremail,useraddress,userpassword,userphone,usergender,useragree,otp,otp_expiry_time,account_status) values(uuid_to_bin(uuid()),%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)',[username,useremail,useraddress,hash_password,userphone,usergender,useragree,otp,otp_expiry_time,'inactive'])
            mydb.commit()
        #Otp Generating & Sending
        subject="Admin Registaration For ecommerce"
        body=f"Use given Otp for Verification ,{otp}"
        send_mail(subject=subject,to=useremail,body=body)
        if cursor:
            cursor.close()
        return jsonify({"status":"success","message":"Email Has been Sent successfully"}),200
    except Exception as e:
        print("Error:",e)
        return jsonify({"status":"Failed","message":f"{str(e)}"}),500

@app.route('/api/user/otpverify',methods=['POST'])
def user_otpverify():
    cursor=None
    try:
        data=request.get_json()
        if not data:
            return jsonify({"status":"failed","message":"No Input Data given"}),400
        user_otp=data.get('otp')
        user_email=data.get('email')
        user_otp_time=datetime.datetime.now()
        if not user_otp:
            return jsonify({"status":"failed","message":"OTP Must Needed TO Verify"}),400
        if not user_email:
            return jsonify({"status":"failed","message":"Email Required To Verify"}),400
        mydb.ping(reconnect=True)
        cursor=mydb.cursor(buffered=True)
        cursor.execute('select account_status from userdata where useremail=%s',[user_email])
        response=cursor.fetchone()
        if response:
            if response[0]=='active':
                return jsonify({"status":"success","meassage":"User Already verified"}),200
            elif response[0]=='inactive':
                cursor.execute('select otp,otp_expiry_time from userdata where useremail=%s',[user_email])
                mysql_response=cursor.fetchone()
                if user_otp_time>mysql_response[1]:
                    return jsonify({"status":"failed","meassage":"otp expired"}),400
                else:
                    if mysql_response[0]==user_otp:
                        cursor.execute('update userdata set otp=null,otp_expiry_time=null,account_status="active" where useremail=%s',[user_email])
                        mydb.commit()
                        return jsonify({"status":"success","meassage":"OTP Verifed successfully"}),200
                    else:
                        return jsonify({"status":"failed","message":"Otp Incorrect"}),400
            elif response[0]=='suspended':
                return jsonify({"status":"success","meassage":"User Susspended"}),400
        else:
            return jsonify({"status":"failed","meassage":"User Not Found"}),400

    except Exception as e:
        print("Error:",e)
        return jsonify({"status":"Failed","message":f"{str(e)}"}),500
    finally:
        if cursor:
            cursor.close()

@app.route('/api/user/login',methods=['POST'])
def userlogin():
    cursor=None
    try:
        data=request.get_json()
        if not data:
            return jsonify({"status":"failed","message":"No Input Data given"}),400
        user_email=data.get('email')
        user_password=data.get('password')
        if not user_email:
            return jsonify({"status":"failed","message":"Email Must be Present"}),400
        if not user_password:
            return jsonify({"status":"failed","message":"Password Must be Present"}),400
        mydb.ping(reconnect=True)
        cursor=mydb.cursor(buffered=True)
        cursor.execute('select account_status from userdata where useremail=%s',[user_email])
        response=cursor.fetchone()
        if not response:
            return jsonify({"status":"failed","message":"User Not Found"}),400
        if response[0]=='inactive':
            return jsonify({"status":"failed","message":"User have to be Verified Register Again"}),400
        if response[0]=='suspended':
            return jsonify({"status":"failed","message":"Account Suspended"}),400
        if response[0]=='active':
            cursor.execute('select userpassword,bin_to_uuid(userid) from userdata where useremail=%s',[user_email])
            db_response=cursor.fetchone()
            if bcrypt.check_password_hash(db_response[0],user_password):
                session['userid']=db_response[1]
                session['user_email']=user_email
                session.permanent=True
                return jsonify({"status":"success","message":"Login SuccessFull",
                                "admin":{"adminid":session['userid'],"adminemail":session['user_email']}
                                }),200
            else:
                return jsonify({"status":"failed","message":"Email or Password Incorrect"}),400
    except Exception as e:
        print("Error:",e)
        return jsonify({"status":"Failed","message":f"{str(e)}"}),500
    finally:
           if cursor:
               cursor.close()

@app.route('/api/user/dashboard',methods=['GET'])
def userdashboard():
    if not session.get('userid'):
        return jsonify({"status":"failed","message":"User have to Login TO Access The dashboard"}),400
    return jsonify({"status":"Success","message":"Welcome to User Dashboard"}),200

@app.route('/api/user/logout',methods=['GET'])
def userlogout():
    if not session.get('userid'):
        return jsonify({"status":"failed","message":"Login TO LOGOUT"}),400
    session.pop('userid')
    session.pop('user_email')
    session.modified=True
    return jsonify({"status":"Success","message":"Logout SuccessFull"}),200


#App Run
if __name__=="__main__":
    app.run(use_reloader=True,debug=True)
