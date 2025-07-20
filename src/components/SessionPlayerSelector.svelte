<script lang="ts">
	import { createEventDispatcher } from "svelte";
	import { getSessionById } from "../session_words";
	import type { SessionData } from "../session_words";

	export let sessionId: string;

	const dispatch = createEventDispatcher();

	let playerName = "";
	let error = "";
	let loading = false;
	let sessionData: SessionData | null = null;

	$: {
		sessionData = getSessionById(sessionId);
		if (!sessionData) {
			error = "Session not found";
		}
	}

	async function startSession() {
		if (!sessionData) {
			error = "Session not found";
			return;
		}
		if (!playerName.trim()) {
			error = "Please enter your name";
			return;
		}

		const trimmedName = playerName.trim();
		loading = true;
		error = "";

		try {
			dispatch("start", {
				sessionId: sessionId,
				playerName: trimmedName
			});
		} catch (err) {
			error = "Failed to check session status. Please try again.";
			loading = false;
		}
	}

	function viewLeaderboard() {
		dispatch("viewLeaderboard", { sessionId });
	}

	function handleKeyPress(event: KeyboardEvent) {
		if (event.key === "Enter" && !loading) {
			startSession();
		}
	}
</script>

<div class="session-player-selector">
	<div class="session-header">
		<h2>{sessionData?.name || ''}</h2>
		<p class="session-description">
			Play through {sessionData?.words.length || 0} words with hints and compete on the leaderboard!
		</p>
		{#if sessionData}
			<div class="session-details">
				<div class="detail">
					<span class="detail-label">Words:</span>
					<span class="detail-value">{sessionData.words.length}</span>
				</div>
				<div class="detail">
					<span class="detail-label">Lengths:</span>
					<span class="detail-value">{sessionData.words.map(w => w.length).join(", ")}</span>
				</div>
				<div class="detail">
					<span class="detail-label">Session Key:</span>
					<span class="detail-value">{sessionId}</span>
				</div>
			</div>
		{/if}
	</div>

	<div class="input-section">
		<div class="input-group">
			<label for="player-name">Enter Your Name:</label>
			<input
				id="player-name"
				type="text"
				bind:value={playerName}
				placeholder="Your display name"
				maxlength="20"
				disabled={loading}
				on:keypress={handleKeyPress}
			/>
		</div>

		{#if error}
			<div class="error">{error}</div>
		{/if}

		<div class="button-group">
			<button
				class="start-button"
				on:click={startSession}
				disabled={!sessionData || !playerName.trim() || loading}
			>
				{#if loading}
					Starting...
				{:else}
					Start Playing
				{/if}
			</button>

			<!-- <button
				class="leaderboard-button"
				on:click={viewLeaderboard}
				disabled={!sessionData}
			>
				🏆 View Leaderboard
			</button> -->
		</div>
	</div>

	<div class="info-section">
		<h3>How to Play:</h3>
		<ul>
			<li>Guess each word using the provided hints</li>
			<li>Words can be of different lengths (3-15 letters)</li>
			<li>You have 6 attempts per word</li>
			<li>Your total time and guesses are tracked</li>
			<li>Compete with other players on the leaderboard!</li>
		</ul>
	</div>
</div>

<style>
	.session-player-selector {
		max-width: 600px;
		margin: 0 auto;
		padding: 20px;
		text-align: center;
	}

	.session-header h2 {
		margin: 0 0 10px 0;
		font-size: 2.5em;
		color: var(--green);
	}

	.session-description {
		font-size: 18px;
		color: var(--fg-secondary);
		margin-bottom: 20px;
	}

	.session-details {
		display: flex;
		justify-content: center;
		gap: 30px;
		margin: 20px 0;
		padding: 15px;
		background: var(--bg-secondary);
		border-radius: 8px;
		border: 2px solid var(--border-primary);
	}

	.detail {
		text-align: center;
	}

	.detail-label {
		display: block;
		font-size: 12px;
		color: var(--fg-secondary);
		margin-bottom: 5px;
		text-transform: uppercase;
		font-weight: bold;
	}

	.detail-value {
		display: block;
		font-size: 16px;
		color: var(--fg-primary);
		font-weight: bold;
	}

	.input-section {
		margin: 30px 0;
	}

	.input-group {
		margin: 20px 0;
	}

	label {
		display: block;
		margin-bottom: 10px;
		font-weight: bold;
		font-size: 18px;
	}

	input {
		width: 100%;
		max-width: 300px;
		padding: 15px;
		border: 2px solid var(--border-primary);
		border-radius: 8px;
		font-size: 18px;
		background: var(--bg-primary);
		color: var(--fg-primary);
		text-align: center;
	}

	input:focus {
		outline: none;
		border-color: var(--green);
		box-shadow: 0 0 0 3px rgba(var(--green-rgb), 0.1);
	}

	input:disabled {
		opacity: 0.6;
		cursor: not-allowed;
	}

	.error {
		color: var(--red);
		margin: 15px 0;
		font-weight: bold;
		font-size: 16px;
	}

	.button-group {
		display: flex;
		gap: 15px;
		justify-content: center;
		margin: 25px 0;
	}

	.start-button {
		padding: 15px 30px;
		font-size: 18px;
		font-weight: bold;
		border: none;
		border-radius: 8px;
		cursor: pointer;
		transition: all 0.2s;
		min-width: 180px;
	}

	.start-button {
		background: var(--green);
		color: white;
	}

	.start-button:hover:not(:disabled) {
		background: var(--green-secondary);
		transform: translateY(-2px);
	}

	.start-button:disabled {
		background: var(--bg-secondary);
		color: var(--fg-secondary);
		cursor: not-allowed;
		transform: none;
	}

	.info-section {
		margin-top: 40px;
		text-align: left;
		background: var(--bg-secondary);
		padding: 20px;
		border-radius: 8px;
		border: 2px solid var(--border-primary);
	}

	.info-section h3 {
		margin: 0 0 15px 0;
		color: var(--green);
		text-align: center;
	}

	.info-section ul {
		margin: 0;
		padding-left: 20px;
	}

	.info-section li {
		margin: 8px 0;
		line-height: 1.4;
	}

	@media (max-width: 600px) {
		.session-details {
			flex-direction: column;
			gap: 15px;
		}

		.button-group {
			flex-direction: column;
			align-items: center;
		}
	}
</style>
