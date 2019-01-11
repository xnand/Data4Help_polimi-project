import requests
import json

config = None
configFilePath = '../common/config.json'
with open(configFilePath, 'r') as c:
    config = json.loads(c.read())

print(requests.get('http://{}:{}/dropALL'.format(config['address']['databaseServer'], config['port']['databaseServer'])).text)