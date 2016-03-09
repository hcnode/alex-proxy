/**
 * Created by harry on 15/12/28.
 */
var url = require('url');
var fs = require('fs');
var util = require("./util");

var hookConf;
function matchHook(reqUrl, method, clientIp, matchPathOnly) {

	var hookFile = __dirname + "/../data/"+ clientIp +"_hook.json";
	if(!fs.existsSync(hookFile)) return null;
	//if(!hookConf){
		hookConf = JSON.parse(fs.readFileSync(hookFile));
	//}
	for(var i=0;i<hookConf.length;i++){
		if(!hookConf[i].matchPathOnly && hookConf[i].url == reqUrl && hookConf[i].method.toUpperCase() == method.toUpperCase()){
			return hookConf[i];
		}

		if(hookConf[i].matchPathOnly && getPath(hookConf[i].url) == getPath(reqUrl) && hookConf[i].method.toUpperCase() == method.toUpperCase()){
			return hookConf[i];
		}
	}
}

function getPath(reqUrl){
	var urlParse = url.parse(reqUrl);
	return urlParse.protocol + "//" + urlParse.host + urlParse.pathname;
}
module.exports = function (req, res) {
	var urlParse = url.parse(req.url);
	var clientIp = util.getIp(req.connection.remoteAddress);
	var hook = matchHook(req.url, req.method, clientIp);
	if(hook && hook.enable){
		res.writeHead((hook.statusCode || 200) + "", hook.headers);

		try {
			res.end(JSON.stringify(hook.body));
		} catch (e) {
			res.end(hook.body);
		}
		return true;
	}
};
module.exports.clean = function () {
	hookConf = null;
}