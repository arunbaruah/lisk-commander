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
import { flags as flagParser } from '@oclif/command';
import elements from 'lisk-elements';
import BaseCommand from '../../../base';
import commonOptions from '../../../utils/options';
import getInputsFromSources from '../../../utils/input';
import { validateLifetime, validateMinimum } from '../../../utils/helpers';

const processInputs = (lifetime, minimum, keysgroup) => ({
	passphrase,
	secondPassphrase,
}) =>
	elements.transaction.registerMultisignature({
		passphrase,
		secondPassphrase,
		keysgroup,
		lifetime,
		minimum,
	});

export default class MultisignatureCommand extends BaseCommand {
	async run() {
		const {
			args: { lifetime, minimum, keysgroup },
			flags: {
				passphrase: passphraseSource,
				'second-passphrase': secondPassphraseSource,
				'no-signature': noSignature,
			},
		} = this.parse(MultisignatureCommand);

		elements.transaction.utils.validatePublicKeys(keysgroup);

		validateLifetime(lifetime);
		validateMinimum(minimum);

		const transactionLifetime = parseInt(lifetime, 10);
		const transactionMinimumConfirmations = parseInt(minimum, 10);
		const processFunction = processInputs(
			transactionLifetime,
			transactionMinimumConfirmations,
			keysgroup,
		);

		if (noSignature) {
			const result = processFunction({
				passphrase: null,
				secondPassphrase: null,
			});
			return this.print(result);
		}

		const inputs = await getInputsFromSources({
			passphrase: {
				source: passphraseSource,
				repeatPrompt: true,
			},
			secondPassphrase: !secondPassphraseSource
				? null
				: {
						source: secondPassphraseSource,
						repeatPrompt: true,
					},
		});
		const result = processFunction(inputs);
		return this.print(result);
	}
}

MultisignatureCommand.args = [
	{
		name: 'lifetime',
		required: true,
		description: 'Lifetime of the transaction to stay in the transaction pool.',
	},
	{
		name: 'minimum',
		required: true,
		description: 'Minimum number of signature required to be valid.',
	},
	{
		name: 'keysgroup',
		required: true,
		description: 'Public key to include in the multi signature account.',
		parse: input => input.split(','),
	},
];

MultisignatureCommand.flags = {
	...BaseCommand.flags,
	passphrase: flagParser.string(commonOptions.passphrase),
	'second-passphrase': flagParser.string(commonOptions.secondPassphrase),
	'no-signature': flagParser.boolean(commonOptions.noSignature),
};

MultisignatureCommand.description = `
Creates a transaction which will register the account as a multisignature account if broadcast to the network, using the following parameters:
	- The lifetime (the number of hours in which the transaction can be signed after being created).
	- The minimum number of distinct signatures required for a transaction to be successfully approved from the multisignature account.
	- A list of one or more public keys that will identify the multisignature group.
`;

MultisignatureCommand.examples = [
	'transaction:create:multisignature 24 2 215b667a32a5cd51a94c9c2046c11fffb08c65748febec099451e3b164452bca,922fbfdd596fa78269bbcadc67ec2a1cc15fc929a19c462169568d7a3df1a1aa',
];
