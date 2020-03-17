import requests
import time
import json
import urllib.request
from random import *

for i in range(10):
    
    value = uniform(-5, 5)
    value = round(value,1)
    
    while(True):
    
        url = 'https://api.thingspeak.com/update?api_key=EWHJG7U9Y2U05GX2&field2=' + str(value)
        response = requests.get(url)
        
        time.sleep(1)

        TS = urllib.request.urlopen("https://api.thingspeak.com/channels/1021010/feeds.json?results=1")
        response_check = TS.read()
        data = json.loads(response_check)
        check_value = data['feeds'][0]['field2']
        
        if str(check_value) == str(value):
            break
        else:
            print('Pass Failed! Try again.')

    if response:
        print('Success! Passed Value is ' + str(value))
    else:
        print('An error has occurred.')

    if i == 9:
        break;
    
    wait_time = randint(10, 20)
    print('Waiting ' + str(wait_time) + ' second..\n')
    time.sleep(wait_time)

print('Finish!')
