import diamondSutra from "../data/diamond-sutra.json";

type Translation = {
	id: string;
	language: string;
	translatedText: string;
};

type DiamondParagraph = {
	id: string;
	position: number;
	type: string;
	originalText: string;
	translations: Translation[];
};

export type KnowledgeCitation = {
	id: string;
	scriptureId: string;
	scriptureTitle: string;
	position: number;
	type: string;
	originalText: string;
	translation?: string;
	score: number;
};

export type KnowledgeAnswer = {
	answer: string;
	quote?: {
		source: string;
		text: string;
		translation?: string;
	};
	interpretation: string;
	citations: KnowledgeCitation[];
	source: "local-knowledge";
};

const scriptureTitle = "金刚般若波罗蜜经";
const scriptureId = "diamond-sutra";

const topicTerms = [
	"应作如是观",
	"应无所住",
	"降伏其心",
	"如是观",
	"如梦幻泡影",
	"凡所有相",
	"皆是虚妄",
	"无所住",
	"布施",
	"四相",
	"我相",
	"人相",
	"众生相",
	"寿者相",
	"因果",
	"执念",
	"安住",
	"空",
	"般若",
	"菩萨",
	"福德",
	"如来",
	"心",
];

function normalizeText(value: string) {
	const variants: Record<string, string> = {
		應: "应",
		觀: "观",
		無: "无",
		爲: "为",
		為: "为",
		夢: "梦",
		幻: "幻",
		泡: "泡",
		影: "影",
		電: "电",
		須: "须",
		菩: "菩",
		薩: "萨",
		眾: "众",
		壽: "寿",
		者: "者",
		相: "相",
		布: "布",
		施: "施",
		聲: "声",
		觸: "触",
		實: "实",
		虛: "虚",
		妄: "妄",
		離: "离",
		說: "说",
		經: "经",
	};

	return value
		.replace(/[應觀無爲為夢電須薩眾壽聲觸實虛離說經]/g, (char) => variants[char] ?? char)
		.replace(/\s+/g, "")
		.toLowerCase();
}

function getQuestionTerms(question: string) {
	const normalized = normalizeText(question);
	const terms = topicTerms.filter((term) => normalized.includes(normalizeText(term)));
	const chinesePairs = Array.from(question.matchAll(/[\u4e00-\u9fff]{2,}/g))
		.flatMap(([word]) => {
			if (word.length <= 4) return [word];
			return Array.from({ length: word.length - 1 }, (_, index) => word.slice(index, index + 2));
		})
		.filter((word) => word.length >= 2);

	return Array.from(new Set([question.trim(), ...terms, ...chinesePairs].filter(Boolean)));
}

function scoreParagraph(question: string, paragraph: DiamondParagraph) {
	const haystack = normalizeText(
		[
			paragraph.originalText,
			...paragraph.translations.map((translation) => translation.translatedText),
		].join(" ")
	);
	const terms = getQuestionTerms(question);

	return terms.reduce((score, term) => {
		const normalizedTerm = normalizeText(term);
		if (!normalizedTerm || normalizedTerm.length < 2) return score;
		if (!haystack.includes(normalizedTerm)) return score;
		return score + Math.min(12, normalizedTerm.length);
	}, 0);
}

function buildCitation(paragraph: DiamondParagraph, score: number): KnowledgeCitation {
	return {
		id: paragraph.id,
		scriptureId,
		scriptureTitle,
		position: paragraph.position,
		type: paragraph.type,
		originalText: paragraph.originalText,
		translation: paragraph.translations[0]?.translatedText,
		score,
	};
}

function buildAnswer(question: string, citations: KnowledgeCitation[]) {
	if (citations.length === 0) {
		return [
			`你问的是：「${question}」。`,
			"当前知识库里还没有检索到足够直接的经典依据，所以我不展开推断。",
			"可以先补充相关经典段落，或换一个更具体的问题再问。",
		].join("\n\n");
	}

	const first = citations[0];
	const translation = first.translation ? `白话参考：${first.translation}` : "";

	return [
		`你问的是：「${question}」。`,
		"基于这段经文，可以先这样理解：把问题放回因缘变化里看，先照见当下这一念的执着处，再决定自己能做的下一步。这个回答只基于本地知识库生成，没有调用网页搜索。",
		translation,
	]
		.filter(Boolean)
		.join("\n\n");
}

function buildInterpretation(question: string, citations: KnowledgeCitation[]) {
	if (citations.length === 0) {
		return "当前知识库里还没有检索到足够直接的经典依据，所以我不展开推断。可以先补充相关经典段落，或换一个更具体的问题再问。";
	}

	return `你问的是「${question}」。可以先把它放回因缘变化里看：当下这一念为什么会抓住某个判断、身份或结果？先照见这处执着，再决定自己能做的下一步。这个回答只基于本地知识库生成，没有调用网页搜索。`;
}

export function answerFromKnowledge(question: string, retrievalText = question): KnowledgeAnswer {
	const trimmedQuestion = question.trim();
	const paragraphs = (diamondSutra.paragraphs as DiamondParagraph[]).filter(
		(paragraph) => paragraph.originalText.trim() && paragraph.type !== "byline" && paragraph.type !== "juan"
	);

	const citations = paragraphs
		.map((paragraph) => ({ paragraph, score: scoreParagraph(retrievalText, paragraph) }))
		.filter((item) => item.score > 0)
		.sort((a, b) => b.score - a.score || a.paragraph.position - b.paragraph.position)
		.slice(0, 3)
		.map((item) => buildCitation(item.paragraph, item.score));

	return {
		answer: buildAnswer(trimmedQuestion, citations),
		quote: citations[0]
			? {
					source: `《${citations[0].scriptureTitle}》第 ${citations[0].position} 段`,
					text: citations[0].originalText,
					translation: citations[0].translation,
				}
			: undefined,
		interpretation: buildInterpretation(trimmedQuestion, citations),
		citations,
		source: "local-knowledge",
	};
}
