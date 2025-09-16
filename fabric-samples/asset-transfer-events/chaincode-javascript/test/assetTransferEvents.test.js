/*
 * Copyright IBM Corp. All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
*/

'use strict';
const sinon = require('sinon');
const chai = require('chai');
const sinonChai = require('sinon-chai');
const expect = chai.expect;

const { Context } = require('fabric-contract-api');
const { ChaincodeStub, ClientIdentity } = require('fabric-shim');

const AssetTransfer = require('../lib/assetTransferEvents.js');

let assert = sinon.assert;
chai.use(sinonChai);

describe('Asset Transfer Events Tests', () => {
	let transactionContext, chaincodeStub, clientIdentity, asset;
	let transientMap, asset_properties;

	beforeEach(() => {
		transactionContext = new Context();

		chaincodeStub = sinon.createStubInstance(ChaincodeStub);
		chaincodeStub.getMspID.returns('org1');
		transactionContext.setChaincodeStub(chaincodeStub);

		clientIdentity = sinon.createStubInstance(ClientIdentity);
		clientIdentity.getMSPID.returns('org1');
		transactionContext.clientIdentity = clientIdentity;

		chaincodeStub.putState.callsFake((key, value) => {
			if (!chaincodeStub.states) {
				chaincodeStub.states = {};
			}
			chaincodeStub.states[key] = value;
		});

		chaincodeStub.getState.callsFake(async (key) => {
			let ret;
			if (chaincodeStub.states) {
				ret = chaincodeStub.states[key];
			}
			return Promise.resolve(ret);
		});

		chaincodeStub.deleteState.callsFake(async (key) => {
			if (chaincodeStub.states) {
				delete chaincodeStub.states[key];
			}
			return Promise.resolve(key);
		});

		chaincodeStub.getStateByRange.callsFake(async () => {
			function* internalGetStateByRange() {
				if (chaincodeStub.states) {
					// Shallow copy
					const copied = Object.assign({}, chaincodeStub.states);

					for (let key in copied) {
						yield { value: copied[key] };
					}
				}
			}

			return Promise.resolve(internalGetStateByRange());
		});

		asset = {
			ID: 'asset1',
			Color: 'blue',
			Size: 5,
			Owner: 'Tomoko',
			AppraisedValue: 300,
		};
		const randomNumber = Math.floor(Math.random() * 100) + 1;
		asset_properties = {
			object_type: 'asset_properties',
			asset_id: 'asset1',
			Price: '90',
			salt: Buffer.from(randomNumber.toString()).toString('hex')
		};
		transientMap = new Map();
		transientMap.set('asset_properties', Buffer.from(JSON.stringify(asset_properties)));
	});

	describe('Test CreateAsset', () => {
		it('should return error on CreateAsset', async () => {
			chaincodeStub.putState.rejects('failed inserting key');

			let assetTransfer = new AssetTransfer();
			try {
				await assetTransfer.CreateAsset(transactionContext, asset.ID, asset.Color, asset.Size, asset.Owner, asset.AppraisedValue);
				assert.fail('CreateAsset should have failed');
			} catch (err) {
				expect(err.name).to.equal('failed inserting key');
			}
		});

		it('should return success on CreateAsset', async () => {
			let assetTransfer = new AssetTransfer();

			await assetTransfer.CreateAsset(transactionContext, asset.ID, asset.Color, asset.Size, asset.Owner, asset.AppraisedValue);

			let ret = JSON.parse((await chaincodeStub.getState(asset.ID)).toString());
			expect(ret).to.eql(asset);
		});
		it('should return success on CreateAsset with transient data', async () => {
			let assetTransfer = new AssetTransfer();
			chaincodeStub.getTransient.returns(transientMap);
			await assetTransfer.CreateAsset(transactionContext, asset.ID, asset.Color, asset.Size, asset.Owner, asset.AppraisedValue);

			let ret = JSON.parse((await chaincodeStub.getState(asset.ID)).toString());
			expect(ret).to.eql(asset);
		});
	});

	describe('Test ReadAsset', () => {
		it('should return error on ReadAsset', async () => {
			let assetTransfer = new AssetTransfer();
			await assetTransfer.CreateAsset(transactionContext, asset.ID, asset.Color, asset.Size, asset.Owner, asset.AppraisedValue);

			try {
				await assetTransfer.ReadAsset(transactionContext, 'asset2');
				assert.fail('ReadAsset should have failed');
			} catch (err) {
				expect(err.message).to.equal('The asset asset2 does not exist');
			}
		});

		it('should return success on ReadAsset', async () => {
			let assetTransfer = new AssetTransfer();
			await assetTransfer.CreateAsset(transactionContext, asset.ID, asset.Color, asset.Size, asset.Owner, asset.AppraisedValue);
			const assetString = await assetTransfer.ReadAsset(transactionContext, 'asset1');
			const readAsset = JSON.parse(assetString);
			expect(readAsset).to.eql(asset);
		});

		it('should return success on ReadAsset with private data', async () => {
			asset.asset_properties = asset_properties;
			let assetTransfer = new AssetTransfer();
			await assetTransfer.CreateAsset(transactionContext, asset.ID, asset.Color, asset.Size, asset.Owner, asset.AppraisedValue);
			chaincodeStub.getPrivateData.returns(Buffer.from(JSON.stringify(asset_properties)));
			const assetString = await assetTransfer.ReadAsset(transactionContext, 'asset1');
			const readAsset = JSON.parse(assetString);
			expect(readAsset).to.eql(asset);
		});
	});

	describe('Test UpdateAsset', () => {
		it('should return error on UpdateAsset', async () => {
			let assetTransfer = new AssetTransfer();
			await assetTransfer.CreateAsset(transactionContext, asset.ID, asset.Color, asset.Size, asset.Owner, asset.AppraisedValue);

			try {
				await assetTransfer.UpdateAsset(transactionContext, 'asset2', 'orange', 10, 'Me', 500);
				assert.fail('UpdateAsset should have failed');
			} catch (err) {
				expect(err.message).to.equal('The asset asset2 does not exist');
			}
		});

		it('should return success on UpdateAsset', async () => {
			let assetTransfer = new AssetTransfer();
			await assetTransfer.CreateAsset(transactionContext, asset.ID, asset.Color, asset.Size, asset.Owner, asset.AppraisedValue);

			await assetTransfer.UpdateAsset(transactionContext, 'asset1', 'orange', 10, 'Me', 500);
			let ret = JSON.parse(await chaincodeStub.getState(asset.ID));
			let expected = {
				ID: 'asset1',
				Color: 'orange',
				Size: 10,
				Owner: 'Me',
				AppraisedValue: 500
			};
			expect(ret).to.eql(expected);
		});
	});

	describe('Test DeleteAsset', () => {
		it('should return error on DeleteAsset', async () => {
			let assetTransfer = new AssetTransfer();
			await assetTransfer.CreateAsset(transactionContext, asset.ID, asset.Color, asset.Size, asset.Owner, asset.AppraisedValue);

			try {
				await assetTransfer.DeleteAsset(transactionContext, 'asset2');
				assert.fail('DeleteAsset should have failed');
			} catch (err) {
				expect(err.message).to.equal('The asset asset2 does not exist');
			}
		});

		it('should return success on DeleteAsset', async () => {
			let assetTransfer = new AssetTransfer();
			await assetTransfer.CreateAsset(transactionContext, asset.ID, asset.Color, asset.Size, asset.Owner, asset.AppraisedValue);

			await assetTransfer.DeleteAsset(transactionContext, asset.ID);
			let ret = await chaincodeStub.getState(asset.ID);
			expect(ret).to.equal(undefined);
		});
	});

	describe('Test VerifyProject', () => {
		it('should verify an active project by an NCCR', async () => {
			const assetTransfer = new AssetTransfer();

			// Add mock verifier user (NCCR)
			const verifierId = 'nccrUser';
			const verifier = {
				userId: verifierId,
				role: 'NCCR',
				name: 'Verifier',
				email: 'verifier@example.com'
			};
			await chaincodeStub.putState(verifierId, Buffer.from(JSON.stringify(verifier)));

			// Add mock project
			const projectId = 'proj123';
			const project = {
				projectId: projectId,
				ngoId: 'ngo1',
				name: 'Reforestation',
				location: 'Area 51',
				description: 'Planting trees',
				startDate: '2023-01-01',
				endDate: '2023-12-31',
				crop: 'Trees',
				totalArea: 100,
				status: 'ACTIVE',
				createdAt: new Date().toISOString()
			};
			await chaincodeStub.putState(projectId, Buffer.from(JSON.stringify(project)));

			// Run verification
			const resultStr = await assetTransfer.VerifyProject(transactionContext, projectId, verifierId, 'Looks good');
			const result = JSON.parse(resultStr);

			expect(result.status).to.equal('VERIFIED');
			expect(result.verifiedBy).to.equal(verifierId);
			expect(result).to.have.property('verifiedAt');
		});

		it('should reject verification by a FARMER (unauthorized)', async () => {
			const assetTransfer = new AssetTransfer();

			// Mock FARMER user
			const farmerId = 'farmer1';
			const farmer = {
				userId: farmerId,
				role: 'FARMER',
				name: 'Joe',
				email: 'joe@example.com'
			};
			await chaincodeStub.putState(farmerId, Buffer.from(JSON.stringify(farmer)));

			// Mock project
			const projectId = 'proj456';
			const project = {
				projectId: projectId,
				ngoId: 'ngo2',
				name: 'Soil Restoration',
				location: 'Area 52',
				description: 'Fixing soil',
				startDate: '2023-02-01',
				endDate: '2023-11-30',
				crop: 'Cover Crops',
				totalArea: 50,
				status: 'ACTIVE',
				createdAt: new Date().toISOString()
			};
			await chaincodeStub.putState(projectId, Buffer.from(JSON.stringify(project)));

			// Try verification
			try {
				await assetTransfer.VerifyProject(transactionContext, projectId, farmerId, 'Trying to verify');
				assert.fail('FARMER should not be allowed to verify a project');
			} catch (err) {
				expect(err.message).to.equal('Only NCCR or AUDITOR can verify projects');
			}
		});

		it('should fail verifying a non-existent project', async () => {
			const assetTransfer = new AssetTransfer();

			// Mock verifier
			const verifierId = 'auditor1';
			const verifier = {
				userId: verifierId,
				role: 'AUDITOR',
				name: 'Auditor',
				email: 'audit@example.com'
			};
			await chaincodeStub.putState(verifierId, Buffer.from(JSON.stringify(verifier)));

			try {
				await assetTransfer.VerifyProject(transactionContext, 'nonexistent_project', verifierId, 'Invalid');
				assert.fail('Should have thrown project not found');
			} catch (err) {
				expect(err.message).to.equal('Project nonexistent_project does not exist');
			}
		});

		it('should not verify project with invalid status', async () => {
			const assetTransfer = new AssetTransfer();

			const verifierId = 'nccrUser2';
			const verifier = {
				userId: verifierId,
				role: 'NCCR',
				name: 'Verifier2',
				email: 'verifier2@example.com'
			};
			await chaincodeStub.putState(verifierId, Buffer.from(JSON.stringify(verifier)));

			const projectId = 'proj789';
			const project = {
				projectId: projectId,
				ngoId: 'ngo3',
				name: 'Flood Recovery',
				location: 'Zone A',
				description: 'Mitigation work',
				startDate: '2023-03-01',
				endDate: '2023-09-30',
				crop: 'Rice',
				totalArea: 75,
				status: 'INACTIVE', // invalid status for verification
				createdAt: new Date().toISOString()
			};
			await chaincodeStub.putState(projectId, Buffer.from(JSON.stringify(project)));

			try {
				await assetTransfer.VerifyProject(transactionContext, projectId, verifierId, 'Status not ACTIVE');
				assert.fail('Should have thrown for invalid project status');
			} catch (err) {
				expect(err.message).to.equal('Cannot verify project with status: INACTIVE');
			}
		});
	});


	describe('Test TransferAsset', () => {
		it('should return error on TransferAsset', async () => {
			let assetTransfer = new AssetTransfer();
			await assetTransfer.CreateAsset(transactionContext, asset.ID, asset.Color, asset.Size, asset.Owner, asset.AppraisedValue);

			try {
				await assetTransfer.TransferAsset(transactionContext, 'asset2', 'Me');
				assert.fail('DeleteAsset should have failed');
			} catch (err) {
				expect(err.message).to.equal('The asset asset2 does not exist');
			}
		});

		it('should return success on TransferAsset', async () => {
			let assetTransfer = new AssetTransfer();
			await assetTransfer.CreateAsset(transactionContext, asset.ID, asset.Color, asset.Size, asset.Owner, asset.AppraisedValue);

			await assetTransfer.TransferAsset(transactionContext, asset.ID, 'Me');
			let ret = JSON.parse((await chaincodeStub.getState(asset.ID)).toString());
			expect(ret).to.eql(Object.assign({}, asset, { Owner: 'Me' }));
		});
	});
});
