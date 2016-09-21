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

module.exports = {
	/**
	 * @method wrapRequestCallback
	 * @param {Function} callback
	 * @return {Function}
	 */
	wrapRequestCallback: function (callback) {
		return function (err, response, body) {
			response.body = body;

			if (err || response.statusCode >= 400) {
				callback(err || body, response);
			} else {
				callback(null, response);
			}
		};
	},
};
