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

var expect = require('chai').expect;
var wrts = require('../');
var options = null;

try {
	options = require('./testOptions.json');
} catch (e) { // For Travis CI we use environment variables.
	options = {};

	options.email = process.env.TEST_EMAIL;
	options.password = process.env.TEST_PASSWORD;
}
if (options.email == null || options.password == null) {
	throw new Error('No login information found.');
}

describe('wrts', function () {
	var x;

	before(function (done) {
		wrts(options.email, options.password, function (e, r) {
			x = r;
			done(e);
		});
	});

	it('should login', function () {
		expect(x).to.be.an('object');
	});

	it('should get user info', function (done) {
		x.getUserInfo(function (e, r) {
			expect(r).to.be.an('object');
			expect(r.email).to.equal(options.email);
			done(e);
		});
	});

	it('should get lists', function (done) {
		x.getLists(function (e, r) {
			expect(r).to.be.an('array');
			done(e);
		});
	});

	it('should get schools', function (done) {
		x.getSchools('Wassenaar', function (e, r) {
			expect(e).to.not.exist;
			expect(r).to.be.an('array');
			expect(r).to.not.be.empty;
			done();
		});
	});
});
