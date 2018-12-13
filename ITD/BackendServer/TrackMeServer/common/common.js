module.exports = {
    genHash: function (seed) {
        return require('crypto').createHash('md5').update('server_secret').update(seed).digest('hex');
    },

    randomString: function (len, charSet) {
        charSet = charSet || 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        var randStr = '';
        for (var i = 0; i < len; i++) {
            var randomPos = Math.floor(Math.random() * charSet.length);
            randStr += charSet.substring(randomPos, randomPos + 1);
        }
        return randStr;
    }
};

