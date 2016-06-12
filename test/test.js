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

var expect = require('chai').expect;
var wrts = require('../');
var Wrts = wrts.Wrts;
var List = wrts.List;
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
		expect(x).to.be.an.instanceof(Wrts);
	});

	it('should get user info', function (done) {
		x.getUserInfo(function (e, r) {
			expect(e).to.not.exist;
			expect(r).to.be.an('object');
			expect(r.email).to.equal(options.email);
			done();
		});
	});

	describe('lists', function () {
		it('should get lists', function (done) {
			x.getLists(function (e, r) {
				expect(e).to.not.exist;
				expect(r).to.be.an('array');
				expect(r[0]).to.be.an.instanceof(List);
				expect(r[0].created_at).to.be.a('date');
				done();
			});
		});
	});

	describe('schools', function () {
		it('should get schools', function (done) {
			x.getSchools('Wassenaar', function (e, r) {
				expect(e).to.not.exist;
				expect(r).to.be.an('array');
				expect(r).to.not.be.empty;
				done();
			});
		});
	});

	describe('tests', function () {
		it('should get test results', function (done) {
			x.getResults(function (e, r) {
				expect(e).to.not.exist;
				expect(r).to.be.an('array');
				done();
			});
		});
	});
});
