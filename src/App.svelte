<script context="module" lang="ts">
	import {
		modeData,
		seededRandomInt,
		Stats,
		GameState,
		Settings,
		LetterStates,
		getWordNumber,
		ROWS,
		words,
		SessionGameState,
	} from "./utils";
	import Game from "./components/Game.svelte";
	import SessionPlayerSelector from "./components/SessionPlayerSelector.svelte";
	import SessionGame from "./components/SessionGame.svelte";
	import { letterStates, settings, mode } from "./stores";
	import { GameMode } from "./enums";
	import { Toaster } from "./components/widgets";
	import { setContext } from "svelte";
	import { getSessionById } from "./session_words";
	import { initializeApp } from "firebase/app";
	import { getFirestore, doc, setDoc } from "firebase/firestore";

	document.title = "Wordle+ | An infinite word guessing game";
</script>

<script lang="ts">
    import Leaderboard from "./components/Leaderboard.svelte";

	export let version: string;
	setContext("version", version);
	localStorage.setItem("version", version);
	
	let stats: Stats;
	let word: string;
	let state: GameState;
	let toaster: Toaster;
	
	// Session mode variables
	let sessionState: SessionGameState | null = null;
	let showSessionPlayerSelector = false;
	let showLeaderboard = false;
	let currentPlayerEntry: LeaderboardEntry | null = null;

	settings.set(new Settings(localStorage.getItem("settings")));
	settings.subscribe((s) => localStorage.setItem("settings", JSON.stringify(s)));

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

	// Check URL for session parameters
	const urlParams = new URLSearchParams(window.location.search);
	const sessionIdFromUrl = urlParams.get("session");
	const leaderboardFromUrl = urlParams.get("leaderboard") === "true";

	const hash = window.location.hash.slice(1).split("/");
	const modeVal: GameMode = !isNaN(GameMode[hash[0]])
		? GameMode[hash[0]]
		: sessionIdFromUrl ? GameMode.session : +localStorage.getItem("mode") || modeData.default;
	
	mode.set(modeVal);
	// If this is a link to a specific word make sure that that is the word
	if (!isNaN(+hash[1]) && +hash[1] < getWordNumber(modeVal) && $mode !== GameMode.session) {
		modeData.modes[modeVal].seed =
			(+hash[1] - 1) * modeData.modes[modeVal].unit + modeData.modes[modeVal].start;
		modeData.modes[modeVal].historical = true;
	}
	mode.subscribe((m) => {
		if (m === GameMode.session) {
			if (sessionIdFromUrl) {
				const sessionData = getSessionById(sessionIdFromUrl);
				const sessionLeaderboard = localStorage.getItem(`session-${sessionData.id}-leaderboard`);
				if (!sessionData) {
					showSessionPlayerSelector = true;
				} else if (leaderboardFromUrl){
					currentPlayerEntry = null;
					showLeaderboard = true;
				} else {
					let playerName = localStorage.getItem('player');
					if (!playerName) {
						showSessionPlayerSelector = true;
					} else if (sessionLeaderboard) {
						currentPlayerEntry = JSON.parse(sessionLeaderboard);
						if (currentPlayerEntry.completedAt != null){
							showLeaderboard = true;
						} else{
							startSession(sessionData.id);
						}
					} else{
						startSession(sessionData.id);
					}
				}
			}
		} else {
			showSessionPlayerSelector = false;
			showLeaderboard = false;
			sessionState = null;
			initializeRegularMode();
		}
	});

	function initializeRegularMode() {
		localStorage.setItem("mode", `${$mode}`);
		window.location.hash = GameMode[$mode];
		stats = new Stats(localStorage.getItem(`stats-${$mode}`) || $mode);
		word = words.words[seededRandomInt(0, words.words.length, modeData.modes[$mode].seed)];
		if (modeData.modes[$mode].historical) {
			state = new GameState($mode, localStorage.getItem(`state-${$mode}-h`));
		} else {
			state = new GameState($mode, localStorage.getItem(`state-${$mode}`));
		}
		// Set the letter states when data for a new game mode is loaded so the keyboard is correct
		letterStates.set(new LetterStates(state.board));
	}

	function startSession(sessionId: string) {
		const sessionData = getSessionById(sessionId);
		if (!sessionData) return;

		sessionState = new SessionGameState(sessionId, localStorage.getItem(`session-${sessionId}`));
		letterStates.set(new LetterStates(sessionState.board));

		//  Create blank leaderboard entry for new player
		if (!currentPlayerEntry){
			currentPlayerEntry = {
				playerName: localStorage.getItem("player") || "",
				playerUid: localStorage.getItem('playerUid'),
				sessionId: sessionState.sessionId,
				totalGuesses: 0,
				totalTime: Date.now() - sessionState.startTime,
				completedAt: null,
				wordsCompleted: 0,
			};
		}
		
		// Initialize first word if starting fresh
		if (sessionState.currentWordIndex === 0 && !sessionState.currentWord) {
			const firstWord = sessionData.words[0];
			sessionState.currentWord = firstWord.word.toLowerCase();
			sessionState.currentHint = firstWord.hint;
			sessionState.currentWordLength = firstWord.length;
			
			// Reset board for the new word length
			sessionState.board = {
				words: Array(ROWS).fill(""),
				state: Array.from({ length: ROWS }, () => (Array(firstWord.length).fill("🔳"))),
			};
		}

		showSessionPlayerSelector = false;
		showLeaderboard = false;
	}

	function handleSessionStart(event: CustomEvent) {
		const { sessionId, playerName } = event.detail;
		localStorage.setItem("player", playerName);
		let uid = localStorage.getItem('playerUid');
		if (!uid) {
			uid = crypto.randomUUID();
			localStorage.setItem("playerUid", uid);
		}
		startSession(sessionId);
	}

	async function handleSessionComplete(completedEntry: LeaderboardEntry) {
		showLeaderboard = true;
	}

	$: if (state) saveState(state);
	$: if (sessionState) saveSessionState(sessionState);
	$: if (currentPlayerEntry) savePlayerEntry(currentPlayerEntry);

	function saveState(state: GameState) {
		if (modeData.modes[$mode].historical) {
			localStorage.setItem(`state-${$mode}-h`, state.toString());
		} else {
			localStorage.setItem(`state-${$mode}`, state.toString());
		}
	}

	async function sendPlayerUpdate(update: LeaderboardEntry) {
		// Use playerID as the document ID (change as appropriate)
		const playerRef = doc(db, update.sessionId, localStorage.getItem('playerUid'));
		await setDoc(playerRef, update, { merge: true }); // merge:true will update or create
	}

	function saveSessionState(sessionState: SessionGameState) {
		localStorage.setItem(`session-${sessionState.sessionId}`, sessionState.toString());
	}

	function savePlayerEntry(currentPlayerEntry: LeaderboardEntry) {
		localStorage.setItem(`session-${currentPlayerEntry.sessionId}-leaderboard`, JSON.stringify(currentPlayerEntry));
		sendPlayerUpdate(currentPlayerEntry).catch(err => {
			console.error("Failed to update player data in Firestore:", err);
		});
	}
	
</script>

<Toaster bind:this={toaster} />
{#if toaster}
	{#if showLeaderboard}
		<Leaderboard 
			sessionId={sessionState?.sessionId || urlParams.get("session") || ""} 
			{currentPlayerEntry}
		/>
	{:else if showSessionPlayerSelector}
		<SessionPlayerSelector 
			sessionId={sessionState?.sessionId || urlParams.get("session") || ""}
			on:start={handleSessionStart}
		/>
	{:else if sessionState}
		<SessionGame 
			bind:sessionState={sessionState}
			bind:currentPlayerEntry={currentPlayerEntry}
			{toaster} 
			on:complete={(e) => handleSessionComplete(e.detail)} 
		/>
	{:else}
		<Game {stats} bind:word {toaster} bind:game={state} />
	{/if}
{/if}
