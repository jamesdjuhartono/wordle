/** A list of words of the same length */
type Words = WordData & {
	contains: (word: string) => boolean;
};

type WordData = {
	/** A list of possible words to guess */
	words: string[];
	/** A list of words that are valid when input by the user but will never get chosen as the word to guess */
	valid: string[];
};

type RowData = {
	length: number;
	guess: number;
};

type LetterState = "🔳" | "⬛" | "🟨" | "🟩";

type GameBoard = {
	words: string[],
	state: LetterState[][],
};

type SettingType = "switch" | "dropdown" | "custom";

type DictionaryEntry = {
	word: string;
	phonetic: string;
	phonetics: Phonetic[];
	origin: string;
	meanings: Meaning[];
};

type Meaning = {
	partOfSpeech: string;
	definitions: Definition[];
};

type Definition = {
	definition: string;
	synonyms: string[];
	antonyms: any[];
	example?: string;
};

type Phonetic = {
	text: string;
	audio: string;
};

type Guesses = {
	"1": number;
	"2": number;
	"3": number;
	"4": number;
	"5": number;
	"6": number;
	"fail": number;
};

type ModeData = {
	default: GameMode,
	modes: Mode[],
};

type Mode = {
	name: string,
	unit: number,
	start: number,
	seed: number,
	historical: boolean,
	icon?: string,
	streak?: boolean,
	useTimeZone?: boolean,
	sessionId?: string,
};

type HardModeData = {
	pos: number,
	char: string,
	type: "🟩" | "🟨" | "⬛",
};

type Subscriber<T> = [(val: T) => void, (val?: T) => void];

type Direction = "top" | "right" | "bottom" | "left";

type Swipe = CustomEvent<{ direction: Direction; }>;

type SessionProgress = {
	sessionId: string;
	currentWordIndex: number;
	completed: boolean;
	startTime: number;
	endTime?: number;
	wordResults: SessionWordResult[];
};

type SessionWordResult = {
	word: string;
	guesses: number;
	timeSpent: number;
	completed: boolean;
};

type LeaderboardEntry = {
	playerName: string;
	playerUid: string;
	sessionId: string;
	totalGuesses: number;
	totalTime: number;
	completedAt: number;
	wordsCompleted: number;
};
