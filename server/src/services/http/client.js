const got = require("got");

exports.get = async(url, searchParams = {}) => {
    try {
        return got(url, { searchParams, responseType: 'json', resolveBodyOnly: true } );
    } catch(e){ 
        console.error(e.response.body);
        throw 'Internal server error.';
    }
}