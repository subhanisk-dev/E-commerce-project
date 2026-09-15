# sample otp :H7nK8x
import random

def generate_otp():
    otp=""
    for _ in range(2):
        otp+=chr(random.randint(ord('A'), ord('Z')))
        otp+=str(random.randint(0,9))
        otp+=chr(random.randint(ord('a'), ord('z')))
    return otp