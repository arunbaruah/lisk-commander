/*
 * LiskHQ/lisk-commander
 * Copyright © 2017–2018 Lisk Foundation
 *
 * See the LICENSE file at the top-level directory of this distribution
 * for licensing information.
 *
 * Unless otherwise agreed in a custom licensing agreement with the Lisk Foundation,
 * no part of this software, including this file, may be copied, modified,
 * propagated, or distributed except according to the terms contained in the
 * LICENSE file.
 *
 * Removal or modification of this copyright notice is prohibited.
 *
 */
import { expect, test } from '../../test';
import * as config from '../../../src/utils/config';
import * as print from '../../../src/utils/print';
import * as api from '../../../src/utils/api';

describe('node:get', () => {
	const defaultGetConstantsResponse = {
		data: {
			version: '1.0.0',
		},
	};
	const defaultGetStatusResponse = {
		data: {
			height: 3,
		},
	};
	const defaultForgingStatusResponse = {
		data: [
			{
				publicKey:
					'2ca9a7143fc721fdc540fef893b27e8d648d2288efa61e56264edf01a2c23079',
				forging: true,
			},
		],
	};

	const apiClientStub = {
		node: {
			getConstants: sandbox.stub().resolves(defaultGetConstantsResponse),
			getStatus: sandbox.stub().resolves(defaultGetStatusResponse),
			getForgingStatus: sandbox.stub().resolves(defaultForgingStatusResponse),
		},
	};

	const printMethodStub = sandbox.stub();
	const setupStub = test
		.stub(print, 'default', sandbox.stub().returns(printMethodStub))
		.stub(config, 'getConfig', sandbox.stub().returns({}))
		.stub(api, 'default', sandbox.stub().returns(apiClientStub));

	describe('node:get', () => {
		setupStub
			.stub(
				apiClientStub.node,
				'getConstants',
				sandbox.stub().rejects(new Error('getConstants failed')),
			)
			.stdout()
			.command(['node:get'])
			.catch(error => expect(error.message).to.contain('getConstants failed'))
			.it('should throw error when getConstants fails');

		setupStub
			.stub(
				apiClientStub.node,
				'getStatus',
				sandbox.stub().rejects(new Error('getStatus failed')),
			)
			.stdout()
			.command(['node:get'])
			.catch(error => expect(error.message).to.contain('getStatus failed'))
			.it('should throw error when getStatus fails');

		setupStub
			.stdout()
			.command(['node:get'])
			.it('should get the node status without forging status', () => {
				expect(apiClientStub.node.getForgingStatus).not.to.be.called;
				return expect(printMethodStub).to.be.calledWithExactly(
					Object.assign(
						{},
						defaultGetConstantsResponse.data,
						defaultGetStatusResponse.data,
					),
				);
			});
	});

	describe('node:get --all', () => {
		const errorMessage = 'Error 403: Unautorized';
		setupStub
			.stub(
				apiClientStub.node,
				'getForgingStatus',
				sandbox.stub().rejects(new Error(errorMessage)),
			)
			.stdout()
			.command(['node:get', '--all'])
			.it('should get the node status with forging status error', () => {
				return expect(printMethodStub).to.be.calledWithExactly(
					Object.assign(
						{},
						defaultGetConstantsResponse.data,
						defaultGetStatusResponse.data,
						{
							forgingStatus: errorMessage,
						},
					),
				);
			});

		setupStub
			.stdout()
			.command(['node:get', '--all'])
			.it('should get the node status with forging status error', () => {
				return expect(printMethodStub).to.be.calledWithExactly(
					Object.assign(
						{},
						defaultGetConstantsResponse.data,
						defaultGetStatusResponse.data,
						{
							forgingStatus: defaultForgingStatusResponse.data,
						},
					),
				);
			});
	});
});
