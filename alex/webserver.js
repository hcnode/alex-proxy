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
	if (pathname == "/getQr") {
		var qrData = getParam(query, "url");
		var qrUrl = "http://apis.baidu.com/3023/qr/qrcode?size=8&qr="+ (qrData);
		console.log(qrUrl)
		var parsed = url.parse(qrUrl);
		parsed.method = "get";
		parsed.headers = {
			apikey : "0585d369197034fe566d98ab2742bb30"
		};
		var qrReq = http.request(parsed);

		qrReq.on('response', function (qrRes) {
			var data = "";
			qrRes.on('data', function (chunk) {
				data += chunk.toString();
			});
			qrRes.on('end', function () {
				if(data){
					res.writeHead(200, {"Content-Type": "application/json"})
					res.end(data);
				}
			});
		});
		qrReq.end();

		return true;
	}else if (pathname == "/bindIp") {
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

			fs.writeFile(ipBindFile, JSON.stringify(json), function (err) {
				res.writeHead(200, {"Content-Type": "application/json"})
				res.end(JSON.stringify({
					code : 200,
					data : json[clientIp]
				}));
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
module.exports = function (req, res) {
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