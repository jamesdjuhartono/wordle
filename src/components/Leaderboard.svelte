<script lang="ts">
  import { onMount } from 'svelte';
  import { getSessionById } from "../session_words";
  import { initializeApp } from 'firebase/app';
  import { getFirestore, collection, onSnapshot } from 'firebase/firestore';

  export let sessionId: string;
  export let currentPlayerEntry: LeaderboardEntry | null = null;
  $: playerRank = currentPlayerEntry ? leaderboard.findIndex(entry => entry.playerUid === currentPlayerEntry.playerUid) + 1 : 0;

  const firebaseConfig = {
		apiKey: "AIzaSyBTos_hTrK-w8v_04sv5huFokRIEPEJgmI",
		authDomain: "wordlesession.firebaseapp.com",
		projectId: "wordlesession",
		storageBucket: "wordlesession.firebasestorage.app",
		messagingSenderId: "274940936333",
		appId: "1:274940936333:web:3c9fc73014ab56afdaa2c4",
	};

	const app = initializeApp(firebaseConfig);
	const db = getFirestore(app);
  let playerUid: String = localStorage.getItem('playerUid');
  let leaderboard: LeaderboardEntry[] = [];

  onMount(() => {

    if (!currentPlayerEntry){
      // show leaderboard without current player
      playerUid = '';
    }

    const unsub = onSnapshot(collection(db, sessionId), (snapshot) => {
      const arr: LeaderboardEntry[] = [];
      snapshot.forEach(doc => arr.push(doc.data() as LeaderboardEntry));

      // Sort for competition
      arr.sort((a, b) => {
        if (b.wordsCompleted !== a.wordsCompleted) return b.wordsCompleted - a.wordsCompleted;
        if (a.totalGuesses !== b.totalGuesses) return a.totalGuesses - b.totalGuesses;
        if (a.totalTime !== b.totalTime) return a.totalTime - b.totalTime;
        return a.completedAt - b.completedAt;
      });
      leaderboard = arr;
    });

    // Clean up listener on destroy
    return () => unsub();
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

  function getRankSuffix(rank: number): string {
		if (rank === 1) return "st";
		if (rank === 2) return "nd";
		if (rank === 3) return "rd";
		return "th";
	}

</script>

<div class="leaderboard">
	<div class="header">
		<h2>🏆 Leaderboard</h2>
		{#if sessionId}
			<h3>{sessionId}</h3>
		{/if}
	</div>

	{#if currentPlayerEntry}
		<div class="player-stats">
			<h3>Your Results</h3>
			<div class="stats-grid">
				<div class="stat">
					<div class="stat-label">Rank</div>
					<div class="stat-value">{playerRank}{getRankSuffix(playerRank)}</div>
				</div>
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

	<div class="leaderboard-table">
		<div class="table-header">
			<div class="rank-col">Rank</div>
			<div class="name-col">Player</div>
			<div class="words-col">Words</div>
			<div class="guesses-col">Guesses</div>
			<div class="time-col">Time</div>
		</div>

		{#if leaderboard.length === 0}
			<div class="empty-state">
				<p>No players have completed this session yet.</p>
				<p>Be the first to make it to the leaderboard!</p>
			</div>
		{:else}
			{#each leaderboard as entry, index}
				<div 
					class="table-row" 
          class:current-player={entry.playerUid === playerUid}
					class:top-three={index < 3}
				>
					<div class="rank-col">
						{#if index === 0}
							🥇
						{:else if index === 1}
							🥈
						{:else if index === 2}
							🥉
						{:else}
							#{index + 1}
						{/if}
					</div>
					<div class="name-col">{entry.playerName}</div>
					<div class="words-col">{entry.wordsCompleted}</div>
					<div class="guesses-col">{entry.totalGuesses}</div>
					<div class="time-col">{formatTime(entry.totalTime)}</div>
				</div>
			{/each}
		{/if}
	</div>
</div>

<style>
	.leaderboard {
		max-width: 800px;
		margin: 0 auto;
		padding: 20px;
    height: 100vh;
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
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

	.leaderboard-table {
		background: var(--bg-secondary);
		border-radius: 8px;
    overflow-y: auto;
		border-collapse: separate; 
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
	}

	.table-header {
    position: sticky;
    top: 0;
		display: grid;
		grid-template-columns: 80px 1fr 80px 100px 100px;
		gap: 10px;
		padding: 15px;
		background: var(--bg-primary);
		font-weight: bold;
		border-bottom: 2px solid var(--border-primary);
	}

	.table-row {
		display: grid;
		grid-template-columns: 80px 1fr 80px 100px 100px;
		gap: 10px;
		padding: 15px;
		border-bottom: 1px solid var(--border-secondary);
		transition: background-color 0.2s;
	}

	.table-row:hover {
		background: var(--bg-primary);
	}

	.table-row.current-player {
		background: var(--green-secondary);
		font-weight: bold;
    border: 2px solid #cafc03;    /* Green border */
	}

	.table-row.top-three {
		background: var(--yellow-secondary);
	}

	.table-row.current-player.top-three {
		background: var(--green);
		color: white;
	}

	.rank-col, .words-col, .guesses-col, .time-col {
		text-align: center;
	}

	.name-col {
		text-align: left;
		font-weight: 500;
	}

	.empty-state {
		padding: 40px 20px;
		text-align: center;
		color: var(--fg-secondary);
	}

	.empty-state p {
		margin: 10px 0;
	}

	@media (max-width: 600px) {
		.table-header, .table-row {
			grid-template-columns: 60px 1fr 60px 80px 80px;
			gap: 5px;
			padding: 10px;
			font-size: 14px;
		}

		.stats-grid {
			grid-template-columns: repeat(2, 1fr);
		}

		.stat-value {
			font-size: 20px;
		}
	}
</style>