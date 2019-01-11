#!/usr/bin/env python3

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
config = None
configFilePath = '../common/config.json'
with open(configFilePath, 'r') as c:
    config = json.loads(c.read())
# backend server location(s)
databaseServer = 'http://{}:{}/api'.format(config['address']['databaseServer'], config['port']['databaseServer'])
appServerMobileClient = 'http://{}:{}/api'.format(config['address']['applicationServerMobileClient'], config['port']['applicationServerMobileClient'])
appServerData4Help = 'http://{}:{}/api'.format(config['address']['applicationServerData4Help'], config['port']['applicationServerData4Help'])
# milan coordinates
lat = [45.572524, 45.328044]
long = [8.884990, 8.915986]

users = []
companies = []

class User:
    def __init__(self):
        global users
        self.wearables = []
        self.sentPackets = []
        self.n = len(users)
        self.ssn = randomWord(16)
        self.name = randomWord(10,string.ascii_letters)
        self.surname = randomWord(10,string.ascii_letters)
        self.sex = random.choice(['male', 'female'])
        self.birthDate = randomDate(datetime.date(1960, 1, 1), datetime.date.today())
        self.country = 'italy'
        self.region = 'lombardia'
        self.city = 'milano'
        self.zipcode = '{}'.format(20100 + self.n % 5)
        self.street = 'street{}'.format(self.n % 13)
        self.streetNr = '{}'.format(random.randint(0, 255))
        self.mail = 'mail{}@gmail.com'.format(self.n)
        self.password = 'password{}'.format(self.n)

    def register(self):
        postData = {
            'ssn': self.ssn,
            'name': self.name,
            'surname': self.surname,
            'sex': self.sex,
            'birthDate': '{}/{}/{}'.format(self.birthDate.month, self.birthDate.day, self.birthDate.year),
            'country': self.country,
            'region': self.region,
            'city': self.city,
            'zipcode': self.zipcode,
            'street': self.street,
            'streetNr': self.streetNr,
            'mail': self.mail,
            'password': self.password
        }
        r = requests.post(appServerMobileClient + '/register', postData)
        return r

    def addWearable(self):
        s = None
        while s != 201:
            w = Wearable()
            r = requests.post('{}/{}/wearableDevice'.format(appServerMobileClient, self.ssn), {
                'macAddr': w.macAddr
            }, auth = requests.auth.HTTPBasicAuth(self.mail, self.password))
            s = r.status_code
        self.wearables.append(w)

    def acceptRequest(self, requestId):
        return requests.post('{}/{}/acceptRequest'.format(appServerMobileClient, self.ssn), {
            'id': requestId
        }, auth = requests.auth.HTTPBasicAuth(self.mail, self.password))

    def rejectRequest(self, requestId):
        return requests.post('{}/{}/rejectRequest'.format(appServerMobileClient, self.ssn), {
            'id': requestId
        }, auth = requests.auth.HTTPBasicAuth(self.mail, self.password))


class Wearable:
    def __init__(self):
        self.macAddr = randomWord(12, string.digits + 'abcdef')
        self.sentPackets = []

    def sendPacket(self, user):
        s = None
        while s != 201:
            packet = InfoPacket(self, user)
            r = requests.post('{}/{}/packet'.format(appServerMobileClient, user.ssn), {
                'ts': packet.ts,
                'wearableMac': self.macAddr,
                'userSsn': user.ssn,
                'geoX': packet.geoX,
                'geoY': packet.geoY,
                'heartBeatRate': packet.heartBeatRate,
                'bloodPressSyst': packet.bloodPressSyst,
                'bloodPressDias': packet.bloodPressDias
            }, auth = requests.auth.HTTPBasicAuth(user.mail, user.password))
            s = r.status_code
        self.sentPackets.append(packet)
        user.sentPackets.append(packet)


class InfoPacket:
    def __init__(self, wearable, user):
        rDate = randomDate(datetime.date(2017, 1, 1), datetime.date.today())
        rTime = randomTime()
        self.ts = '{}/{}/{} {}:{}:{}'.format(rDate.month, rDate.day, rDate.year, rTime.hour, rTime.minute, rTime.second),
        self.wearableMac = wearable.macAddr
        self.userSsn = user.ssn
        self.geoX = random.uniform(lat[0], lat[1])
        self.geoY = random.uniform(long[0], long[1])
        self.heartBeatRate = round(random.uniform(40.0, 120.0), 2)
        self.bloodPressSyst = round(random.uniform(70.0, 190.0), 2)
        self.bloodPressDias = round(random.uniform(40.0, 100.0), 2)


class Company:
    def __init__(self):
        self.vat = randomWord(11)
        self.name = 'company {}'.format(randomWord(5, string.ascii_letters))
        self.apiKey = None
        self.specificRequests = []
        self.groupRequests = []

    def register(self):
        while True:
            p = requests.post('{}/register'.format(appServerData4Help), {
                'vat': self.vat,
                'name': self.name
            })
            if p.status_code == 201:
                break
        self.apiKey = json.loads(p.text)['apiKey']
        return p

    def makeSpecReq(self, user):
        r = SpecificRequest(self, user)
        p = requests.post('{}/specificRequest'.format(appServerData4Help), {
            'targetSsn': user.ssn
        }, params = {
            'apiKey': self.apiKey
        })
        if p.status_code == 201:
            r.id = json.loads(p.text)['specificRequestId']
            self.specificRequests.append(r)

    def makeGroupReq(self):
        pass


class SpecificRequest:
    def __init__(self, company, user):
        self.company = company
        self.user = user
        self.id = None

# no group request for the moment since they're a little annoying to do

def randomWord(length, alpha = string.digits + string.ascii_lowercase):
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
requests.get('http://{}:{}/dropALL'.format(config['address']['databaseServer'], config['port']['databaseServer']))
# initial set up
while len(users) <= 10:
    u = User()
    if u.register().status_code != 201:
        continue
    users.append(u)
    u.addWearable()
    u.wearables[0].sendPacket(u)
while len(companies) <= 5:
    c = Company()
    if c.register().status_code != 201:
        continue
    companies.append(c)
    c.makeSpecReq(random.choice(users))

print('initial data set up')
print('randomizing data insertion indefinitely; press ctrl+c to stop')
# randomize from now on
while True:
    r = random.randint(0, 6)
    if r == 0:
        u = User()
        if u.register().status_code != 201:
            continue
        users.append(u)
    elif r == 1:
        random.choice(users).addWearable()
    elif r == 2:
        u = random.choice(users)
        l = len(u.wearables)
        if l == 0:
            continue
        w = random.choice(u.wearables)
        w.sendPacket(u)
    elif r == 3:
        c = Company()
        if c.register().status_code != 201:
            continue
        companies.append(c)
    elif r == 4:
        c = random.choice(companies)
        c.makeSpecReq(random.choice(users))
    elif r == 5:
        c = random.choice(companies)
        if len(c.specificRequests) == 0:
            continue
        sr = random.choice(c.specificRequests)
        sr.user.acceptRequest(sr.id)
    elif r == 6:
        c = random.choice(companies)
        if len(c.specificRequests) == 0:
            continue
        sr = random.choice(c.specificRequests)
        sr.user.rejectRequest(sr.id)
