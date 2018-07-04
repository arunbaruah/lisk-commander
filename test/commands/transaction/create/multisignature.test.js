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
import * as elements from 'lisk-elements';
import { expect, test } from '../../../test';
import * as config from '../../../../src/utils/config';
import * as print from '../../../../src/utils/print';
import * as getInputsFromSources from '../../../../src/utils/input';

describe('transaction:create:multisignature', () => {
	const defaultLifetime = '24';
	const defaultMinimum = '2';
	const defaultKeysgroup = [
		'215b667a32a5cd51a94c9c2046c11fffb08c65748febec099451e3b164452bca',
		'922fbfdd596fa78269bbcadc67ec2a1cc15fc929a19c462169568d7a3df1a1aa',
	];
	const defaultInputs = {
		passphrase: '123',
		secondPassphrase: '456',
	};
	const defaultTransaction = {
		amount: '10000000000',
		recipientId: '123L',
		senderPublicKey: null,
		timestamp: 66492418,
		type: 4,
		fee: '10000000',
		recipientPublicKey: null,
		asset: {},
	};

	const printMethodStub = sandbox.stub();
	const transactionUtilStub = {
		validatePublicKeys: sandbox.stub().returns(true),
	};

	const setupStub = () =>
		test
			.stub(print, 'default', sandbox.stub().returns(printMethodStub))
			.stub(config, 'getConfig', sandbox.stub().returns({}))
			.stub(
				elements.default.transaction,
				'registerMultisignature',
				sandbox.stub().returns(defaultTransaction),
			)
			.stub(elements.default.transaction, 'utils', transactionUtilStub)
			.stub(
				getInputsFromSources,
				'default',
				sandbox.stub().resolves(defaultInputs),
			);

	describe('transaction:create:multisignature', () => {
		setupStub()
			.stdout()
			.command(['transaction:create:multisignature'])
			.catch(error =>
				expect(error.message).to.contain('Missing 3 required args'),
			)
			.it('should throw an error');
	});

	describe('transaction:create:multisignature lifetime', () => {
		setupStub()
			.stdout()
			.command(['transaction:create:multisignature', defaultLifetime])
			.catch(error =>
				expect(error.message).to.contain('Missing 2 required args'),
			)
			.it('should throw an error');
	});

	describe('transaction:create:multisignature lifetime minimum', () => {
		setupStub()
			.stdout()
			.command([
				'transaction:create:multisignature',
				defaultLifetime,
				defaultMinimum,
			])
			.catch(error =>
				expect(error.message).to.contain('Missing 1 required arg'),
			)
			.it('should throw an error');
	});

	describe('transaction:create:multisignature lifetime minimum keysgroup', () => {
		setupStub()
			.stdout()
			.command([
				'transaction:create:multisignature',
				'life',
				defaultMinimum,
				defaultKeysgroup.join(','),
			])
			.catch(error =>
				expect(error.message).to.contain('Lifetime must be an integer.'),
			)
			.it('should throw an error when lifetime is not integer');

		setupStub()
			.stdout()
			.command([
				'transaction:create:multisignature',
				defaultLifetime,
				'minimum',
				defaultKeysgroup.join(','),
			])
			.catch(error =>
				expect(error.message).to.contain(
					'Minimum number of signatures must be an integer.',
				),
			)
			.it('should throw an error when minimum is not integer');

		setupStub()
			.stdout()
			.command([
				'transaction:create:multisignature',
				defaultLifetime,
				defaultMinimum,
				defaultKeysgroup.join(','),
			])
			.it('should create a multisignature transaction', () => {
				expect(transactionUtilStub.validatePublicKeys).to.be.calledWithExactly(
					defaultKeysgroup,
				);
				expect(getInputsFromSources.default).to.be.calledWithExactly({
					passphrase: {
						source: undefined,
						repeatPrompt: true,
					},
					secondPassphrase: null,
				});
				expect(
					elements.default.transaction.registerMultisignature,
				).to.be.calledWithExactly({
					passphrase: defaultInputs.passphrase,
					secondPassphrase: defaultInputs.secondPassphrase,
					keysgroup: defaultKeysgroup,
					lifetime: parseInt(defaultLifetime, 10),
					minimum: parseInt(defaultMinimum, 10),
				});
				return expect(printMethodStub).to.be.calledWithExactly(
					defaultTransaction,
				);
			});
	});

	describe('transaction:create:multisignature lifetime minimum keysgroup --passphrase=xxx', () => {
		setupStub()
			.stdout()
			.command([
				'transaction:create:multisignature',
				defaultLifetime,
				defaultMinimum,
				defaultKeysgroup.join(','),
				'--passphrase=pass:123',
			])
			.it('should create a multisignature transaction', () => {
				expect(transactionUtilStub.validatePublicKeys).to.be.calledWithExactly(
					defaultKeysgroup,
				);
				expect(getInputsFromSources.default).to.be.calledWithExactly({
					passphrase: {
						source: 'pass:123',
						repeatPrompt: true,
					},
					secondPassphrase: null,
				});
				expect(
					elements.default.transaction.registerMultisignature,
				).to.be.calledWithExactly({
					passphrase: defaultInputs.passphrase,
					secondPassphrase: defaultInputs.secondPassphrase,
					keysgroup: defaultKeysgroup,
					lifetime: parseInt(defaultLifetime, 10),
					minimum: parseInt(defaultMinimum, 10),
				});
				return expect(printMethodStub).to.be.calledWithExactly(
					defaultTransaction,
				);
			});
	});

	describe('transaction:create:multisignature lifetime minimum keysgroup --passphrase=xxx --second-passphrase=xxx', () => {
		setupStub()
			.stdout()
			.command([
				'transaction:create:multisignature',
				defaultLifetime,
				defaultMinimum,
				defaultKeysgroup.join(','),
				'--passphrase=pass:123',
				'--second-passphrase=pass:456',
			])
			.it(
				'should create a multisignature transaction with the passphrase and the second passphrase from the flag',
				() => {
					expect(
						transactionUtilStub.validatePublicKeys,
					).to.be.calledWithExactly(defaultKeysgroup);
					expect(getInputsFromSources.default).to.be.calledWithExactly({
						passphrase: {
							source: 'pass:123',
							repeatPrompt: true,
						},
						secondPassphrase: {
							source: 'pass:456',
							repeatPrompt: true,
						},
					});
					expect(
						elements.default.transaction.registerMultisignature,
					).to.be.calledWithExactly({
						passphrase: defaultInputs.passphrase,
						secondPassphrase: defaultInputs.secondPassphrase,
						keysgroup: defaultKeysgroup,
						lifetime: parseInt(defaultLifetime, 10),
						minimum: parseInt(defaultMinimum, 10),
					});
					return expect(printMethodStub).to.be.calledWithExactly(
						defaultTransaction,
					);
				},
			);
	});

	describe('transaction:create:multisignature lifetime minimum keysgroup --no-signature', () => {
		setupStub()
			.stdout()
			.command([
				'transaction:create:multisignature',
				defaultLifetime,
				defaultMinimum,
				defaultKeysgroup.join(','),
				'--no-signature',
			])
			.it(
				'should create a multisignature transaction without signature',
				() => {
					expect(
						transactionUtilStub.validatePublicKeys,
					).to.be.calledWithExactly(defaultKeysgroup);
					expect(getInputsFromSources.default).not.to.be.called;
					expect(
						elements.default.transaction.registerMultisignature,
					).to.be.calledWithExactly({
						passphrase: null,
						secondPassphrase: null,
						keysgroup: defaultKeysgroup,
						lifetime: parseInt(defaultLifetime, 10),
						minimum: parseInt(defaultMinimum, 10),
					});
					return expect(printMethodStub).to.be.calledWithExactly(
						defaultTransaction,
					);
				},
			);
	});
});
