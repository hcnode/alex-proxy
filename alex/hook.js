/**
 * Created by harry on 15/12/28.
 */
var url = require('url');
var fs = require('fs');
var hookConf;
function matchHook(reqUrl, method) {

	var hookFile = __dirname + "/../data/hook.json";
	//if(!hookConf){
		hookConf = JSON.parse(fs.readFileSync(hookFile));
	//}
	for(var i=0;i<hookConf.length;i++){
		if(hookConf[i].url == reqUrl && hookConf[i].method.toUpperCase() == method.toUpperCase()){
			return hookConf[i];
		}
	}
}

module.exports = function (req, res) {
	var urlParse = url.parse(req.url);
	var reqUrl = urlParse.protocol + "//" + urlParse.host + urlParse.pathname;
	var hook = matchHook(reqUrl, req.method);
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