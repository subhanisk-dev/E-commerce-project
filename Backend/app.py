#Importing modules from Packages

from flask import Flask,request,url_for,jsonify,session
from flask_session import Session
from otp import generate_otp
from cmail import send_mail
from mysql.connector import connection
from flask_bcrypt import Bcrypt
from werkzeug.utils import secure_filename #It Remooves Unsafes characters from filename
from flask_cors import CORS


import os
import datetime
from dotenv import load_dotenv
load_dotenv()

#Finding path if present else creating folders
base_dir=os.path.dirname(os.path.abspath(__file__))
upload_folder_path=os.path.join(base_dir,'static','uploads')
os.makedirs(upload_folder_path,exist_ok=True)

#Intializing App FLASK
app=Flask(__name__)

#Creating Object for bcrypt
bcrypt=Bcrypt(app)

#Intergertaing CORS With App
CORS(app,origins=["http://localhost:5173","http://127.0.0.1:5173"],supports_credentials=True)
#Configuring Secure Key
app.config['SECRET_KEY']=os.getenv('SECRET_KEY','EcommerceSecretkey123') 

#Creating session type where the session can be stored
app.config['SESSION_TYPE']='filesystem'

#Session Life Time Needed
app.config['PERMANENT_SESSION_LIFETIME']=datetime.timedelta(days=7)

#Cross-Origin Cookie Security Configuration
#"Lax" or "None" is required for react & flask are on differenet domains/ports
app.config['SESSION_COOKIE_SAMESITE']='lax'

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
app.config['MAX_CONTENT_LENGTH']=max_length

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
        adminpassword=data.get('userpassword')
        adminaddress=data.get('useraddress')
        adminagree=data.get('useragree','off')

        if not adminname or not adminemail:
            return jsonify({"status":"failed","message":"Email And Username Required"}),400
        if not adminpassword:
            return jsonify({"status":"failed","message":"Password is Required"}),400
        if len(adminpassword)<6:
            return jsonify({"status":"failed","meassge":"Password is too short"}),400
        hash_password=bcrypt.generate_password_hash(adminpassword).decode('utf-8')
        if not adminaddress:
            return jsonify({"status":"failed","meassage":"Address is Required"}),400

        #DB Connection
        mydb.ping(reconnect=True)
        cursor=mydb.cursor(buffered=True)
        cursor.execute('select account_status from admindata where admin_email=%s',[adminemail])
        response=cursor.fetchone()
        otp=generate_otp()
        otp_expiry_time=datetime.datetime.now()+datetime.timedelta(minutes=5)
        if response:
            if response[0]=='active':
                return jsonify({"status":"failed","message":"User Already Existed"}),409
            elif response[0]=='inactive':
                cursor.execute('update admindata set otp=%s,otp_expiry_time=%s where admin_email=%s',[otp,otp_expiry_time,adminemail])
                mydb.commit()
            elif response[0]=='suspended':
                return jsonify({"status":"failed","meassage":"User Account is Suspended"}),403
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
    
@app.route('/api/admin/verify-otp',methods=['POST'])
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
                return jsonify({"status":"success","message":"User Already verified"}),200
            elif response[0]=='inactive':
                cursor.execute('select otp,otp_expiry_time from admindata where admin_email=%s',[user_email])
                mysql_response=cursor.fetchone()
                if not mysql_response:
                    return jsonify({"status":"failed","message":"OTP information not found"}),400
                if not mysql_response[1]:
                    return jsonify({"status":"failed","message":"OTP expired"}),400
                if user_otp_time>mysql_response[1]:
                    return jsonify({"status":"failed","message":"otp expired"}),400
                else:
                    if mysql_response[0]==user_otp:
                        cursor.execute('update admindata set otp=null,otp_expiry_time=null,account_status="active" where admin_email=%s',[user_email])
                        mydb.commit()
                        return jsonify({"status":"success","message":"OTP Verifeed successfully"}),200
                    else:
                        return jsonify({"status":"failed","message":"Otp Incorrect"}),400
            elif response[0]=='suspended':
                return jsonify({"status":"success","message":"User Susspended"}),403
        else:
            return jsonify({"status":"failed","message":"User Not Found"}),404

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
            return jsonify({"status":"failed","message":"User Not Found"}),404
        if response[0]=='inactive':
            return jsonify({"status":"failed","message":"User have to be Verified Register Again"}),403
        if response[0]=='suspended':
            return jsonify({"status":"failed","message":"Account Suspended"}),403
        if response[0]=='active':
            cursor.execute('select admin_password,bin_to_uuid(adminid),admin_name from admindata where admin_email=%s',[user_email])
            db_response=cursor.fetchone()
            if bcrypt.check_password_hash(db_response[0],user_password):
                session['adminid']=db_response[1]
                session['admin_email']=user_email
                session.permanent=True
                return jsonify({"status":"success","message":"Login SuccessFull",
                                "admin":{"adminid":session['adminid'],"adminemail":session['admin_email'],"adminname":db_response[2]}
                                }),200
            else:
                return jsonify({"status":"failed","message":"Email or Password Incorrect"}),401
    except Exception as e:
        print("Error:",e)
        return jsonify({"status":"Failed","message":f"{str(e)}"}),500
    finally:
           if cursor:
               cursor.close()

@app.route('/api/admin/dashboard',methods=['GET'])
def admindashboard():
    if not session.get('adminid'):
        return jsonify({"status":"failed","message":"Admin have to Login TO Access The dashboard"}),401
    return jsonify({"status":"Success","message":"Welcome to Admin Dashboard"}),200

@app.route('/api/admin/logout',methods=['GET','POST'])
def adminlogout():
    if not session.get('adminid'):
        return jsonify({"status":"failed","message":"Login TO LOGOUT"}),401
    session.pop('adminid')
    session.pop('admin_email')
    session.modified=True
    return jsonify({"status":"Success","message":"Logout SuccessFull"}),200

def allowed_extensions(filename:str)->bool:
    return '.' in filename and filename.rsplit('.',-1)[-1] in app.config['ALLOWED_EXTENSION']

@app.route('/api/admin/add-item',methods=['POST'])
def additem():
    cursor=None
    try:
        if not session.get('adminid'):
            return jsonify({"status":"failed","message":"Admin have to Login TO Add Item"}),401
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
            return jsonify({"status":"failed","message":"Invalid type of price or Quantity"}),400
        item_category=data.get('category','home_appliences')
        item_filedata=request.files.get('file')
        if not item_filedata:
            return jsonify({"status":"failed","message":"Image Requreid"}),400
        if not item_filedata.mimetype.startswith('image/'):
            return jsonify({"status":"failed","message":"Image Type Required"}),400

        item_filename=item_filedata.filename
        if not allowed_extensions(item_filename):
            return jsonify({"status":"failed","message":"File Extension Inavlid"}),400
        sec_filename=secure_filename(item_filename)
        ext=os.path.splitext(sec_filename)[1]
        new_filename=generate_otp()+ext
        save_path=os.path.join(app.config['UPLOAD_FOLDER'],new_filename)
        
        mydb.ping(reconnect=True)
        cursor=mydb.cursor(buffered=True)
        cursor.execute('insert into items(itemid,item_name,item_descrption,item_about,item_price,item_stock,item_category,item_image,adminid) values (uuid_to_bin(uuid()),%s,%s,%s,%s,%s,%s,%s,uuid_to_bin(%s))',[item_name,item_description,item_about,item_price,item_quantity,item_category,new_filename,session.get('adminid')])
        item_filedata.save(save_path)
        mydb.commit()
        return jsonify({"status":"success","message":"data accepted"}),200
    
    except Exception as e:
        mydb.rollback()
        print("Error:",e)
        return jsonify({"status":"Failed","message":f"{str(e)}"}),500
    finally:
        if cursor:
            cursor.close()

@app.route('/api/admin/items',methods=['GET'])
def viewallitems():
    cursor=None
    try:
        adminid=session.get('adminid')
        if not adminid:
            return jsonify({"status":"failed","message":"Admin have to Login TO Add Item"}),401
        mydb.ping(reconnect=True)
        cursor=mydb.cursor(buffered=True)
        cursor.execute('select bin_to_uuid(itemid),item_name,item_descrption,item_about,item_price,item_stock,item_category,item_image from items where adminid=uuid_to_bin(%s)',[adminid])
        items_data=cursor.fetchall()
        if not items_data:
            return jsonify({"status":"failed","message":"Pls Add item to view"}),404
        products=[]
        for item in items_data:
            products.append({'itemid':item[0],'itemname':item[1],'item_desc':item[2],'item_about':item[3],
                             'price':item[4],'quantity':item[5],'category':item[6],
                             'image':url_for('static',filename=f"uploads/{item[7]}",_external=True)
                             })
        return jsonify({"status":"success","message":"Successfully fetched all items",'products':products}),200
    except Exception as e:
        mydb.rollback()
        print("Error:",e)
        return jsonify({"status":"Failed","message":f"{str(e)}"}),500
    finally:
        if cursor:
            cursor.close()

@app.route('/api/admin/item/<id>',methods=['GET'])
def viewitems(id):
    itemid=id
    cursor=None
    try:
        adminid=session.get('adminid')
        if not adminid:
            return jsonify({"status":"failed","message":"Admin have to Login TO Add Item"}),401
        mydb.ping(reconnect=True)
        cursor=mydb.cursor(buffered=True)
        cursor.execute('select item_name,item_descrption,item_about,item_price,item_stock,item_category,item_image from items where adminid=uuid_to_bin(%s) and itemid=uuid_to_bin(%s)',[adminid,itemid])
        items_data=cursor.fetchone()
        if not items_data:
            return jsonify({"status":"failed","message":"Pls Add item to view"}),404

        product={'itemname':items_data[0],'item_desc':items_data[1],
                         'item_about':items_data[2],'price':items_data[3],
                         'quantity':items_data[4],'category':items_data[5],
                         'image':url_for('static',filename=f"uploads/{items_data[6]}",_external=True)
                             }
        return jsonify({"status":"success","message":"Successfully fetched all items",'product':product}),200
    except Exception as e:
        mydb.rollback()
        print("Error:",e)
        return jsonify({"status":"Failed","message":f"{str(e)}"}),500
    finally:
        if cursor:
            cursor.close()

@app.route('/api/admin/delete-item/<id>',methods=['DELETE'])
def deleteitem(id):
    itemid=id
    cursor=None
    try:
        adminid=session.get('adminid')
        if not adminid:
            return jsonify({"status":"failed","message":"Admin have to Login TO Add Item"}),401
        mydb.ping(reconnect=True)
        cursor=mydb.cursor(buffered=True)
        cursor.execute('select item_image from items where adminid=uuid_to_bin(%s) and itemid=uuid_to_bin(%s)',[adminid,itemid])
        item_data=cursor.fetchone()
        if not item_data:
            return jsonify({"status":"failed","message":"Item Not Found"}),404
        remove_path=os.path.join(app.config['UPLOAD_FOLDER'],item_data[0])
        cursor.execute('delete from items where adminid=uuid_to_bin(%s) and itemid=uuid_to_bin(%s)',
                       [adminid,itemid] )
        mydb.commit()
        if os.path.exists(remove_path):
            try:
                os.remove(remove_path)
            except OSError as e:
                print("Error",e)
                return jsonify({"status":"failed","message":f"str(e)"}),404
        return jsonify({"status":"success","message":"Deleted Successfully",}),200
    except Exception as e:
        mydb.rollback()
        print("Error:",e)
        return jsonify({"status":"Failed","message":f"{str(e)}"}),500
    finally:
        if cursor:
            cursor.close()

@app.route('/api/admin/update-item/<id>',methods=['PUT'])
def updateitem(id):
    itemid=id
    cursor=None
    try:
        adminid=session.get('adminid')
        if not adminid:
            return jsonify({"status":"failed","message":"Pls Login First"}),401
        mydb.ping(reconnect=True)
        cursor=mydb.cursor(buffered=True)
        cursor.execute('select bin_to_uuid(itemid),item_name,item_descrption,item_about,item_price,item_stock,item_category,item_image from items where adminid=uuid_to_bin(%s) and itemid=uuid_to_bin(%s)',[adminid,itemid])
        item_data=cursor.fetchone()
        if not item_data:
            return jsonify({"status":"failed","message":"Item Not Found"}),404

        #Accepting Data From User
        data=request.form
        print(data) #ductionary fromat
        if not data:
            return jsonify({"status":"failed","message":"Data Must Be Send"}),400
        update_item_name=data.get('title')
        if not update_item_name:
            return jsonify({"status":"failed","message":"Item must be Required"}),400
        update_item_description=data.get('Description')
        update_item_about=data.get('About_item')
        update_item_quantity=data.get('quantity',0)
        update_item_price=data.get('price')
        if not update_item_price:
            return jsonify({"status":"failed","message":"Item Price must be Required"}),400
        try:
            update_item_price=float(update_item_price)
            update_item_quantity=int(update_item_quantity)
        except ValueError:
            return jsonify({"status":"failed","message":"Invalid type of price or Quantity"}),400
        update_item_category=data.get('category','home_appliences')
        filename=item_data[7]
        old_image=item_data[7]

        updateditem_filedata=request.files.get('file')
        print(updateditem_filedata)
        if updateditem_filedata:
            if not  updateditem_filedata.mimetype.startswith('image/'):
                return jsonify({"status":"failed","message":"file type is invalid"}),400
            updateditem_filename=updateditem_filedata.filename
            if not allowed_extensions(updateditem_filename):
                return jsonify({"status":"failed","message":"file extension invalid"}),400
            sec_filename=secure_filename(updateditem_filename) #'anusharesume.txt'
            ext=os.path.splitext(sec_filename)[1]
            filename=generate_otp()+ext #'F6bD7m.jpg'
            save_path=os.path.join(app.config['UPLOAD_FOLDER'],filename)
            try:
                updateditem_filedata.save(save_path)    
            except Exception as e:
                return jsonify({"status":"failed","message":f"{str(e)}"}),400
        cursor.execute('update items set item_name=%s,item_descrption=%s,item_about=%s,item_price=%s,item_stock=%s,item_category=%s,item_image=%s where adminid=uuid_to_bin(%s) and itemid=uuid_to_bin(%s)',[update_item_name,update_item_description,update_item_about,update_item_price,update_item_quantity,update_item_category,filename,adminid,itemid])
        mydb.commit()
        old_image_path=os.path.join(app.config['UPLOAD_FOLDER'],old_image)
        if updateditem_filedata and os.path.exists(old_image_path):
            if old_image_path:
                os.remove(old_image_path)
        return jsonify({"status":"success","message":"item updated successfully"}),200
    except Exception as e:
        mydb.rollback()
        print("Error:",e)
        return jsonify({"status":"Failed","message":f"{str(e)}"}),500
    finally:
        if cursor:
            cursor.close()

@app.route('/api/admin/profile',methods=['PUT'])
def adminprofileupdate():
    cursor=None
    try:
        adminid=session.get('adminid')
        adminemail=session.get('admin_email')
        if not adminid:
            return jsonify({"status":"failed","message":"Admin Have to login To update"}),401
        mydb.ping(reconnect=True)
        cursor=mydb.cursor(buffered=True)
        cursor.execute('select account_status,bin_to_uuid(adminid),admin_name,admin_email,admin_address,admin_password,admin_agree,admin_image from admindata where adminid=uuid_to_bin(%s)',[adminid])
        admindata=cursor.fetchone()
        if not admindata:
            return jsonify({"status":"failed","message":"Admin Not Found"}),404
        if admindata[0] in ['inactive','suspended']:
            return jsonify({"status":"failed","message":"User Is either INACTIVE or SUSPENDED"}),400
        print(request.form)
        data=request.form
        if not data:
            return jsonify({"status":"failed","message":"No Input Data given"}),400
        update_adminid=data.get('id')
        if update_adminid:
            return jsonify({"status":"failed","message":"admin Id cannot be changed"}),400
        update_adminname=data.get('username')
        if not update_adminname:
            return jsonify({"status":"failed","message":"Email And Username Required"}),400
        update_adminemail=data.get('useremail')
        if update_adminemail:
            return jsonify({"status":"failed","message":"Email address Cannot Be changed"}),400

        adminpassword=admindata[5]
        update_adminpassword=data.get('password')
        if update_adminpassword:
            if len(update_adminpassword)<6:
                return jsonify({"status":"failed","meassge":"Password is too short"}),400
            hash_password=bcrypt.generate_password_hash(update_adminpassword).decode('utf-8')
            adminpassword=hash_password

        update_adminaddress=data.get('useraddress')
        if not update_adminaddress:
            return jsonify({"status":"failed","meassage":"Address is Required"}),400
        update_adminagree=data.get('agree','off')

        old_adminimage=admindata[7]
        adminimage=admindata[7]
        admin_filedata=request.files.get('file')
        print(admin_filedata)
        if admin_filedata:
            if not  admin_filedata.mimetype.startswith('image/'):
                return jsonify({"status":"failed","message":"file type is invalid"}),400
            admin_filename=admin_filedata.filename
            if not allowed_extensions(admin_filename):
                return jsonify({"status":"failed","message":"file extension invalid"}),400
            sec_filename=secure_filename(admin_filename) #'anusharesume.txt'
            ext=os.path.splitext(sec_filename)[1]
            adminimage=generate_otp()+ext #'F6bD7m.jpg'
            save_path=os.path.join(app.config['UPLOAD_FOLDER'],adminimage)
            try:
                admin_filedata.save(save_path)    
            except Exception as e:
                return jsonify({"status":"failed","message":f"{str(e)}"}),400

        #DB Storing
        cursor.execute('update admindata set admin_name=%s,admin_address=%s,admin_password=%s,admin_agree=%s,admin_image=%s where adminid=uuid_to_bin(%s) and admin_email=%s',[update_adminname,update_adminaddress,adminpassword,update_adminagree,adminimage,adminid,adminemail])
        mydb.commit()

        if old_adminimage:
            old_image_path=os.path.join(app.config['UPLOAD_FOLDER'],old_adminimage)
            if admin_filedata and os.path.exists(old_image_path):
                if old_image_path:
                    os.remove(old_image_path)

        return jsonify({"status":"success","message":"item updated successfully"}),200
        
    except Exception as e:
        mydb.rollback()
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
            return jsonify({"status":"failed","message":"Email And Username Required"}),400
        userpassword=data.get('userpassword')
        if not userpassword:
            return jsonify({"status":"failed","message":"Password is Required"}),400


        if len(userpassword)<6:
            return jsonify({"status":"failed","message":"Password is too short"}),400
        hash_password=bcrypt.generate_password_hash(userpassword).decode('utf-8')
        useraddress=data.get('useraddress')
        if not useraddress:
            return jsonify({"status":"failed","message":"Address is Required"}),400
        userphone=data.get('userphone')
        if not userphone:
            return jsonify({"status":"failed","message":"Phone is Required"}),400
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
                return jsonify({"status":"failed","message":"User Already Existed"}),409
            elif response[0]=='inactive':
                cursor.execute('update userdata set otp=%s,otp_expiry_time=%s where useremail=%s',[otp,otp_expiry_time,useremail])
                mydb.commit()
            elif response[0]=='suspended':
                return jsonify({"status":"success","message":"User Already Existed"}),200
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

@app.route('/api/user/verify-otp',methods=['POST'])
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
                return jsonify({"status":"success","message":"User Already verified"}),200
            elif response[0]=='inactive':
                cursor.execute('select otp,otp_expiry_time from userdata where useremail=%s',[user_email])
                mysql_response=cursor.fetchone()
                if not mysql_response:
                    return jsonify({"status":"failed","message":"OTP information Not Found"}),400
                if user_otp_time>mysql_response[1]:
                    return jsonify({"status":"failed","message":"otp expired"}),400
                else:
                    if mysql_response[0]==user_otp:
                        cursor.execute('update userdata set otp=null,otp_expiry_time=null,account_status="active" where useremail=%s',[user_email])
                        mydb.commit()
                        return jsonify({"status":"success","message":"OTP Verifed successfully"}),200
                    else:
                        return jsonify({"status":"failed","message":"Otp Incorrect"}),400
            elif response[0]=='suspended':
                return jsonify({"status":"success","message":"User Susspended"}),400
        else:
            return jsonify({"status":"failed","message":"User Not Found"}),400

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
                                "user":{"userid":session['userid'],"useremail":session['user_email']}
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
        return jsonify({"status":"failed","message":"User have to Login TO Access The dashboard"}),401
    return jsonify({"status":"Success","message":"Welcome to User Dashboard"}),200

@app.route('/api/user/logout',methods=['GET'])
def userlogout():
    if not session.get('userid'):
        return jsonify({"status":"failed","message":"Login TO LOGOUT"}),400
    session.pop('userid')
    session.pop('user_email')
    session.modified=True
    return jsonify({"status":"Success","message":"Logout SuccessFull"}),200

@app.route('/api/products',methods=['GET'])
def products():
    cursor=None
    try:
        mydb.ping(reconnect=True)
        cursor=mydb.cursor(buffered=True)
        cursor.execute('select bin_to_uuid(itemid),item_name,item_descrption,item_about,item_price,item_stock,item_category,item_image from items')
        items_data=cursor.fetchall()
        if not items_data:
            return jsonify({"status":"failed","message":"No Items To view"}),404
        products=[]
        for item in items_data:
            products.append({'itemid':item[0],'itemname':item[1],'item_desc':item[2],'item_about':item[3],
                             'item_price':item[4],'quantity':item[5],'category':item[6],
                             'image':url_for('static',filename=f"uploads/{item[7]}",_external=True)
                             })
        return jsonify({"status":"success","message":"Successfully fetched all items",'products':products}),200
    except Exception as e:
        mydb.rollback()
        print("Error:",e)
        return jsonify({"status":"Failed","message":f"{str(e)}"}),500
    finally:
        if cursor:
            cursor.close()

@app.route('/api/addcart',methods=['POST'])
def addcart():
    cursor=None
    try:
        if not session.get('userid'):
            return jsonify({"status":"failed","message":"Pls login to add cart item"}),401
        data=request.get_json()
        print(data)
        if not data:
            return  jsonify({"status":"failed","message":"No input data given"}),400
        itemid=data.get('itemid')
        if not itemid:
            return jsonify({"status":"failed","message":"Item ID is Required"}),400
        try:
            quantity=int(data.get('quantity'))
        except (ValueError,TypeError):
            return jsonify({"status":"failed","message":"Qunatity must be a number"}),400
        mydb.ping(reconnect=True)
        cursor=mydb.cursor(buffered=True)
        cursor.execute('select item_stock from items where itemid=uuid_to_bin(%s)',[itemid])
        item_data=cursor.fetchone()
        #checking item in db
        if not item_data:
            return jsonify({"status":"failed","message":"Item not found in DB"}),400
        #stock validation
        if item_data[0]<quantity:
            return jsonify({"status":"failed","message":"item quantity exceeded than stock quantity"}),400
        if item_data[0]==0:
            return jsonify({"status":"failed","message":"Item out of stock"}),400
        #validation to check item already in cart
        cursor.execute('select quantity from cart where itemid=uuid_to_bin(%s) and userid=uuid_to_bin(%s)',[itemid,session.get('userid')])
        cart_item=cursor.fetchone()
        if cart_item:
            cursor.execute('update cart set quantity=%s where itemid=uuid_to_bin(%s)and userid=uuid_to_bin(%s)',[quantity+cart_item[0],itemid,session.get('userid')])
            message='Cart item updated successfully'
        else:
            cursor.execute('insert into cart(cartid,quantity,itemid,userid) values(uuid_to_bin(uuid()),%s,uuid_to_bin(%s),uuid_to_bin(%s))',[quantity,itemid,session.get('userid')])
            message='Cart item added successfully'
        mydb.commit()
        return jsonify({"status":"success","message":message}),200
    except Exception as e:
        mydb.rollback()
        print('Error:',str(e))
        return jsonify({"status":"failed","message":f"{str(e)}"}),500
    finally:
        if cursor:
            cursor.close()

@app.route('/api/cart/view')
def viewcart():
    cursor=None
    try:
        userid=session.get('userid')
        if not userid:
            return jsonify({"status":"failed","message":"Pls Login To view Cart"}),401
        mydb.ping(reconnect=True)
        cursor=mydb.cursor(buffered=True)
        cursor.execute('select bin_to_uuid(i.itemid),i.item_name,i.item_descrption,i.item_price,c.quantity,i.item_category,i.item_image from items i join cart c on i.itemid=c.itemid where c.userid=uuid_to_bin(%s)',[userid])
        cart_items=cursor.fetchall()
        print(cart_items)
        if not cart_items:
            return jsonify({"status":"failed","message":"Cart is Empty"}),401
        items_data=[]
        subtotal=0
        for item in cart_items:
            itemid=item[0]
            itemname=item[1]
            price=float(item[3])
            quantity=int(item[4])
            category=item[5]
            image=url_for('static',filename=f"uploads/{item[6]}",_external=True)
            amount=price*quantity
            subtotal+=amount
            items_data.append({"itemid":itemid,
                               "itemname":itemname,
                               "price":price,
                               "quantity":quantity,
                               "category":category,
                               "image":image,
                               "total":amount
                               })

        delivery=40
        tax=round(subtotal*0.05,2)
        grand_total=subtotal+delivery+tax
        summary={"subtotal":subtotal,"delivery":delivery,"grand_total":grand_total,"tax":tax}

        return jsonify({"status":"success","message":"Cart Viewing SuccessFully","summary":summary,"cart_items":items_data}),200
    except Exception as e:
            mydb.rollback()
            print('Error:',str(e))
            return jsonify({"status":"failed","message":f"{str(e)}"}),500
    finally:
        if cursor:
            cursor.close()


@app.route('/api/cart/update',methods=['PUT'])
def updatecart():
    cursor=None
    try:
        userid=session.get('userid')
        if not userid:
            return jsonify({"status":"failed","message":"Pls Login To view Cart"}),401
        data=request.get_json()
        print(data)
        if not data:
            return jsonify({"status":"failed","message":"No Input Given"}),400
        itemid=data.get('itemid')
        update_quantity=data.get('quantity') 
        if not itemid:
            return jsonify({"status":"failed","message":"itemid required"}),400

        mydb.ping(reconnect=True)
        cursor=mydb.cursor(buffered=True)
        cursor.execute('select item_stock from items where itemid=uuid_to_bin(%s)',[itemid])
        item_data=cursor.fetchone()
        #checking item in db
        if not item_data:
            return jsonify({"status":"failed","message":"Item not found in DB"}),400
        #stock validation
        if item_data[0]<update_quantity:
            return jsonify({"status":"failed","message":"item quantity exceeded than stock quantity"}),400
        if item_data[0]==0:
            return jsonify({"status":"failed","message":"Item out of stock"}),400
        
        #validation to check item already in cart
        cursor.execute('select quantity from cart where itemid=uuid_to_bin(%s) and userid=uuid_to_bin(%s)',[itemid,userid])
        cart_item=cursor.fetchone()
        
        if cart_item:
            new_quantity=cart_item[0]+update_quantity
            if new_quantity>item_data[0]:
                return jsonify({"status":"failed","message":"Item quantity exceeded than stock"})
            cursor.execute('update cart set quantity=%s where itemid=uuid_to_bin(%s)and userid=uuid_to_bin(%s)',[update_quantity,itemid,userid])
            message='Cart item updated successfully'
        else:
            message='Item Not Found'
        mydb.commit()

        return jsonify({"status":"success","message":message}),200
        
    except Exception as e:
            mydb.rollback()
            print('Error:',str(e))
            return jsonify({"status":"failed","message":f"{str(e)}"}),500
    finally:
        if cursor:
            cursor.close()

@app.route('/api/cart/remove/<itemid>',methods=['DELETE'])
def deletecart(itemid):
    cursor=None
    try:
        userid=session.get('userid')
        if not userid:
            return jsonify({"status":"failed","message":"Pls Login To view Cart"}),401

        #DB Checking 
        mydb.ping(reconnect=True)
        cursor=mydb.cursor(buffered=True)

        #validation to check item already in cart
        cursor.execute('select quantity from cart where itemid=uuid_to_bin(%s) and userid=uuid_to_bin(%s)',[itemid,userid])
        cart_item=cursor.fetchone()
        
        if not cart_item:
            return jsonify({"status":"failed","message":"Item Have to be in cart To remove"}),200
        cursor.execute('delete from cart where itemid=uuid_to_bin(%s)and userid=uuid_to_bin(%s)',[itemid,userid])
        mydb.commit()
        return jsonify({"status":"success","message":"Item in cart deleted Successfully"}),200
        
    except Exception as e:
            mydb.rollback()
            print('Error:',str(e))
            return jsonify({"status":"failed","message":f"{str(e)}"}),500
    finally:
        if cursor:
            cursor.close()


@app.route('/api/myorders')
def myorders():
    cursor=None
    #Dummy
    print("Viewing My orders")
    return jsonify({"status":"success","message":"Deleting Cart"}),200

@app.route('/api/orders/<orderid>')
def orderview(orderid):
    #Dummy
    print("Viewing the specic order")
    return jsonify({"status":"success","message":"Deleting Cart"}),200

@app.route('/api/payment/create-order',methods=['POST'])
def createpayment():
    #Dummy
    print("Payment Creating for that ammount")
    return jsonify({"status":"success","message":"Deleting Cart"}),200

@app.route('/api/payment/verify',methods=['POST'])
def paymentverify():
    #Dummy
    print("Verifying The payment")
    return jsonify({"status":"success","message":"Deleting Cart"}),200


@app.route('/api/invoice/<orderid>',methods=['GET'])
def inovice():
    #Dummy
    print("Delete An item in Cart")
    return jsonify({"status":"success","message":"Deleting Cart"}),200


@app.errorhandler(413)
def file_too_large(error):
    return jsonify({"status":"failed","message":"File is too large .maximum size is 6MB"}),413

@app.route('/api/user/session', methods=['GET'])
def check_user_session():

    return jsonify({
        "status": "success",
        "logged_in": bool(session.get('userid')),
        "userid": session.get('userid'),
        "email": session.get('user_email')
    }), 200



#App Run
if __name__=="__main__":
    app.run(use_reloader=True,debug=True)
