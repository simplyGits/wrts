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

var wrapRequestCallback = require('./utils.js').wrapRequestCallback;

/**
 * @class List
 * @constructor
 * @param {Wrts} wrts
 */
module.exports = (function () {
	var List = function (wrts) {
		this._wrts = wrts;
	};

	/**
	 * @method update
	 * @param {Function} callback
	 */
	List.prototype.update = function (callback) {
		var url = 'https://wrts.nl/lists/' + this.id;
		this._wrts.request.put(url, {
			json: true,
			body: this,
		}, wrapRequestCallback(function (err, res) {
			if (err) {
				callback(err, null);
			} else {
				callback(null, res);
			}
		}));
	};

	/**
	 * Removes the current list.
	 * @method remove
	 * @param {Function} [callback]
	 */
	List.prototype.remove = function (callback) {
		var url = 'https://wrts.nl/lists/' + this.id;
		this._wrts.request.del(url, wrapRequestCallback(function (err) {
			callback && callback(err === null);
		}));
	};

	List.parse = function (list) {
		list.created_at = new Date(list.created_at);
		Object.setPrototypeOf(list, List.prototype);
		return list;
	};

	return List;
})();
