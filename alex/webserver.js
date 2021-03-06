/**
 * Created by harry on 15/12/28.
 */

var config = require('config');
var url = require('url');
var fs = require('fs');
var http = require("http");


var localPort = config.get("port");
var localHostname = config.get("hostname");
var util = require("./util");

var ipRegexp = util.getIpRegExp();

var addBindIp = {};

function getParam(query, param) {
	var params = query.split("&");
	for (var i = 0; i < params.length; i++) {
		var pair = params[i].split("=");
		if (pair[0] == param) {
			return pair[1];
		}
	}
}

function getCacheData(clientIp, start) {
	var cacheData = util.getCacheData();
	if (ipRegexp.test(clientIp)) {
		for (var ip in cacheData) {
			if (ip.indexOf(clientIp) > -1) {
				cacheData[ip] = cacheData[ip] || [];
				var data = cacheData[ip].slice(start);
				return data;
			}
		}
	}
}

function getCacheDataById(id) {
	var cacheData = util.getCacheData();
	for (var ip in cacheData) {
		var data = cacheData[ip] || [];
		for(var i=0;i<data.length;i++){
			if(data[i].id == id){
				return [data[i]];
			}
		}
	}
	return null;
}

function includes(array, item) {
	for(var i=0;i<array.length;i++){
		if(array[i] == item){
			return true;
		}
	}
	return false;
}

function checkBindIp(clientIp, ip) {
	var json = JSON.parse(fs.readFileSync(__dirname + "/../data/ipBind.json"));
	var bindIps = json[ip] || [];
	for(var i=0;i<bindIps.length;i++){
		if(bindIps[i] == clientIp){
			return true;
		}
	}
	return false;
}

function getLog(req, res) {
	var urlParse = url.parse(req.url);
	var pathname = urlParse.pathname;
	var query = urlParse.query;
	var clientIp = util.getIp(req.connection.remoteAddress);
	if (pathname == "/bindIp") {
		var ip = getParam(query, "ip");
		var action = getParam(query, "action");
		var ipBindFile = __dirname + "/../data/ipBind.json";
		fs.readFile(ipBindFile, function (err, json) {
			json = JSON.parse(json);
			json[clientIp] = json[clientIp] || [];
			if(action == "add" && ip){
				if(!includes(json[clientIp], ip)){
					json[clientIp].push(ip);
				}
				addBindIp[ip] = clientIp;
			}else if(action == "remove" && ip){
				json[clientIp].forEach(function (item, index) {
					if(item == ip){
						json[clientIp].splice(index, 1);
					}
				})
			}else if(action == "get"){

			}

			fs.writeFile(ipBindFile, JSON.stringify(json, null, "\t"), function (err) {
				res.end("<h2>绑定成功!</h2>");
			});
		})
		return true;
	}else if (pathname == "/data") {
		var start = getParam(query, "start") || 0;
		var id = getParam(query, "id");
		var ip = getParam(query, "ip");
		var isBindIp = ip ? checkBindIp(clientIp, ip) : true;
		var data = id ? getCacheDataById(id) :
			isBindIp  ? (getCacheData(ip || clientIp, start) || []) : [];
		res.writeHead(200, {"Content-Type": "application/json"})
		var result = {
			data : data
		};
		if(addBindIp[clientIp]){
			result.bindIp = addBindIp[clientIp];
			delete addBindIp[clientIp];
		}
		res.end(JSON.stringify(result));
		return true;
	} else if (pathname == "/") {
		res.writeHead(200, {"Content-Type": "text/html"})
		var html = fs.readFileSync(__dirname + "/../view/index.html").toString();
		var serverIp = util.getIp(require("ip").address());
		var clientIp = util.getIp(req.connection.remoteAddress);
		res.end(html.replace(/\$serverIp\$/gi, serverIp).replace(/\$clientIp\$/gi, clientIp)
			.replace(/\$hostname\$/gi, localHostname).replace(/\$port\$/gi, localPort));
		return true;
	}  else if (pathname == "/hook") {
		res.writeHead(200, {"Content-Type": "text/html"})
		var html = fs.readFileSync(__dirname + "/../view/hook.html").toString();
		res.end(html);
		return true;
	}  else if (pathname == "/hook/list") {
		res.writeHead(200, {"Content-Type": "application/json"});
		var ip = getParam(query, "ip");
		var isBindIp = ip ? checkBindIp(clientIp, ip) : false;
		if(!isBindIp){
			res.end(JSON.stringify([]));
			return true;
		}
		var hookFile = __dirname + "/../data/"+ ip +"_hook.json";
		if(!fs.existsSync(hookFile)) {
			res.end(JSON.stringify([]));
		}else {
			var data = JSON.parse(fs.readFileSync(hookFile));
			res.end(JSON.stringify(data));
		}
		return true;
	} else if (pathname == "/hook/add") {
		hookAction(req, res, function (exist, data, hookFile, hook) {
			if(exist){
				res.end(JSON.stringify({
					code : 400,
					message : "data exist"
				}));
			}else {
				data.push(hook);
				fs.writeFileSync(hookFile, JSON.stringify(data, null, "\t"));
				res.end(JSON.stringify(data));
			}
		});

		return true;
	}  else if (pathname == "/hook/remove") {
		hookAction(req, res, function (exist, data, hookFile, hook) {
			for(var i=0;i<data.length;i++){
				if(data[i].url == hook.url && data[i].method.toUpperCase() == hook.method.toUpperCase()){
					data.splice(i, 1);
					break;
				}
			}
			fs.writeFileSync(hookFile, JSON.stringify(data, null, "\t"));
			res.end(JSON.stringify(data));
		});

		return true;
	}   else if (pathname == "/hook/update") {
		hookAction(req, res, function (exist, data, hookFile, hook) {
			if(hook.$$hashKey) delete hook.$$hashKey;
			for(var i=0;i<data.length;i++){
				if(data[i].url == hook.url && data[i].method.toUpperCase() == hook.method.toUpperCase()){
					data[i] = hook;
					break;
				}
			}
			fs.writeFileSync(hookFile, JSON.stringify(data, null, "\t"));
			res.end(JSON.stringify(data));
		});
		return true;
	} else if(pathname == "/cleanCache"){
		var ip = getParam(query, "ip");
		var isBindIp = ip ? checkBindIp(clientIp, ip) : true;
		res.writeHead(200, {"Content-Type": "application/json"})
		if(isBindIp) {
			var cleanIp = ip || clientIp;
			var cacheData = util.getCacheData();
			if (cacheData && cacheData[cleanIp]) {
				delete cacheData[cleanIp];
			}
			res.end(JSON.stringify({code:200}));
		}else{
			res.end(JSON.stringify({code:401}));
		}
	} else {
		return false;
	}
}
function getVender(req, res) {
	var urlParse = url.parse(req.url);
	var pathname = urlParse.pathname;
	if (pathname.indexOf("/bower_components") == 0) {
		fs.readFile(__dirname + "/.." + pathname, function (err, data) {
			res.end(data)
		});
		return true;
	} else {
		return false;
	}
}

function hookAction(req, res, cb){
	var clientIp = util.getIp(req.connection.remoteAddress);
	var urlParse = url.parse(req.url);
	var ip = getParam(urlParse.query, "ip");
	var isBindIp = ip ? checkBindIp(clientIp, ip) : false;
	if(!isBindIp){
		res.end(JSON.stringify({code:401}));
		return true;
	}
	var body = '';
	req.on('data', function (data) {
		body += data;
		if (body.length > 1e6)
			req.connection.destroy();
	});

	req.on('end', function () {
		var hook = JSON.parse(body);
		res.writeHead(200, {"Content-Type": "application/json"});
		var hookFile = __dirname + "/../data/"+ ip +"_hook.json";
		if(!fs.existsSync(hookFile)){
			fs.writeFileSync(hookFile, "[]");
		}
		var data = JSON.parse(fs.readFileSync(hookFile));
		var exist = null;
		for(var i=0;i<data.length;i++){
			if(data[i].url == hook.url && data[i].method.toUpperCase() == hook.method.toUpperCase()){
				exist = data[i];
				break;
			}
		}
		cb(exist, data, hookFile, hook);
	});
}
module.exports = function (req, res) {
	if(!localHostname) {
		var serverIp = util.getIp(require("ip").address());
		localHostname = serverIp;
	}
	var urlParse = url.parse(req.url);
	var port = urlParse.port;
	if (!urlParse.hostname || (localHostname && urlParse.hostname == localHostname && localPort && localPort == port)) {
		if (getLog(req, res) || getVender(req, res)) {

		} else {
			res.writeHead(200, {"Content-Type": "text/html"})
			res.end("You are not supposed to visit this url!");
		}
		return true;
	}
}