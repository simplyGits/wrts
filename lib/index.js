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
var List = require('./list.js');
var wrapRequestCallback = require('./utils.js').wrapRequestCallback;

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
		request.get('http://www.wrts.nl/user.json', wrapRequestCallback(function (err, res) {
			if (err) {
				callback(err, null);
			} else {
				callback(null, JSON.parse(res.body));
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
		var url = 'http://www.wrts.nl/update_schools?place=' + city;
		request.get(url, wrapRequestCallback(function (err, res) {
			if (err) {
				callback(err, null);
			} else {
				var parsed = JSON.parse(res.body);
				var schools = parsed
					.slice(1, parsed.length - 1)
					.map(function (pair) {
						return {
							id: pair[1],
							name: pair[0],
						};
					});

				callback(null, schools);
			}
		}));
	};

	Wrts.prototype.getLists = function (callback) {
		request.get('http://www.wrts.nl/lists/', wrapRequestCallback(function (err, res) {
			if (err) {
				callback(err, null);
			} else {
				var lists = JSON.parse(res.body);
				lists.forEach(function (list) {
					Object.setPrototypeOf(list, List.prototype);
				});
				callback(null, lists);
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
			sendImmediately: true,
		},
	});

	// simple test to check if the given `email` and `password` are correct.
	request.get('http://www.wrts.nl/user.json', function (err, response) {
		if (err) {
			callback(err, null);
		} else if (response.statusCode !== 200) {
			callback(response.statusCode, null);
		} else {
			callback(null, new Wrts());
		}
	});
};
