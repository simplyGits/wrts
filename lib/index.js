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

var utils = require('./utils.js');
var request = utils.request;
var wrapRequestCallback = utils.wrapRequestCallback;
var List = require('./list.js');
var Result = require('./result.js');

/*
 * @class Wrts
 * @constructor
 * @private
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
		var parseDate = function (str) {
			var splitted = str.split('-');
			return new Date(splitted[0], splitted[1] - 1, splitted[2]);
		};

		request.get('http://www.wrts.nl/user.json', wrapRequestCallback(function (err, res) {
			if (err) {
				callback(err, null);
			} else {
				var info = JSON.parse(res.body);
				info.last_seen_on = new Date(info.last_seen_on);
				info.birthday = parseDate(info.birthday);
				callback(null, info);
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

	/*
	 * Gets the lists of the current user.
	 * @method getLists
	 * @param {Function} callback
	 * 	@param {Error|null} callback.err
	 * 	@param {List[]|null} callback.res
	 */
	Wrts.prototype.getLists = function (callback) {
		request.get('http://www.wrts.nl/lists/', wrapRequestCallback(function (err, res) {
			if (err) {
				callback(err, null);
			} else {
				var lists = JSON.parse(res.body);
				lists.forEach(function (list) {
					list.created_at = new Date(list.created_at);
					Object.setPrototypeOf(list, List.prototype);
				});
				callback(null, lists);
			}
		}));
	};

	/*
	 * Gets the results of tests on lists for the current user.
	 * @method getResults
	 * @param {Function} callback
	 * 	@param {Error|null} callback.err
	 * 	@param {Result[]|null} callback.res
	 */
	Wrts.prototype.getResults = function (callback) {
		request.get('http://www.wrts.nl/results/', wrapRequestCallback(function (err, res) {
			if (err) {
				callback(err, null);
			} else {
				var results = JSON.parse(res.body);
				results.forEach(function (result) {
					result.created_at = new Date(result.created_at);
					Object.setPrototypeOf(result, Result.prototype);
				});
				callback(null, results);
			}
		}));
	};

	return Wrts;
})();

module.exports = function (email, password, callback) {
	utils.request = request = request.defaults({
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

module.exports.Wrts = Wrts;
module.exports.List = List;
module.exports.Result = Result;
