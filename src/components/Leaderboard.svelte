<script lang="ts">
	import { createEventDispatcher, onMount } from "svelte";
	import { getSessionById } from "../session_words";

	export let sessionId: string;
	export let currentPlayerEntry: LeaderboardEntry | null = null;

	const dispatch = createEventDispatcher();

	$: sessionData = getSessionById(sessionId);

	onMount(() => {
		currentPlayerEntry = JSON.parse(localStorage.getItem(`session-${sessionId}-leaderboard`) || "null");
	});

	function formatTime(milliseconds: number): string {
		const seconds = Math.floor(milliseconds / 1000);
		const minutes = Math.floor(seconds / 60);
		const remainingSeconds = seconds % 60;
		
		if (minutes > 0) {
			return `${minutes}m ${remainingSeconds}s`;
		}
		return `${remainingSeconds}s`;
	}
</script>

<div class="leaderboard">
	<div class="header">
		<h2>🎉 Congratulations!</h2>
		{#if sessionData}
			<h3>{currentPlayerEntry.playerName}</h3>
		{/if}
	</div>

	{#if currentPlayerEntry}
		<div class="player-stats">
			<h3>Your Results</h3>
			<div class="stats-grid">
				<div class="stat">
					<div class="stat-label">Words Completed</div>
					<div class="stat-value">{currentPlayerEntry.wordsCompleted}</div>
				</div>
				<div class="stat">
					<div class="stat-label">Total Guesses</div>
					<div class="stat-value">{currentPlayerEntry.totalGuesses}</div>
				</div>
				<div class="stat">
					<div class="stat-label">Total Time</div>
					<div class="stat-value">{formatTime(currentPlayerEntry.totalTime)}</div>
				</div>
			</div>
		</div>
	{/if}
</div>

<style>
	.leaderboard {
		max-width: 800px;
		margin: 0 auto;
		padding: 20px;
	}

	.header {
		text-align: center;
		margin-bottom: 30px;
	}

	.header h2 {
		margin: 0;
		font-size: 2em;
	}

	.header h3 {
		margin: 10px 0 0 0;
		color: var(--fg-secondary);
		font-weight: normal;
	}

	.player-stats {
		background: var(--bg-secondary);
		border: 2px solid var(--green);
		border-radius: 8px;
		padding: 20px;
		margin-bottom: 30px;
	}

	.player-stats h3 {
		margin: 0 0 15px 0;
		text-align: center;
		color: var(--green);
	}

	.stats-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
		gap: 15px;
	}

	.stat {
		text-align: center;
	}

	.stat-label {
		font-size: 14px;
		color: var(--fg-secondary);
		margin-bottom: 5px;
	}

	.stat-value {
		font-size: 24px;
		font-weight: bold;
		color: var(--fg-primary);
	}

	@media (max-width: 600px) {
		.stats-grid {
			grid-template-columns: repeat(2, 1fr);
		}

		.stat-value {
			font-size: 20px;
		}
	}
</style>
