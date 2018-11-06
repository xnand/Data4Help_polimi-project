#!/usr/bin/env python3

import os
from sys import argv

if len(argv) != 3:
	print('usage: {} "string-to-replace" "replacement"'.format(argv[0]))
	exit(0)

try:
	toRepl = argv[1].encode()
except:
	print('cant encode argv 1')
	exit(1)

try:
	repl = argv[2].encode()
except:
	print('cant encode argv 2')
	exit(1)

scriptDir = os.path.dirname(os.path.realpath(__file__))
for f in os.listdir(scriptDir + '/../sections'):
	if '.tex' in f:
		with open(scriptDir + '/../sections/' + f, 'rb') as fd:
			content = fd.read()
		content.replace(toRepl, repl)
		with open(scriptDir + '/../sections/' + f, 'wb') as fd:
			fd.write(content)
