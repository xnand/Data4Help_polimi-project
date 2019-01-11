
// returns the regexp to check an incoming field
function getRegExp(k) {
    switch (k) {
        case 'companyId':
        case 'requestId':
        case 'id':
		case 'ageStart':
		case 'ageEnd':
            return /^[0-9]*$/;
        // user
        case 'ssn':
        case 'userSsn':
        case 'targetSsn':
            return /^[0-9a-z]{16}$/;
        case 'name':
        case 'surname':
            return /^[0-9a-z' ]{1,32}$/;
        case 'sex':
            return /^[mf].*$/;
        case 'birthDate':
            return /^([0-9]{1,2}[ /-]){2}[0-9]{4}$/;
        case 'country':
        case 'region':
        case 'city':
        case 'street':
            return /.*/;
        case 'zipcode':
            return /^[0-9]{1,10}$/;
        case 'streetNr':
            return /^[0-9]*$/;
        case 'mail':
            return /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/;
        case 'password':
            return /^.[^:]{8,32}$/;
        // wearable device
        case 'macAddr':
        case 'wearableMac':
            return /^([0-9a-f]{2}[ -:]?){5}[0-9a-f]{2}$/;
        // infoPacket
        case 'ts':
            return /.*/; // todo
        case 'geoX':
        case 'geoY':
        case 'heartBeatRate':
        case 'bloodPressSyst':
        case 'bloodPressDias':
            return /^[-+]?[0-9]*\.?[0-9]+$/;
        // company
        case 'vat':
            return /^[0-9a-z ]{1,11}$/;
        case 'apiKey':
            return /^[a-zA-Z0-9]{40}$/;
		// request
		case 'state':
			return /^(pending|authorized|rejected)$/;
        case 'forwardingLink':
            return /^.*$/; // todo!
        default:
            return false;
    }
}

module.exports = {
	// generate hash for a password
    genHash: function (seed) {
    	// change hash for production
        return require('crypto').createHash('md5').update('server_secret').update(seed).digest('hex');
    },

	// generate a random string
    randomString: function (len, charSet) {
        charSet = charSet || 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        var randStr = '';
        for (var i = 0; i < len; i++) {
            var randomPos = Math.floor(Math.random() * charSet.length);
            randStr += charSet.substring(randomPos, randomPos + 1);
        }
        return randStr;
    },

	// validate parameters;
	// expected are the checked parameters, grabbed from the params object
	// optional are the ones that are inside expected but can not be defined in params
	// append is a string to place at the end of the error message in case a parameter is invalid
    validateParams: function(params, expected, optional, append) {
        if (!append) {
            append = ''
        }
        return new Promise(function(resolve, reject) {
            var i, p, r;
            for (i = 0; i < expected.length; i++) {
                p = expected[i];
                r = getRegExp(p);
                if (!params[p] || !r || !r.test(params[p])) {
                    if (optional && optional.includes(p)) {
                        continue;
                    }
                    return reject({apiError: `invalid ${p}${append}`});
                }
            }
            resolve();
        })
    },

	// common error handler for endpoints
    catchApi: function(err, res) {
    if (err && err.noError) { // no error, just used sometimes to break a .then() chain
        return;
    }
    if (!err || !err.apiError) {
        err = {apiError: 'unknown error'};
    }
    if (err.apiError === 'API key not authorized') {
        res.status(401).send(err);
    }
    else {
        res.status(400).send(err);
    }
	}
};

