from itsdangerous import URLSafeTimedSerializer
secret_key='subhani123'
def endata(data):
    serializer=URLSafeTimedSerializer(secret_key)
    return serializer.dumps(data,salt='reset')
def dndata(data):
    serializer=URLSafeTimedSerializer(secret_key)
    return serializer.loads(data,salt='reset',max_age=360)