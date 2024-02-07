const crypto = require('crypto');
var url = require('url');

const authorizationScheme = 'VERACODE-HMAC-SHA-256';
const requestVersion = "vcode_request_version_1";
const nonceSize = 16;

function computeHashHex(message, key_hex) {
   // return CryptoJS.HmacSHA256(message, CryptoJS.enc.Hex.parse(key_hex)).toString(CryptoJS.enc.Hex);
     hmac1 = crypto.createHmac('sha256', Buffer.from(key_hex,'hex'));
  hmac1.update(message);

  // Return the digest in hexadecimal format
   return hmac1.digest('hex');
}

function calculateDataSignature(apikey, nonceBytes, dateStamp, data) {
    let kNonce = computeHashHex(nonceBytes, apikey);
    let kDate = computeHashHex(dateStamp, kNonce);
    let kSig = computeHashHex(requestVersion, kDate);
    return computeHashHex(data, kSig);
}

function newNonce() {
   // return CryptoJS.lib.WordArray.random(nonceSize).toString().toUpperCase();
   return crypto.randomBytes(nonceSize).toString('hex').toUpperCase()
}

function toHexBinary(input) {
   // return CryptoJS.enc.Hex.stringify(CryptoJS.enc.Utf8.parse(input));
    return Buffer.from(input,'utf-8').toString('hex');
}

function removePrefixFromApiCredential(input) {
    return input.split('-').at(-1);
}

function calculateVeracodeAuthHeader(requestUrl, httpMethod, host, id, key) {
    const formattedId = removePrefixFromApiCredential(id);
    const formattedKey = removePrefixFromApiCredential(key);

    let parsedUrl = url.parse(requestUrl);
    let data = `id=${formattedId}&host=${host}&url=${parsedUrl.path}&method=${httpMethod}`;
    let dateStamp = Date.now().toString();
    let nonceBytes = newNonce();
    let dataSignature = calculateDataSignature(formattedKey, nonceBytes, dateStamp, data);
    let authorizationParam = `id=${formattedId},ts=${dateStamp},nonce=${toHexBinary(nonceBytes)},sig=${dataSignature}`;
    let hmac = authorizationScheme + " " + authorizationParam;
    console.log(hmac)
}


module.exports = {
    calculateVeracodeAuthHeader: calculateVeracodeAuthHeader
};
