<script lang="ts">
	import { createEventDispatcher, onDestroy } from "svelte";
	import { Board } from "./board";
	import Keyboard from "./keyboard";
	import { onMount, setContext } from "svelte";
	import {
		DELAY_INCREMENT,
		PRAISE,
		ROWS,
		SessionGameState,
		isValidWord,
		LetterStates,
	} from "../utils";
	import { letterStates } from "../stores";
	import { getSessionById } from "../session_words";
	import type { SessionData, SessionWord } from "../session_words";
	import { Toaster } from "./widgets";

	export let sessionState: SessionGameState;
	export let currentPlayerEntry: LeaderboardEntry | null;
	export let toaster: Toaster;

	setContext("toaster", toaster);

	const dispatch = createEventDispatcher();

	let sessionData: SessionData | null = null;
	let currentSessionWord: SessionWord | null = null;
	let board: Board;
	let wordStartTime = Date.now();

	let now = Date.now();
	const interval = setInterval(() => {
		now = Date.now();
	}, 1000);

	$: {
		sessionData = getSessionById(sessionState.sessionId);
		if (sessionData && sessionState.currentWordIndex < sessionData.words.length) {
			currentSessionWord = sessionData.words[sessionState.currentWordIndex];
		}
	}

	function submitWord() {
		if (!currentSessionWord || !sessionData) return;

		const currentGuess = sessionState.latestWord;
		const targetWord = sessionState.currentWord;

		const currentDelay = DELAY_INCREMENT * targetWord.length + 800;

		if (currentGuess.length !== targetWord.length) {
			toaster.pop(`Word must be ${targetWord.length} letters`);
			board.shake(sessionState.guesses);
			return;
		}

		if (!isValidWord(currentGuess)) {
			toaster.pop("Not a valid word");
			board.shake(sessionState.guesses);
			return;
		}

		// Process the guess
		const result = sessionState.guess(currentGuess, targetWord);
		sessionState.board.state[sessionState.guesses] = result;
		sessionState.guesses++;
		// Update leaderboard entry for live scoreboard
		currentPlayerEntry.totalGuesses++;

		// Update letter states
		$letterStates.update(sessionState.lastState, sessionState.lastWord);
		$letterStates = $letterStates;
		// Check if word is completed
		const isCorrect = result.every(state => state === "🟩");

		if (isCorrect) {
			// Word completed successfully
			board.bounce(sessionState.guesses - 1);
			setTimeout(() => toaster.pop(PRAISE[Math.min(sessionState.guesses - 1, PRAISE.length - 1)]), currentDelay);
			
			// Record word result
			const wordResult: SessionWordResult = {
				word: targetWord,
				guesses: sessionState.guesses,
				timeSpent: Date.now() - wordStartTime,
				completed: true
			};
			sessionState.wordResults.push(wordResult);
			currentPlayerEntry.wordsCompleted++;
			currentPlayerEntry.totalTime = Date.now() - sessionState.startTime;
			
			// Move to next word or complete session
			setTimeout(() => {
				if (sessionState.currentWordIndex + 1 < sessionData.words.length) {
					nextWord();
				} else {
					completeSession();
				}
			}, currentDelay * 1.4);
		} else if (sessionState.guesses >= ROWS) {
			// Failed this word
			const wordResult: SessionWordResult = {
				word: targetWord,
				guesses: sessionState.guesses,
				timeSpent: Date.now() - wordStartTime,
				completed: false
			};
			sessionState.wordResults.push(wordResult);
			
			setTimeout(() => {
				toaster.pop(`The word was: ${targetWord.toUpperCase()}`);
				setTimeout(() => {
					if (sessionState.currentWordIndex + 1 < sessionData.words.length) {
						nextWord();
					} else {
						completeSession();
					}
				}, 2000);
			}, currentDelay);
		}
	}

	function nextWord() {
		if (!sessionData) return;
		
		sessionState.currentWordIndex++;
		if (sessionState.currentWordIndex < sessionData.words.length) {
			const nextSessionWord = sessionData.words[sessionState.currentWordIndex];
			sessionState.currentWord = nextSessionWord.word.toLowerCase();
			sessionState.currentHint = nextSessionWord.hint;
			sessionState.currentWordLength = nextSessionWord.length;
			sessionState.guesses = 0;
			sessionState.active = true;
			
			// Reset board for new word length
			sessionState.board = {
				words: Array(ROWS).fill(""),
				state: Array.from({ length: ROWS }, () => (Array(nextSessionWord.length).fill("🔳"))),
			};

			// Reset letter states
			$letterStates = new LetterStates(sessionState.board);
			
			wordStartTime = Date.now();
			toaster.pop(`Word ${sessionState.currentWordIndex + 1} of ${sessionData.words.length}`);
		}
	}

	function completeSession() {
		sessionState.completed = true;
		sessionState.endTime = Date.now();
		sessionState.active = false;

		currentPlayerEntry.completedAt = sessionState.endTime;
		dispatch("complete", currentPlayerEntry);
	}

	function formatTime(ms: number): string {
		const seconds = Math.floor(ms / 1000);
		const minutes = Math.floor(seconds / 60);
		const remainingSeconds = seconds % 60;
		
		if (minutes > 0) {
			return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
		}
		return `${remainingSeconds}s`;
	}

	onMount(() => {
		wordStartTime = Date.now();
	});
	onDestroy(() => clearInterval(interval));
</script>

<main class="session-game" style="--rows: {ROWS}; --cols: {sessionState.currentWordLength}">
	<div class="session-header">
		<div class="session-info">
			<h2>{sessionData?.name || 'Session'}</h2>
			<div class="progress">
				Word {sessionState.currentWordIndex + 1} of {sessionData?.words.length || 0}
			</div>
		</div>
		<div class="session-stats">
			<div class="stat">
				<span class="stat-label">Time</span>
				<span class="stat-value">{formatTime(now - sessionState.startTime)}</span>
			</div>
			<div class="stat">
				<span class="stat-label">Words</span>
				<span class="stat-value">{sessionState.wordResults.filter(r => r.completed).length}/{sessionData?.words.length || 0}</span>
			</div>
		</div>
	</div>

	{#if currentSessionWord}
		<div class="hint-container">
			<div class="hint">
				<strong>Hint:</strong> {currentSessionWord.hint}
			</div>
		</div>
	{/if}

	<Board
		bind:this={board}
		bind:value={sessionState.board.words}
		board={sessionState.board}
		guesses={sessionState.guesses}
		icon=""
		tutorial={false}
	/>

	<Keyboard
		bind:value={sessionState.board.words[sessionState.guesses === ROWS ? 0 : sessionState.guesses]}
		on:submitWord={submitWord}
		disabled={!sessionState.active}
		maxLength={sessionState.currentWordLength}
	/>
</main>

<style>
	.session-game {
		display: flex;
		flex-direction: column;
		justify-content: space-between;
		align-items: center;
		height: 100%;
		max-width: var(--game-width);
		margin: auto;
		position: relative;
		padding: 10px;
	}

	.session-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		width: 100%;
		margin-bottom: 20px;
		padding: 0 10px;
	}

	.session-info h2 {
		margin: 0;
		font-size: 1.5em;
		color: var(--fg-primary);
	}

	.progress {
		font-size: 14px;
		color: var(--fg-secondary);
		margin-top: 5px;
	}

	.session-stats {
		display: flex;
		gap: 20px;
	}

	.stat {
		text-align: center;
	}

	.stat-label {
		display: block;
		font-size: 12px;
		color: var(--fg-secondary);
		margin-bottom: 2px;
	}

	.stat-value {
		display: block;
		font-size: 16px;
		font-weight: bold;
		color: var(--fg-primary);
	}

	.hint-container {
		width: 100%;
		max-width: 500px;
		margin-bottom: 20px;
	}

	.hint {
		background: var(--bg-secondary);
		border: 2px solid var(--border-primary);
		border-radius: 8px;
		padding: 15px;
		text-align: center;
		font-size: 16px;
		line-height: 1.4;
	}

	.hint strong {
		color: var(--green);
	}

	@media (max-width: 600px) {
		.session-header {
			flex-direction: column;
			gap: 15px;
			text-align: center;
		}

		.session-stats {
			gap: 30px;
		}

		.hint {
			font-size: 14px;
			padding: 12px;
		}
	}
</style>
