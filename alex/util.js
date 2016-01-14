/**
 * Created by harry on 15/12/28.
 */
var cacheData = {};
module.exports = {
	getIpRegExp : function () {
		return /(\d{1,3}\.){3}\d{1,3}/;
	},
	getIp : function(ip) {
		return (ip.match(this.getIpRegExp()) || ["127.0.0.1"])[0];
	},
	getCacheData : function () {
		return cacheData;
	},

	/**
	 * Iterator function for the request/response's "headers".
	 * Invokes `fn` for "each" header entry in the request.
	 *
	 * @api private
	 */

	eachHeader : function (obj, fn) {
		if (Array.isArray(obj.rawHeaders)) {
			// ideal scenario... >= node v0.11.x
			// every even entry is a "key", every odd entry is a "value"
			var key = null;
			obj.rawHeaders.forEach(function (v) {
				if (key === null) {
					key = v;
				} else {
					fn(key, v);
					key = null;
				}
			});
		} else {
			// otherwise we can *only* proxy the header names as lowercase'd
			var headers = obj.headers;
			if (!headers) return;
			Object.keys(headers).forEach(function (key) {
				var value = headers[key];
				if (Array.isArray(value)) {
					// set-cookie
					value.forEach(function (val) {
						fn(key, val);
					});
				} else {
					fn(key, value);
				}
			});
		}
	}
};