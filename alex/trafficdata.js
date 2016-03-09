/**
 * Created by harry on 15/12/28.
 */

var BufferHelper = require('bufferhelper');
var iconv = require('iconv-lite');
var moment = require('moment');
var zlib = require('zlib');
var config = require('config');
var uuid = require('node-uuid');
var util = require("./util");


function isJson(res) {
	var result = false;
	util.eachHeader(res, function (key, value) {
		if (key.toLowerCase() == "content-type" && (value.indexOf("json") > -1 || value.indexOf("javascript") > -1)) {
			result = true;
		}
	})
	return result;
}
function isHtml(res) {
	var result = false;
	util.eachHeader(res, function (key, value) {
		if (key.toLowerCase() == "content-type" && value.indexOf("html") > -1) {
			result = true;
		}
	})
	return result;
}
function isImage(res) {
	var result = false;
	util.eachHeader(res, function (key, value) {
		if (key.toLowerCase() == "content-type" && value.indexOf("image") > -1) {
			result = true;
		}
	})
	return result;
}

module.exports = function (req, res, proxyRes, postBody) {
	var cacheData = util.getCacheData();
	var clientIp = util.getIp(req.connection.remoteAddress);
	cacheData[clientIp] = cacheData[clientIp] || [];
	var bufferHelper = new BufferHelper();
	if (proxyRes.headers['content-encoding'] == 'gzip') {
		var gzip = zlib.createGunzip();
		proxyRes.pipe(gzip);
		output = gzip;
	} else {
		output = proxyRes;
	}

	output.on('data', function (chunk) {
		bufferHelper.concat(chunk);
	});
	output.on('end', function () {
		var data = iconv.decode(bufferHelper.toBuffer(), 'utf-8');
		var isjson = isJson(proxyRes);
		var ishtml = isHtml(proxyRes);
		var isimage = isImage(proxyRes);
		console.log(req.method, ":", req.url);
		var body = "";
		if (isjson) {
			try {
				body = JSON.parse(data);
			} catch (e) {
				try {
					eval("body = " + data);
				} catch (e) {
					body = data;
				}
			}
		} else if (ishtml) {
			body = data;
		}
		cacheData[clientIp].push({
			resHeaders: proxyRes.headers,
			reqHeaders: req.headers,
			body: body,
			method: req.method,
			url: req.url,
			time: moment().format("HH:mm:ss"),
			ip: clientIp,
			statusCode : proxyRes.statusCode,
			id : uuid.v1(),
			postBody : postBody.join("")
		});
		if(cacheData.length > 1000){
			cacheData.splice(0, cacheData.length - 1000);
		}
	});
}