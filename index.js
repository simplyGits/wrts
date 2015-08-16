/*
 * node.js library for wrts.nl
 * Copyright (C) 2015 by simply
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

'use strict';

var request = require('request');

/**
 * Parses the given `str` as JSON, also replace snake_case to camelCase.
 * @method parseJson
 * @private
 * @param {String} str The string to parse.
 * @return {Object|Array} `str`, but parsed.
 */
function parseJson (str) {
	var snakeToCamel = function (val) {
		if (val.length) { // Also support non-arrays!
			var res = new Array(val.length);
			for (var i = 0; i < val.length; i++) {
				res[i] = snakeToCamel(val[i]);
			}
			return res;
		} else if (val != null && typeof val === 'object') {
			var res = {};
			for (var key in val) {
				var newKey = key.replace(/_([a-zA-Z])/g, function (_, char) {
					return char.toUpperCase();
				});
				res[newKey] = val[key];
			}
			return res;
		} else {
			return val;
		}
	};

	return snakeToCamel(JSON.parse(str));
}

/*
 * Wraps the given callback to a ugly request callback
 * @method wrapRequestCallback
 * @private
 * @param {Function} callback
 * 	@param {Error|null} err If there is an error, the error. Otherwise `null`.
 * 	@param {Response|null} res If tere is an error, null. Otherwise the response object.
 * 		@param {String} res.body
 * @return {Function} Ugly request callback.
 */
function wrapRequestCallback (callback) {
	return function (err, response, body) {
		response.body = body;

		if (err || response.statusCode >= 400) {
			callback(err || body, response);
		} else {
			callback(null, response);
		}
	};
}

/*
 * @class Wrts
 * @constructor
 */
var Wrts = (function () {
	var Wrts = function () {
		if (!(this instanceof Wrts)) {
			return new Wrts();
		}
	};

	/*
	 * Gets info about the current user.
	 * @method getUserInfo
	 * @param {Function} callback
	 */
	Wrts.prototype.getUserInfo = function (callback) {
		request.get('http://wrts.nl/user.json', wrapRequestCallback(function (err, res) {
			if (err) {
				callback(err, null);
			} else {
				callback(null, parseJson(res.body));
			}
		}));
	};

	/*
	 * Gets schools in the given `city`.
	 * @method getUserInfo
	 * @param {String} city
	 * @param {Function} callback
	 */
	Wrts.prototype.getSchools = function (city, callback) {
		city = encodeURIComponent(city);
		var url = 'http://wrts.nl/update_schools?place=' + city;
		request.get(url, wrapRequestCallback(function (err, res) {
			if (err) {
				callback(err, null);
			} else {
				var parsed = JSON.parse(res.body)[0];
				callback(null, parsed.slice(1, parsed.length - 1));
			}
		}));
	};

	Wrts.prototype.getLists = function (callback) {
		request.get('http://www.wrts.nl/lists/', wrapRequestCallback(function (err, res) {
			if (err) {
				callback(err, null);
			} else {
				callback(null, parseJson(res.body));
			}
		}));
	};

	return Wrts;
})();

module.exports = function (email, password, callback) {
	request = request.defaults({
		auth: {
			user: email,
			pass: password,
			sendImmediately: false,
		},
	});

	// simple test to check if the given `email` and `password` are correct.
	request.get('http://wrts.nl/user.json', function (err, response) {
		if (err) {
			callback(err, null);
		} else if (response.statusCode !== 200) {
			callback(response.statusCode, null);
		} else {
			callback(null, new Wrts());
		}
	});
};
