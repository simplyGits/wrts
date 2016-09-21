/*
 * node.js library for wrts.nl
 * Copyright (C) 2016 by simply
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
var Request = require('request');
var wrapRequestCallback = utils.wrapRequestCallback;
var List = require('./list.js');
var Result = require('./result.js');

/**
 * @class Wrts
 * @constructor
 * @private
 * @param {Request} request
 */
var Wrts = (function () {
	var Wrts = function (request) {
		this.request = request;
	};

	/**
	 * Gets info about the current user.
	 * @method getUserInfo
	 * @param {Function} callback
	 */
	Wrts.prototype.getUserInfo = function (callback) {
		var parseDate = function (str) {
			var splitted = str.split('-');
			return new Date(splitted[0], splitted[1] - 1, splitted[2]);
		};

		this.request.get('https://www.wrts.nl/user.json', wrapRequestCallback(function (err, res) {
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

	/**
	 * Gets schools in the given `city`.
	 * @method getUserInfo
	 * @param {String} city
	 * @param {Function} callback
	 */
	Wrts.prototype.getSchools = function (city, callback) {
		city = encodeURIComponent(city);
		var url = 'https://www.wrts.nl/update_schools?place=' + city;
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

	/**
	 * Gets the lists of the current user.
	 * @method getLists
	 * @param {Function} callback
	 * 	@param {Error|null} callback.err
	 * 	@param {List[]|null} callback.res
	 */
	Wrts.prototype.getLists = function (callback) {
		this.request.get('https://www.wrts.nl/lists/', wrapRequestCallback(function (err, res) {
			if (err) {
				callback(err, null);
			} else {
				var lists = JSON.parse(res.body);
				lists = lists.map(List.parse);
				callback(null, lists);
			}
		}));
	};

	/**
	 * Gets the results of tests on lists for the current user.
	 * @method getResults
	 * @param {Function} callback
	 * 	@param {Error|null} callback.err
	 * 	@param {Result[]|null} callback.res
	 */
	Wrts.prototype.getResults = function (callback) {
		this.request.get('https://www.wrts.nl/results/', wrapRequestCallback(function (err, res) {
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

/**
 * @method wrts
 * @param {String} email
 * @param {String} password
 * @param {Function} callback
 * 	@param {Number|Object} [callback.error]
 * 	@param {Wrts} [callback.result]
 */
module.exports = function (email, password, callback) {
	var request = Request.defaults({
		jar: true,
	});

	request.get('https://www.wrts.nl/', wrapRequestCallback(function (err, res) {
		if (err != null) {
			callback(err, null);
			return;
		}

		var match = /<meta\s+content=('|")(.+?)\1\s*name=\1csrf-token\1\s*\/>/i.exec(res.body);
		if (match == null) {
			callback(new Error('CSRF token not found'), null);
			return;
		}

		request.post('https://wrts.nl/signin', {
			form: {
				'authenticity_token': match[2],
				'user_account[email]': email,
				'user_account[password]': password,
			},
		}, function (err, res) {
			if (err != null) {
				callback(err, null);
			} else if (res.statusCode !== 302) {
				callback(res.statusCode, null);
			} else {
				callback(null, new Wrts());
			}
		});
	}));
};

module.exports.Wrts = Wrts;
module.exports.List = List;
module.exports.Result = Result;
