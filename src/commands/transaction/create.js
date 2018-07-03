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
import BaseCommand from '../../base';
import { ValidationError } from '../../utils/error';
import TransferCommand from './create/transfer';
import SecondpassphraseCommand from './create/secondpassphrase';
import VoteCommand from './create/vote';
import DelegateCommand from './create/delegate';
import MultisignatureCommand from './create/multisignature';

const MAX_ARG_NUM = 3;

const resolveFlags = (accumulated, [key, value]) => {
	if (key === 'type') {
		return accumulated;
	}
	if (typeof value === 'string') {
		accumulated.push(`--${key}`, value);
		return accumulated;
	}
	const boolKey = value === false ? `--no-${key}` : `--${key}`;
	accumulated.push(boolKey);
	return accumulated;
};

export default class CreateCommand extends BaseCommand {
	async run() {
		const { argv, flags } = this.parse(CreateCommand);
		const { type } = flags;
		const resolvedFlags = Object.entries(flags).reduce(resolveFlags, []);
		if (type === '0' || type === 'transfer') {
			await TransferCommand.run([...argv, ...resolvedFlags]);
		} else if (type === '1' || type === 'secondpassphrase') {
			await SecondpassphraseCommand.run([...argv, ...resolvedFlags]);
		} else if (type === '2' || type === 'vote') {
			await VoteCommand.run([...argv, ...resolvedFlags]);
		} else if (type === '3' || type === 'delegate') {
			await DelegateCommand.run([...argv, ...resolvedFlags]);
		} else if (type === '4' || type === 'multisignature') {
			await MultisignatureCommand.run([...argv, ...resolvedFlags]);
		} else {
			throw new ValidationError('Invalid transaction type.');
		}
	}
}

CreateCommand.flags = {
	...BaseCommand.flags,
	type: flagParser.string({
		description: 'type of transaction to create',
		required: true,
	}),
};

CreateCommand.args = Array(MAX_ARG_NUM)
	.fill()
	.map(i => ({
		name: `${i}_arg`,
	}));

CreateCommand.description = `
Create transaction.
`;

CreateCommand.examples = [
	'transaction:create --type=0 100 13356260975429434553L',
	'transaction:create --type=delegate username',
];
