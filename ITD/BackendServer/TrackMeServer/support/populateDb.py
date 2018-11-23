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

# config options:
maxUsersToGenerate = 20
minDevicesPerUser = 0
maxDevicesPerUser = 4
# milan coordinates
# ul = [45.572524, 8.884990]
# ur = [45.572524, 8.884990]
# dl = [45.328044, 8.915986]
# dr = [45.328044, 8.915986]
lat = [45.572524, 45.328044]
long = [8.884990, 8.915986]
# backend server location(s)
backendUrl = 'http://127.0.0.1:3000'
backendUserRegisterLink = '{}/user/register'.format(backendUrl)

class User:
    def __init__(self, ssn, name, surname, sex, birthDate, state, country, city, zipcode, street, streetNr):
        self.ssn = ssn
        self.name = name
        self.surname = surname
        self.sex = sex
        self.birthDate = birthDate
        self.state = state
        self.country = country
        self.city = city
        self.zipcode = zipcode
        self.street = street
        self.streetNr = streetNr

def randomWord(length, alpha):
    return ''.join(random.choice(alpha) for i in range(length))

def randomDate(start, end):
    'generate a random datetime between `start` and `end`'
    return start + datetime.timedelta(
        seconds = random.randint(0, int((end - start).total_seconds())),
    )

def createRandomUser(n):
    birthDate = randomDate(datetime.date(1960,1,1), datetime.date.today())
    locationLink = 'https://geocode.xyz/{},{}?geoit=json'.format(random.uniform(lat[0], lat[1]), random.uniform(long[0], long[1]))
    location = requests.get(locationLink).json()['alt']['loc'][0]
    return User(
        randomWord(16, string.digits + string.ascii_lowercase),
        'name{}'.format(n),
        'surname{}'.format(n),
        random.choice(['male', 'female']),
        '{}/{}/{}'.format(birthDate.month, birthDate.day, birthDate.year),
        'italy',
        'lombardia',
        'milan',
        location['postal'],
        location['staddress'],
        location['stnumber']
    )

def storeRandomUser(u):
    postData = {
        'ssn': u.ssn,
        'name': u.name,
        'surname': u.surname,
        'sex': u.sex,
        'birthDate': u.birthDate,
        'state': u.state,
        'country': u.country,
        'city': u.city,
        'zipcode': u.zipcode,
        'street': u.street,
        'streetNr': u.streetNr
    }
    post = requests.post(backendUserRegisterLink, postData)
    if post.status_code != 201:
        print('user {} not stored in db'.format(u.name))
        print(post.text)
    else:
        print('user {} stored in db'.format(u.name))

def storeRandomWearableDevice(user):
    mac = ''
    for i in range(0,5):
        mac += randomWord(2, string.digits + 'abcdef') + ':'
    mac += randomWord(2, string.digits + 'abcdef')
    post = requests.post('{}/user/{}/registerWearable'.format(backendUrl, user.ssn), {
        'macAddr': mac
    })
    if post.status_code != 201:
        print('device {} not stored in db'.format(mac))
        print(post.text)
    else:
        print('device {} stored in db'.format(mac))


for i in range(1, maxUsersToGenerate):
    try:
        user = createRandomUser(i)
        storeRandomUser(user)
        for j in range(random.randint(minDevicesPerUser, maxDevicesPerUser)):
            storeRandomWearableDevice(user)
    except:
        continue