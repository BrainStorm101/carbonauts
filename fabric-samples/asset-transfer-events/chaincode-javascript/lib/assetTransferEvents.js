/*
 * Copyright IBM Corp. All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict';

const { Contract } = require('fabric-contract-api');

// Credit status constants
const CREDIT_STATUS = {
	AVAILABLE: 'AVAILABLE',
	FOR_SALE: 'FOR_SALE',
	SOLD_ESCROW: 'SOLD_ESCROW',
	FINALIZED: 'FINALIZED',
	REVOKED: 'REVOKED'
};

// Remove stringify function since we're using JSON.stringify directly

function sortKeysRecursive(obj) {
	if (typeof obj !== 'object' || obj === null) {
		return obj;
	}
	if (Array.isArray(obj)) {
		return obj.map(sortKeysRecursive);
	}
	const sortedKeys = Object.keys(obj).sort();
	const result = {};
	for (const key of sortedKeys) {
		result[key] = sortKeysRecursive(obj[key]);
	}
	return result;
}


class BlueCarbonRegistry extends Contract {

	// Initialize the ledger with default data
	async InitLedger(ctx) {
		console.info('============= START : Initialize Ledger ===========');

		// Initialize system configuration
		const systemConfig = {
			docType: 'systemConfig',
			version: '1.0.0',
			carbonCreditRate: 0.5, // Credits per tree planted
			auditPeriodDays: 30,
			escrowPeriodDays: 1, // Set to 1 day for testing
			minimumApprovals: 1, // Only NCCR approval required
			marketplaceFeePercent: 2.5 // Platform fee percentage
		};

		await ctx.stub.putState('SYSTEM_CONFIG', Buffer.from(JSON.stringify(sortKeysRecursive(systemConfig))));

		// Initialize user roles enum
		const userRoles = {
			FARMER: 'FARMER',
			NGO: 'NGO',
			NCCR: 'NCCR',
			INDUSTRY: 'INDUSTRY'
		};

		await ctx.stub.putState('USER_ROLES', Buffer.from(JSON.stringify(sortKeysRecursive(userRoles))));

		console.info('============= END : Initialize Ledger ===========');
	}

	// ==================== USER MANAGEMENT ====================

	async RegisterUser(ctx, userId, name, role, organization, contactInfo) {
		console.info('============= START : Register User ===========');

		// Check if user already exists
		const existingUserBytes = await ctx.stub.getState(userId);
		if (existingUserBytes && existingUserBytes.length > 0) {
			throw new Error(`User with ID '${userId}' already exists. Use a different user ID.`);
		}

		const userRolesBuffer = await ctx.stub.getState('USER_ROLES');
		const userRoles = JSON.parse(userRolesBuffer.toString());

		if (!Object.values(userRoles).includes(role)) {
			throw new Error(`Invalid role: ${role}`);
		}

		// Use deterministic timestamp from transaction
		const txTimestamp = ctx.stub.getTxTimestamp();
		const timestamp = new Date(txTimestamp.seconds * 1000).toISOString();

		const user = {
			docType: 'user',
			userId: userId,
			name: name,
			role: role,
			organization: organization,
			contactInfo: contactInfo,
			isActive: true,
			registeredAt: timestamp,
			verificationStatus: role === 'FARMER' ? 'PENDING' : 'VERIFIED'
		};

		await ctx.stub.putState(userId, Buffer.from(JSON.stringify(sortKeysRecursive(user))));

		// Emit event
		ctx.stub.setEvent('UserRegistered', Buffer.from(JSON.stringify(user)));

		console.info('============= END : Register User ===========');
		return JSON.stringify(user);
	}

	async GetUser(ctx, userId) {
		const userAsBytes = await ctx.stub.getState(userId);
		if (!userAsBytes || userAsBytes.length === 0) {
			throw new Error(`User ${userId} does not exist`);
		}
		return userAsBytes.toString();
	}

	async VerifyUser(ctx, userId, verifierId) {
		console.info('============= START : Verify User ===========');

		// Get the user to be verified
		const userAsBytes = await ctx.stub.getState(userId);
		if (!userAsBytes || userAsBytes.length === 0) {
			throw new Error(`User ${userId} does not exist`);
		}

		const user = JSON.parse(userAsBytes.toString());
		if (user.docType !== 'user') {
			throw new Error(`Entity ${userId} is not a user`);
		}

		// Get the verifier
		const verifierAsBytes = await ctx.stub.getState(verifierId);
		if (!verifierAsBytes || verifierAsBytes.length === 0) {
			throw new Error(`Verifier ${verifierId} does not exist`);
		}

		const verifier = JSON.parse(verifierAsBytes.toString());
		if (verifier.docType !== 'user') {
			throw new Error(`Entity ${verifierId} is not a user`);
		}

		// Check if verifier has authorization (NGO or NCCR can verify users)
		if (verifier.role !== 'NGO' && verifier.role !== 'NCCR') {
			throw new Error(`User ${verifierId} with role ${verifier.role} cannot verify users. Only NGO and NCCR can verify users.`);
		}

		// Check if verifier is verified themselves
		if (verifier.verificationStatus !== 'VERIFIED') {
			throw new Error(`Verifier ${verifierId} must be verified to verify other users`);
		}

		// Check if user is already verified
		if (user.verificationStatus === 'VERIFIED') {
			throw new Error(`User ${userId} is already verified`);
		}

		// Use deterministic timestamp from transaction
		const txTimestamp = ctx.stub.getTxTimestamp();
		const timestamp = new Date(txTimestamp.seconds * 1000).toISOString();

		// Update user verification status
		user.verificationStatus = 'VERIFIED';
		user.verifiedBy = verifierId;
		user.verifiedAt = timestamp;

		await ctx.stub.putState(userId, Buffer.from(JSON.stringify(sortKeysRecursive(user))));

		// Create audit trail entry
		await this._createAuditEntry(ctx, userId, 'USER_VERIFIED', verifierId, `User verified by ${verifier.role} ${verifierId}`);

		// Emit event
		ctx.stub.setEvent('UserVerified', Buffer.from(JSON.stringify(user)));

		console.info('============= END : Verify User ===========');
		return JSON.stringify(user);
	}

	async GetAllUsers(ctx) {
		console.info('============= START : Get All Users ===========');

		const queryString = {
			selector: {
				docType: 'user'
			}
		};

		const resultsIterator = await ctx.stub.getQueryResult(JSON.stringify(queryString));
		const results = await this._getAllResults(resultsIterator);

		console.info('============= END : Get All Users ===========');
		return JSON.stringify(results);
	}

	// ==================== PROJECT MANAGEMENT ====================

	async CreateProject(ctx, projectId, name, location, coordinates, projectType, targetTrees, ngoId) {
		console.info('============= START : Create Project ===========');

		// Verify NGO exists and has correct role
		try {
			const ngoUser = JSON.parse(await this.GetUser(ctx, ngoId));
			if (ngoUser.role !== 'NGO') {
				throw new Error('Only NGOs can create projects');
			}
		} catch (error) {
			console.warn(`Warning: Could not verify NGO user ${ngoId}: ${error.message}`);
			// Continue with project creation - user verification can be done later
		}

		// Use deterministic timestamp from transaction
		const txTimestamp = ctx.stub.getTxTimestamp();
		const timestamp = new Date(txTimestamp.seconds * 1000).toISOString();

		const project = {
			docType: 'project',
			projectId: projectId,
			name: name,
			location: location,
			coordinates: coordinates, // {lat, lng, boundary}
			projectType: projectType, // MANGROVE, SEAGRASS, TREES
			targetTrees: parseInt(targetTrees),
			currentTrees: 0,
			ngoId: ngoId,
			status: 'ACTIVE',
			createdAt: timestamp,
			creditsGenerated: 0,
			creditsAvailable: 0
		};

		await ctx.stub.putState(projectId, Buffer.from(JSON.stringify(sortKeysRecursive(project))));

		// Emit event
		ctx.stub.setEvent('ProjectCreated', Buffer.from(JSON.stringify(project)));

		console.info('============= END : Create Project ===========');
		return JSON.stringify(project);
	}

	async GetProject(ctx, projectId) {
		const projectAsBytes = await ctx.stub.getState(projectId);
		if (!projectAsBytes || projectAsBytes.length === 0) {
			throw new Error(`Project ${projectId} does not exist`);
		}
		return projectAsBytes.toString();
	}

	// ==================== SUBMISSION WORKFLOW ====================

	async CreateSubmission(ctx, submissionId, farmerId, projectId, plantType, numberOfSamples, imageHashes, gpsCoordinates, deviceSignature) {
		console.info('============= START : Create Submission ===========');

		// Verify farmer exists
		try {
			const farmer = JSON.parse(await this.GetUser(ctx, farmerId));
			if (farmer.role !== 'FARMER') {
				throw new Error('Only farmers can create submissions');
			}
		} catch (error) {
			console.warn(`Warning: Could not verify farmer user ${farmerId}: ${error.message}`);
			// Continue with submission creation - user verification can be done later
		}

		// Verify project exists
		// const project = JSON.parse(await this.GetProject(ctx, projectId));

		// Use deterministic timestamp from transaction
		const txTimestamp = ctx.stub.getTxTimestamp();
		const timestamp = new Date(txTimestamp.seconds * 1000).toISOString();

		const submission = {
			docType: 'submission',
			submissionId: submissionId,
			farmerId: farmerId,
			projectId: projectId,
			plantType: plantType,
			numberOfSamples: parseInt(numberOfSamples),
			imageHashes: JSON.parse(imageHashes), // Array of IPFS hashes
			gpsCoordinates: JSON.parse(gpsCoordinates), // {lat, lng, accuracy}
			deviceSignature: deviceSignature,
			status: 'PENDING_REVIEW',
			submittedAt: timestamp,
			reviewedBy: [],
			approvals: [],
			rejectionReason: null,
			creditsEarned: 0
		};

		await ctx.stub.putState(submissionId, Buffer.from(JSON.stringify(sortKeysRecursive(submission))));

		// Create audit trail entry
		await this._createAuditEntry(ctx, submissionId, 'SUBMISSION_CREATED', farmerId, `Submission created with ${numberOfSamples} samples`);

		// Emit event
		ctx.stub.setEvent('SubmissionCreated', Buffer.from(JSON.stringify(submission)));

		console.info('============= END : Create Submission ===========');
		return JSON.stringify(submission);
	}

	// ==================== SUBMISSION REVIEW ====================
	async ReviewSubmission(ctx, submissionId, reviewerId, action, comments) {
		console.info('============= START : Review Submission ===========');

		// Verify reviewer exists and has proper permissions
		let reviewerJson = await this.GetUser(ctx, reviewerId);
		if (!reviewerJson) {
			throw new Error(`Reviewer user '${reviewerId}' does not exist on the ledger`);
		}

		let reviewer;
		try {
			reviewer = JSON.parse(reviewerJson);
		} catch (err) {
			throw new Error(`Failed to parse reviewer data for user '${reviewerId}': ${err.message}`);
		}

		// Validate reviewer role
		if (reviewer.role !== 'NCCR') {
			throw new Error(`User '${reviewerId}' has role '${reviewer.role}' but only NCCR users can review submissions`);
		}

		// Validate reviewer verification status
		if (reviewer.verificationStatus !== 'VERIFIED') {
			throw new Error(`Reviewer '${reviewerId}' has verification status '${reviewer.verificationStatus}' but must be VERIFIED`);
		}

		// Validate reviewer is active
		if (!reviewer.isActive) {
			throw new Error(`Reviewer '${reviewerId}' is not active`);
		}

		const submissionAsBytes = await ctx.stub.getState(submissionId);
		const submission = JSON.parse(submissionAsBytes.toString());

		if (submission.status !== 'PENDING_REVIEW' && submission.status !== 'UNDER_REVIEW') {
			throw new Error(`Cannot review submission with status: ${submission.status}`);
		}

		// Use deterministic timestamp from transaction
		const txTimestamp = ctx.stub.getTxTimestamp();
		const timestamp = new Date(txTimestamp.seconds * 1000).toISOString();

		// Add review
		const review = {
			reviewerId: reviewerId,
			reviewerRole: reviewer.role,
			action: action, // APPROVE, REJECT, REQUEST_MORE_INFO
			comments: comments,
			reviewedAt: timestamp
		};

		submission.reviewedBy.push(review);

		if (action === 'APPROVE') {
			submission.status = 'APPROVED';
			submission.approvals.push(reviewerId);
			// Calculate credits earned
			const systemConfig = JSON.parse((await ctx.stub.getState('SYSTEM_CONFIG')).toString());
			submission.creditsEarned = submission.numberOfSamples * systemConfig.carbonCreditRate;
		} else if (action === 'REJECT') {
			submission.status = 'REJECTED';
			submission.rejectionReason = comments;
		}

		await ctx.stub.putState(submissionId, Buffer.from(JSON.stringify(sortKeysRecursive(submission))));

		// Create audit trail entry
		await this._createAuditEntry(ctx, submissionId, `SUBMISSION_${action}`, reviewerId, comments);

		// Emit event
		ctx.stub.setEvent('SubmissionReviewed', Buffer.from(JSON.stringify(submission)));

		console.info('============= END : Review Submission ===========');
		return JSON.stringify(submission);
	}

	async GetUserById(ctx, userId) {
		const userBytes = await ctx.stub.getState(userId);
		if (!userBytes || userBytes.length === 0) {
			throw new Error(`User ${userId} not found`);
		}
		return userBytes.toString();
	}

	// ==============Allow NCCR or AUDITOR to verify a project before submissions start.==============
	async VerifyProject(ctx, projectId, verifierId, comments) {
		console.info('============= START : Verify Project ===========');

		try {
			const verifier = JSON.parse(await this.GetUser(ctx, verifierId));
			if (verifier.role !== 'NCCR') {
				throw new Error('Only NCCR can verify projects');
			}
		} catch (error) {
			console.warn(`Warning: Could not verify NCCR user ${verifierId}: ${error.message}`);
			// Continue with project verification - user verification can be done later
		}

		const projectAsBytes = await ctx.stub.getState(projectId);
		if (!projectAsBytes || projectAsBytes.length === 0) {
			throw new Error(`Project ${projectId} does not exist`);
		}

		const project = JSON.parse(projectAsBytes.toString());
		if (project.status !== 'ACTIVE') {
			throw new Error(`Cannot verify project with status: ${project.status}`);
		}

		// Use deterministic timestamp from transaction
		const txTimestamp = ctx.stub.getTxTimestamp();
		const timestamp = new Date(txTimestamp.seconds * 1000).toISOString();

		project.status = 'VERIFIED';
		project.verifiedBy = verifierId;
		project.verifiedAt = timestamp;

		await ctx.stub.putState(projectId, Buffer.from(JSON.stringify(sortKeysRecursive(project))));
		await this._createAuditEntry(ctx, projectId, 'PROJECT_VERIFIED', verifierId, comments);

		ctx.stub.setEvent('ProjectVerified', Buffer.from(JSON.stringify(project)));

		console.info('============= END : Verify Project ===========');
		return JSON.stringify(project);
	}


	// ==================== CARBON CREDIT TOKENIZATION ====================

	async MintCarbonCredits(ctx, submissionId, nccr_id) {
		console.info('============= START : Mint Carbon Credits ===========');

		// Verify NCCR authority
		const nccr = JSON.parse(await this.GetUser(ctx, nccr_id));
		if (nccr.role !== 'NCCR') {
			throw new Error('Only NCCR can mint carbon credits');
		}

		const submissionAsBytes = await ctx.stub.getState(submissionId);
		const submission = JSON.parse(submissionAsBytes.toString());

		if (submission.status !== 'APPROVED') {
			throw new Error('Can only mint credits for approved submissions');
		}

		if (submission.creditsEarned <= 0) {
			throw new Error('No credits to mint for this submission');
		}

		// Use deterministic timestamp from transaction
		const txTimestamp = ctx.stub.getTxTimestamp();
		const timestamp = new Date(txTimestamp.seconds * 1000).toISOString();

		// Generate unique credit batch ID using deterministic timestamp
		const creditBatchId = `CREDIT_${submissionId}_${txTimestamp.seconds}`;

		const carbonCredit = {
			docType: 'carbonCredit',
			creditBatchId: creditBatchId,
			submissionId: submissionId,
			projectId: submission.projectId,
			farmerId: submission.farmerId,
			creditsAmount: submission.creditsEarned,
			creditType: submission.plantType,
			status: CREDIT_STATUS.AVAILABLE,
			mintedAt: timestamp,
			mintedBy: nccr_id,
			purchasedBy: null,
			purchasedAt: null,
			pricePerCredit: 0,
			escrowUntil: null,
			certificateHash: null,
			version: 1, // For optimistic concurrency control
			metadata: {
				createdAt: timestamp,
				lastUpdated: timestamp,
				updatedBy: nccr_id
			}
		};

		// Validate credits amount
		if (submission.creditsEarned <= 0) {
			throw new Error('Credits amount must be greater than zero');
		}

		await ctx.stub.putState(creditBatchId, Buffer.from(JSON.stringify(sortKeysRecursive(carbonCredit))));

		// Update project stats
		const projectAsBytes = await ctx.stub.getState(submission.projectId);
		const project = JSON.parse(projectAsBytes.toString());
		project.currentTrees += submission.numberOfSamples;
		project.creditsGenerated += submission.creditsEarned;
		project.creditsAvailable += submission.creditsEarned;
		await ctx.stub.putState(submission.projectId, Buffer.from(JSON.stringify(sortKeysRecursive(project))));

		// Update submission status
		submission.status = 'CREDITS_MINTED';
		await ctx.stub.putState(submissionId, Buffer.from(JSON.stringify(sortKeysRecursive(submission))));

		// Create audit trail entry
		await this._createAuditEntry(ctx, creditBatchId, 'CREDITS_MINTED', nccr_id, `Minted ${submission.creditsEarned} credits`);

		// Emit event
		ctx.stub.setEvent('CreditsMinted', Buffer.from(JSON.stringify(carbonCredit)));

		console.info('============= END : Mint Carbon Credits ===========');
		return JSON.stringify(carbonCredit);
	}

	// ==================== MARKETPLACE FUNCTIONS ====================

	async ListCreditsForSale(ctx, creditBatchId, pricePerCredit, sellerId) {
		console.info('============= START : List Credits For Sale ===========');

		// Input validation
		if (!creditBatchId || !pricePerCredit || !sellerId) {
			throw new Error('Missing required parameters: creditBatchId, pricePerCredit, sellerId');
		}

		// Validate price
		const price = parseFloat(pricePerCredit);
		if (isNaN(price) || price <= 0) {
			throw new Error('Price must be a number greater than zero');
		}

		// Get current credit state
		const creditAsBytes = await ctx.stub.getState(creditBatchId);
		if (!creditAsBytes || creditAsBytes.length === 0) {
			throw new Error(`Credit batch ${creditBatchId} does not exist`);
		}

		const credit = JSON.parse(creditAsBytes.toString());

		// State validation
		if (credit.status !== CREDIT_STATUS.AVAILABLE) {
			throw new Error(`Credits are not available for sale. Current status: ${credit.status}`);
		}

		// Verify seller is the farmer who owns the credits
		if (credit.farmerId !== sellerId) {
			throw new Error('Only the farmer who owns the credits can list them for sale');
		}

		// Use deterministic timestamp from transaction
		const txTimestamp = ctx.stub.getTxTimestamp();
		const timestamp = new Date(txTimestamp.seconds * 1000).toISOString();

		// Update credit with optimistic concurrency control
		const version = credit.version || 1;
		credit.status = CREDIT_STATUS.FOR_SALE;
		credit.pricePerCredit = price;
		credit.listedBy = sellerId;
		credit.listedAt = timestamp;
		credit.version = version + 1;
		credit.metadata = credit.metadata || {};
		credit.metadata.lastUpdated = timestamp;
		credit.metadata.updatedBy = sellerId;

		// Use putState with composite key for better querying
		await ctx.stub.putState(creditBatchId, Buffer.from(JSON.stringify(sortKeysRecursive(credit))));

		// Create audit entry
		await this._createAuditEntry(
			ctx,
			creditBatchId,
			'CREDITS_LISTED',
			sellerId,
			`Listed ${credit.creditsAmount} credits for sale at ${price} per credit`
		);

		// Emit event with more context
		const eventPayload = {
			creditBatchId: credit.creditBatchId,
			sellerId: credit.farmerId,
			creditsAmount: credit.creditsAmount,
			pricePerCredit: credit.pricePerCredit,
			timestamp: timestamp
		};
		ctx.stub.setEvent('CreditsListed', Buffer.from(JSON.stringify(eventPayload)));

		console.info('============= END : List Credits For Sale ===========');
		return JSON.stringify({
			status: 'success',
			message: 'Credits listed for sale successfully',
			creditBatchId: credit.creditBatchId,
			version: credit.version
		});
	}

	async PurchaseCredits(ctx, creditBatchId, buyerId, paymentAmount) {
		console.info('============= START : Purchase Credits ===========');

		// Input validation
		if (!creditBatchId || !buyerId || paymentAmount === undefined) {
			throw new Error('Missing required parameters: creditBatchId, buyerId, paymentAmount');
		}

		// Validate payment amount
		const payment = parseFloat(paymentAmount);
		if (isNaN(payment) || payment <= 0) {
			throw new Error('Payment amount must be a number greater than zero');
		}

		// Verify buyer exists and is an industry
		let buyer;
		try {
			buyer = JSON.parse(await this.GetUser(ctx, buyerId));
		} catch (error) {
			throw new Error(`Buyer ${buyerId} not found`);
		}

		if (buyer.role !== 'INDUSTRY') {
			throw new Error('Only industries can purchase credits');
		}

		// Get and validate credit
		const creditAsBytes = await ctx.stub.getState(creditBatchId);
		if (!creditAsBytes || creditAsBytes.length === 0) {
			throw new Error(`Credit batch ${creditBatchId} not found`);
		}

		const credit = JSON.parse(creditAsBytes.toString());
		const version = credit.version || 1;

		// State validation
		if (credit.status !== CREDIT_STATUS.FOR_SALE) {
			throw new Error(`Credits cannot be purchased. Current status: ${credit.status}`);
		}

		// Validate sufficient payment
		const totalPrice = credit.creditsAmount * credit.pricePerCredit;
		if (payment < totalPrice) {
			throw new Error(`Insufficient payment. Required: ${totalPrice}, Provided: ${payment}`);
		}

		// Get system configuration
		const systemConfigBytes = await ctx.stub.getState('SYSTEM_CONFIG');
		if (!systemConfigBytes || systemConfigBytes.length === 0) {
			throw new Error('System configuration not found');
		}
		const systemConfig = JSON.parse(systemConfigBytes.toString());

		// Calculate escrow period
		const txTimestamp = ctx.stub.getTxTimestamp();
		const timestamp = new Date(txTimestamp.seconds * 1000).toISOString();
		const escrowDate = new Date(txTimestamp.seconds * 1000);
		escrowDate.setDate(escrowDate.getDate() + (systemConfig.escrowPeriodDays || 60));

		// Update credit with optimistic concurrency control
		credit.status = CREDIT_STATUS.SOLD_ESCROW;
		credit.purchasedBy = buyerId;
		credit.purchasedAt = timestamp;
		credit.escrowUntil = escrowDate.toISOString();
		credit.paymentAmount = payment;
		credit.version = version + 1;
		credit.metadata = credit.metadata || {};
		credit.metadata.lastUpdated = timestamp;
		credit.metadata.updatedBy = buyerId;

		// Update credit in ledger
		await ctx.stub.putState(creditBatchId, Buffer.from(JSON.stringify(sortKeysRecursive(credit))));

		// Update project stats
		const projectAsBytes = await ctx.stub.getState(credit.projectId);
		if (!projectAsBytes || projectAsBytes.length === 0) {
			throw new Error(`Project ${credit.projectId} not found`);
		}
		const project = JSON.parse(projectAsBytes.toString());
		project.creditsAvailable = (project.creditsAvailable || 0) - credit.creditsAmount;
		project.creditsSold = (project.creditsSold || 0) + credit.creditsAmount;
		project.lastUpdated = timestamp;
		await ctx.stub.putState(credit.projectId, Buffer.from(JSON.stringify(sortKeysRecursive(project))));

		// Create audit entry
		await this._createAuditEntry(
			ctx,
			creditBatchId,
			'CREDITS_PURCHASED',
			buyerId,
			`Purchased ${credit.creditsAmount} credits for ${payment} (${credit.pricePerCredit} per credit)`
		);

		// Emit detailed event
		const eventPayload = {
			creditBatchId: credit.creditBatchId,
			sellerId: credit.farmerId,
			buyerId: buyerId,
			creditsAmount: credit.creditsAmount,
			totalPrice: totalPrice,
			timestamp: timestamp,
			escrowUntil: escrowDate.toISOString()
		};
		ctx.stub.setEvent('CreditsPurchased', Buffer.from(JSON.stringify(eventPayload)));

		console.info('============= END : Purchase Credits ===========');
		return JSON.stringify({
			status: 'success',
			message: 'Credits purchased successfully',
			creditBatchId: credit.creditBatchId,
			totalPrice: totalPrice,
			escrowUntil: escrowDate.toISOString(),
			version: credit.version
		});
	}

	async FinalizeCredits(ctx, creditBatchId, certificateHash) {
		console.info('============= START : Finalize Credits ===========');

		// Input validation
		if (!creditBatchId || !certificateHash) {
			throw new Error('Missing required parameters: creditBatchId, certificateHash');
		}

		// Validate certificate hash format (basic validation)
		if (typeof certificateHash !== 'string' || certificateHash.length < 10) {
			throw new Error('Invalid certificate hash format');
		}

		// Get and validate credit
		const creditAsBytes = await ctx.stub.getState(creditBatchId);
		if (!creditAsBytes || creditAsBytes.length === 0) {
			throw new Error(`Credit batch ${creditBatchId} not found`);
		}

		const credit = JSON.parse(creditAsBytes.toString());
		const version = credit.version || 1;

		// State validation
		if (credit.status !== CREDIT_STATUS.SOLD_ESCROW) {
			throw new Error(`Cannot finalize credits. Current status: ${credit.status}`);
		}

		// Check for duplicate certificate hash
		const existingCertQuery = {
			selector: {
				docType: 'carbonCredit',
				certificateHash: certificateHash,
				creditBatchId: {$ne: creditBatchId} // Exclude current credit
			}
		};
		const existingCertResults = await this._getAllResults(
			await ctx.stub.getQueryResult(JSON.stringify(existingCertQuery))
		);
		if (existingCertResults && existingCertResults.length > 0) {
			throw new Error('Certificate hash already in use by another credit batch');
		}

		// Use deterministic timestamp from transaction
		const txTimestamp = ctx.stub.getTxTimestamp();
		const timestamp = new Date(txTimestamp.seconds * 1000).toISOString();

		// Check if escrow period has passed
		const now = new Date(txTimestamp.seconds * 1000);
		const escrowDate = new Date(credit.escrowUntil);

		if (now < escrowDate) {
			throw new Error(`Escrow period has not ended yet. Escrow ends at: ${credit.escrowUntil}`);
		}

		// Update credit with optimistic concurrency control
		credit.status = CREDIT_STATUS.FINALIZED;
		credit.certificateHash = certificateHash;
		credit.finalizedAt = timestamp;
		credit.version = version + 1;
		credit.metadata = credit.metadata || {};
		credit.metadata.lastUpdated = timestamp;
		credit.metadata.updatedBy = ctx.clientIdentity.getID();

		// Update credit in ledger
		await ctx.stub.putState(creditBatchId, Buffer.from(JSON.stringify(sortKeysRecursive(credit))));

		// Get and update industry stats
		try {
			const industryId = credit.purchasedBy;
			if (industryId) {
				const industryAsBytes = await ctx.stub.getState(industryId);
				if (industryAsBytes && industryAsBytes.length > 0) {
					const industry = JSON.parse(industryAsBytes.toString());
					industry.creditsOwned = (industry.creditsOwned || 0) + credit.creditsAmount;
					industry.lastUpdated = timestamp;
					await ctx.stub.putState(industryId, Buffer.from(JSON.stringify(sortKeysRecursive(industry))));
				}
			}
		} catch (error) {
			console.error('Error updating industry stats:', error);
			// Don't fail the transaction if industry update fails
		}

		// Create audit entry
		await this._createAuditEntry(
			ctx,
			creditBatchId,
			'CREDITS_FINALIZED',
			ctx.clientIdentity.getID(),
			`Finalized ${credit.creditsAmount} credits with certificate ${certificateHash}`
		);

		// Emit detailed event
		const eventPayload = {
			creditBatchId: credit.creditBatchId,
			buyerId: credit.purchasedBy,
			sellerId: credit.farmerId,
			creditsAmount: credit.creditsAmount,
			totalPrice: credit.paymentAmount,
			certificateHash: certificateHash,
			timestamp: timestamp
		};
		ctx.stub.setEvent('CreditsFinalized', Buffer.from(JSON.stringify(eventPayload)));

		console.info('============= END : Finalize Credits ===========');
		return JSON.stringify({
			status: 'success',
			message: 'Credits finalized successfully',
			creditBatchId: credit.creditBatchId,
			certificateHash: certificateHash,
			version: credit.version
		});
	}

	// ==================== MARKETPLACE FUNCTIONS ====================

	async CancelListing(ctx, creditBatchId, userId) {
		console.info('============= START : Cancel Listing ===========');

		// Input validation
		if (!creditBatchId || !userId) {
			throw new Error('Missing required parameters: creditBatchId, userId');
		}

		// Get and validate credit
		const creditAsBytes = await ctx.stub.getState(creditBatchId);
		if (!creditAsBytes || creditAsBytes.length === 0) {
			throw new Error(`Credit batch ${creditBatchId} not found`);
		}

		const credit = JSON.parse(creditAsBytes.toString());
		const version = credit.version || 1;

		// State validation
		if (credit.status !== CREDIT_STATUS.FOR_SALE) {
			throw new Error(`Cannot cancel listing. Current status: ${credit.status}`);
		}

		// Authorization: Only the seller or an admin can cancel the listing
		const isSeller = credit.listedBy === userId;
		const isAdmin = false; // You might want to implement admin check here

		if (!isSeller && !isAdmin) {
			throw new Error('Only the seller or an admin can cancel this listing');
		}

		// Use deterministic timestamp from transaction
		const txTimestamp = ctx.stub.getTxTimestamp();
		const timestamp = new Date(txTimestamp.seconds * 1000).toISOString();

		// Update credit with optimistic concurrency control
		const previousStatus = credit.status;
		credit.status = CREDIT_STATUS.AVAILABLE;
		credit.pricePerCredit = 0;
		credit.listedBy = null;
		credit.listedAt = null;
		credit.version = version + 1;
		credit.metadata = credit.metadata || {};
		credit.metadata.lastUpdated = timestamp;
		credit.metadata.updatedBy = userId;

		// Update credit in ledger
		await ctx.stub.putState(creditBatchId, Buffer.from(JSON.stringify(sortKeysRecursive(credit))));

		// Update project available credits
		try {
			const projectAsBytes = await ctx.stub.getState(credit.projectId);
			if (projectAsBytes && projectAsBytes.length > 0) {
				const project = JSON.parse(projectAsBytes.toString());
				project.creditsAvailable = (project.creditsAvailable || 0) + credit.creditsAmount;
				project.creditsSold = Math.max(0, (project.creditsSold || 0) - credit.creditsAmount);
				project.lastUpdated = timestamp;
				await ctx.stub.putState(credit.projectId, Buffer.from(JSON.stringify(sortKeysRecursive(project))));
			}
		} catch (error) {
			console.error('Error updating project stats:', error);
			// Don't fail the transaction if project update fails
		}

		// Create audit entry
		await this._createAuditEntry(
			ctx,
			creditBatchId,
			'LISTING_CANCELLED',
			userId,
			`Cancelled listing of ${credit.creditsAmount} credits. Previous status: ${previousStatus}`
		);

		// Emit detailed event
		const eventPayload = {
			creditBatchId: credit.creditBatchId,
			sellerId: credit.farmerId,
			creditsAmount: credit.creditsAmount,
			timestamp: timestamp,
			cancelledBy: userId
		};
		ctx.stub.setEvent('ListingCancelled', Buffer.from(JSON.stringify(eventPayload)));

		console.info('============= END : Cancel Listing ===========');
		return JSON.stringify({
			status: 'success',
			message: 'Listing cancelled successfully',
			creditBatchId: credit.creditBatchId,
			version: credit.version
		});
	}

	// ==================== QUERY FUNCTIONS ====================

	async QuerySubmissionsByFarmer(ctx, farmerId) {
		const queryString = {
			selector: {
				docType: 'submission',
				farmerId: farmerId
			}
		};

		const resultsIterator = await ctx.stub.getQueryResult(JSON.stringify(queryString));
		const results = await this._getAllResults(resultsIterator);
		return JSON.stringify(results);
	}

	async QuerySubmissionsByProject(ctx, projectId) {
		const queryString = {
			selector: {
				docType: 'submission',
				projectId: projectId
			}
		};

		const resultsIterator = await ctx.stub.getQueryResult(JSON.stringify(queryString));
		const results = await this._getAllResults(resultsIterator);
		return JSON.stringify(results);
	}

	async QueryPendingSubmissions(ctx) {
		const allResults = [];
		const iterator = await ctx.stub.getStateByRange('', '');
		let result = await iterator.next();

		while (!result.done) {
			const strValue = Buffer.from(result.value.value.toString()).toString('utf8');
			let record;
			try {
				record = JSON.parse(strValue);
				// Filter for pending submissions
				if (record.docType === 'submission' && record.status === 'PENDING_REVIEW') {
					allResults.push({ Key: result.value.key, Record: record });
				}
			} catch (err) {
				console.log(err);
			}
			result = await iterator.next();
		}

		return JSON.stringify(allResults);
	}

	async QueryAvailableCredits(ctx) {
		const queryString = {
			selector: {
				docType: 'carbonCredit',
				status: CREDIT_STATUS.FOR_SALE
			}
		};

		const resultsIterator = await ctx.stub.getQueryResult(JSON.stringify(queryString));
		const results = await this._getAllResults(resultsIterator);
		return JSON.stringify(results);
	}

	async QueryCreditsByIndustry(ctx, industryId) {
		const queryString = {
			selector: {
				docType: 'carbonCredit',
				purchasedBy: industryId
			}
		};

		const resultsIterator = await ctx.stub.getQueryResult(JSON.stringify(queryString));
		const results = await this._getAllResults(resultsIterator);
		return JSON.stringify(results);
	}

	async QueryCreditsByFarmer(ctx, farmerId) {
		console.info(`============= START : Query Credits for Farmer ${farmerId} ===========`);

		const queryString = {
			selector: {
				docType: 'creditBatch',
				farmerId: farmerId
			}
		};

		const resultsIterator = await ctx.stub.getQueryResult(JSON.stringify(queryString));
		const results = await this._getAllResults(resultsIterator);
		console.info(`============= END : Query Credits for Farmer ${farmerId} ===========`);
		return JSON.stringify(results);
	}

	async GetProjectStats(ctx, projectId) {
		console.info('============= START : Get Project Stats ===========');

		const project = JSON.parse(await this.GetProject(ctx, projectId));

		// Get submission count
		const submissionQuery = {
			selector: {
				docType: 'submission',
				projectId: projectId
			}
		};

		const submissionIterator = await ctx.stub.getQueryResult(JSON.stringify(submissionQuery));
		const submissions = await this._getAllResults(submissionIterator);

		const stats = {
			project: project,
			totalSubmissions: submissions.length,
			approvedSubmissions: submissions.filter(s => s.Record.status === 'APPROVED' || s.Record.status === 'CREDITS_MINTED').length,
			pendingSubmissions: submissions.filter(s => s.Record.status === 'PENDING_REVIEW' || s.Record.status === 'UNDER_REVIEW').length,
			rejectedSubmissions: submissions.filter(s => s.Record.status === 'REJECTED').length,
			completionPercentage: (project.currentTrees / project.targetTrees) * 100
		};

		return JSON.stringify(stats);
	}

	// GetAllAssets returns all assets found in the world state.
	async GetAllAssets(ctx) {
		const allResults = [];
		// range query with empty string for startKey and endKey does an open-ended query of all assets in the chaincode namespace.
		const iterator = await ctx.stub.getStateByRange('', '');
		let result = await iterator.next();
		while (!result.done) {
			const strValue = Buffer.from(result.value.value.toString()).toString('utf8');
			let record;
			try {
				record = JSON.parse(strValue);
			} catch (err) {
				console.log(err);
				record = strValue;
			}
			allResults.push(record);
			result = await iterator.next();
		}
		return JSON.stringify(allResults);
	}

	// ==================== AUDIT TRAIL ====================

	async _createAuditEntry(ctx, entityId, action, userId, details) {
		// Use deterministic timestamp from transaction
		const txTimestamp = ctx.stub.getTxTimestamp();
		const timestamp = new Date(txTimestamp.seconds * 1000).toISOString();
		const auditId = `AUDIT_${entityId}_${txTimestamp.seconds}`;

		const auditEntry = {
			docType: 'auditEntry',
			auditId: auditId,
			entityId: entityId,
			action: action,
			userId: userId,
			details: details,
			timestamp: timestamp,
			blockNumber: ctx.stub.getTxID()
		};

		await ctx.stub.putState(auditId, Buffer.from(JSON.stringify(sortKeysRecursive(auditEntry))));
	}

	async GetAuditTrail(ctx, entityId) {
		const queryString = {
			selector: {
				docType: 'auditEntry',
				entityId: entityId
			},
			sort: [{ timestamp: 'desc' }]
		};

		const resultsIterator = await ctx.stub.getQueryResult(JSON.stringify(queryString));
		const results = await this._getAllResults(resultsIterator);
		return JSON.stringify(results);
	}

	// ==================== HELPER FUNCTIONS ====================

	async _getAllResults(iterator) {
		const allResults = [];
		let result = await iterator.next();

		while (!result.done) {
			const strValue = Buffer.from(result.value.value.toString()).toString('utf8');
			let record;
			try {
				record = JSON.parse(strValue);
			} catch (err) {
				console.log(err);
				record = strValue;
			}
			allResults.push({ Key: result.value.key, Record: record });
			result = await iterator.next();
		}

		return allResults;
	}

	// Get all entities of a specific type
	async GetAllEntities(ctx, docType) {
		const queryString = {
			selector: {
				docType: docType
			}
		};

		const resultsIterator = await ctx.stub.getQueryResult(JSON.stringify(queryString));
		const results = await this._getAllResults(resultsIterator);
		return JSON.stringify(results);
	}

	async UpdateSystemConfig(ctx, key, value) {
		console.info(`============= START : Update System Config ${key} ===========`);

		// Get system config
		const systemConfigBytes = await ctx.stub.getState('SYSTEM_CONFIG');
		if (!systemConfigBytes || systemConfigBytes.length === 0) {
			throw new Error('System configuration not found');
		}
		const systemConfig = JSON.parse(systemConfigBytes.toString());

		// Update the specified key
		if (key === 'escrowPeriodDays' || key === 'auditPeriodDays' || key === 'minimumApprovals') {
			systemConfig[key] = parseInt(value);
		} else if (key === 'carbonCreditRate' || key === 'marketplaceFeePercent') {
			systemConfig[key] = parseFloat(value);
		} else {
			systemConfig[key] = value;
		}

		// Save updated config
		await ctx.stub.putState('SYSTEM_CONFIG', Buffer.from(JSON.stringify(sortKeysRecursive(systemConfig))));

		console.info(`============= END : Update System Config ${key} ===========`);
		return JSON.stringify(systemConfig);
	}
}

module.exports = BlueCarbonRegistry;
