export interface SessionWord {
	word: string;
	hint: string;
	length: number;
	image?: string;
}

export interface SessionData {
	id: string;
	name: string;
	words: SessionWord[];
}

// Pre-configured session data
export const sessionData: Record<string, SessionData> = {
	"demo": {
		id: "demo",
		name: "Demo Session",
		words: [
			{ word: "cat", hint: "A common household pet that meows", length: 3 },
			{ word: "house", hint: "A place where people live", length: 5 },
			{ word: "computer", hint: "An electronic device for processing data", length: 8 },
			{ word: "elephant", hint: "The largest land mammal with a trunk", length: 8 },
			{ word: "programming", hint: "The process of creating computer software", length: 11 }
		]
	},
	"animals": {
		id: "animals",
		name: "Animal Kingdom",
		words: [
			{ word: "dog", hint: "Man's best friend", length: 3 },
			{ word: "tiger", hint: "Large striped cat from Asia", length: 5 },
			{ word: "dolphin", hint: "Intelligent marine mammal", length: 7 },
			{ word: "butterfly", hint: "Colorful insect that undergoes metamorphosis", length: 9 },
			{ word: "hippopotamus", hint: "Large African mammal that lives in water", length: 12 }
		]
	},
	"science": {
		id: "science",
		name: "Science & Technology",
		words: [
			{ word: "atom", hint: "The smallest unit of matter", length: 4 },
			{ word: "galaxy", hint: "A collection of billions of stars", length: 6 },
			{ word: "molecule", hint: "Two or more atoms bonded together", length: 8 },
			{ word: "photosynthesis", hint: "Process by which plants make food from sunlight", length: 14 },
			{ word: "dna", hint: "Genetic material in living organisms", length: 3 }
		]
	},
	"geography": {
		id: "geography",
		name: "World Geography",
		words: [
			{ word: "ocean", hint: "Large body of salt water", length: 5 },
			{ word: "mountain", hint: "High elevation landform", length: 8 },
			{ word: "desert", hint: "Dry, arid region with little rainfall", length: 6 },
			{ word: "archipelago", hint: "A group of islands", length: 11 },
			{ word: "continent", hint: "One of the seven large landmasses", length: 9 }
		]
	},
	"weddle":{
		id: "weddle",
		name: "Weddle Words",
		words: [
			{ word: "hinge", hint: "How James and Kim met", length: 5, image: "img/dating_app.jpg" },
			{ word: "guzman", hint: "Our favorite fastfood takeout", length: 6, image: "img/guzman.jpeg" },
			{ word: "alphafly", hint: "Shoes that James and Kim will wear to their half marathon", length: 8, image: "img/alpha_fly.png" },
			{ word: "takayama", hint: "The restaurant where James proposed", length: 8, image: "img/takayama.jpg" },
			{ word: "paddlepop", hint: "The name of rainbow bear that James won for Kim", length: 9, image: "img/paddlepop.jpg" }
		]
	}
};

// Function to get session by ID
export function getSessionById(sessionId: string): SessionData | null {
	return sessionData[sessionId] || null;
}

// Function to get all available sessions
export function getAllSessions(): SessionData[] {
	return Object.values(sessionData);
}
