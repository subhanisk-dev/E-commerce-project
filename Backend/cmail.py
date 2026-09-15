import smtplib
from email.message import EmailMessage
from dotenv import load_dotenv
import os

load_dotenv()
def send_mail(to,subject,body):
    try:
        server=smtplib.SMTP_SSL('smtp.gmail.com',465)
        server.login(os.getenv("email"),os.getenv("email_api_key"))
        msg=EmailMessage()
        msg['FROM']=os.getenv("email")
        msg['SUBJECT']=subject
        msg['To']=to
        msg.set_content(body)
        server.send_message(msg)
        print('Mail sent')
        server.close()
    except Exception as e:
        print('Mail Error',e)