#!/usr/bin/env python3

# python script to populate the database with random, but plausible data
# required modules can be installed with a package manager on linux or pip/pip3 on linux/windows/osx
# like "[sudo] pip[3] install _modulename_"
# required (non builtin) modules are:
#   - requests


import requests
import random
import string
import datetime
import json

# config options:
maxUsersToGenerate = 40
maxDevicesPerUser = 4
maxPacketsPerDevice = 10
maxCompaniesToGenerate = 10
probCompanySpecReq = 0.25
# backend server location(s)
databaseServer = 'http://127.0.0.1:3000'
appServerMobileClient = 'http://127.0.0.1:3001/api'
appServerData4Help = 'http://127.0.0.1:3002/api'
# milan coordinates
# ul = [45.572524, 8.884990]
# ur = [45.572524, 8.884990]
# dl = [45.328044, 8.915986]
# dr = [45.328044, 8.915986]
lat = [45.572524, 45.328044]
long = [8.884990, 8.915986]

apiKeys = {}
SSNs = {}

def registerUser(n):
    birthDate = randomDate(datetime.date(1960, 1, 1), datetime.date.today())
    ssn = randomWord(16, string.digits + string.ascii_lowercase)
    postData = {
        'ssn': ssn,
        'name': 'name{}'.format(n),
        'surname': 'surname{}'.format(n),
        'sex': random.choice(['male', 'female']),
        'birthDate': '{}/{}/{}'.format(birthDate.month, birthDate.day, birthDate.year),
        'country': 'italy',
        'region': 'lombardia',
        'city': 'milan',
        'zipcode': '{}'.format(20100 + n % 5),
        'street': 'street{}'.format(n),
        'streetNr': '{}'.format(random.randint(0, 255)),
        'mail': 'mail{}@gmail.com'.format(n),
        'password': 'password{}'.format(n)
    }
    post = requests.post(appServerMobileClient + '/register', postData)
    if post.status_code != 201:
        print('user {} NOT registered'.format(n))
        print(postData)
        print(post.text)
        raise Exception
    SSNs[n] = ssn
    return ssn

def registerWearable(ssn, n):
    mac = ''
    for i in range(0,5):
        mac += randomWord(2, string.digits + 'abcdef') + ':'
    mac += randomWord(2, string.digits + 'abcdef')
    post = requests.post('{}/{}/registerWearable'.format(appServerMobileClient, ssn), {
        'macAddr': mac
    }, auth = requests.auth.HTTPBasicAuth('mail{}@gmail.com'.format(n), 'password{}'.format(n)))
    if post.status_code != 201:
        print('device {} of user {} not registered'.format(mac, n))
        print(post.text)
        raise Exception
    return mac

def sendInfoPacket(ssn, mac, n):
    rDate = randomDate(datetime.date(2017, 1, 1), datetime.date.today())
    rTime = randomTime()
    postData = {
        'ts': '{}/{}/{} {}:{}:{}'.format(rDate.month, rDate.day, rDate.year, rTime.hour, rTime.minute, rTime.second),
        'wearableMac': mac,
        'userSsn': ssn,
        'geoX': random.uniform(lat[0], lat[1]),
        'geoY': random.uniform(long[0], long[1]),
        'heartBeatRate': round(random.uniform(40.0, 120.0), 2),
        'bloodPressSyst': round(random.uniform(70.0, 190.0), 2),
        'bloodPressDias': round(random.uniform(40.0, 100.0), 2)
    }
    post = requests.post('{}/{}/packet'.format(appServerMobileClient, ssn), postData,
                         auth = requests.auth.HTTPBasicAuth('mail{}@gmail.com'.format(n), 'password{}'.format(n)))
    if post.status_code != 201:
        print('packet of user {} not sent'.format(n))
        print(post.text)
        print(postData)
        raise Exception

def registerCompany(n):
    postData = {
        'vat': randomWord(11, string.digits + string.ascii_lowercase),
        'name': 'company{}'.format(n)
    }
    post = requests.post('{}/register'.format(appServerData4Help), postData)
    if post.status_code != 201:
        print('company {} not registered'.format(n))
        print(post.text)
        print(postData)
        raise Exception
    apiKey = json.loads(post.text)['apiKey']
    apiKeys[n] = apiKey
    return apiKey

def specificRequest(companyKey, userSsn):
    postData = {'targetSsn': userSsn}
    qs = {'apiKey': companyKey}
    post = requests.post('{}/specificRequest'.format(appServerData4Help), postData, params = qs)
    if post.status_code != 201:
        print('specificRequest for user {} not forwarded'.format(userSsn))
        print(post.text)
        print(postData)
        print(qs)
        raise Exception

def randomWord(length, alpha):
    return ''.join(random.choice(alpha) for i in range(length))

def randomDate(start, end):
    return start + datetime.timedelta(
        seconds = random.randint(0, int((end - start).total_seconds())),
    )

def randomTime():
    return datetime.time(random.randint(0, 23), random.randint(0, 59), random.randint(0, 59))

def trueFalse(prob):
    return True if random.randint(0,100) < prob * 100 else False

# reset/clean the db
requests.get(databaseServer + '/dropALL')
# register users, devices and packets
for i in range(1, maxUsersToGenerate):
    try:
        ssn = registerUser(i)
        for j in range(1, random.randint(1, maxDevicesPerUser)):
            mac = registerWearable(ssn, i)
            for k in range(1, random.randint(1, maxPacketsPerDevice)):
                sendInfoPacket(ssn, mac, i)
    except Exception as e:
        print(e)
        continue
# register companies, make specific requests to previous users
for i in range(1, maxCompaniesToGenerate):
    try:
        registerCompany(i)
        for j in range(1, maxUsersToGenerate):
            if trueFalse(probCompanySpecReq):
                try:
                    specificRequest(apiKeys[i], SSNs[j])
                except:
                    continue
    except Exception as e:
        print(e)
        continue
