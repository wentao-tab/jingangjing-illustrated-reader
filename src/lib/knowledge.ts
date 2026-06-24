import diamondSutra from "../data/diamond-sutra.json";
import scripturesCatalog from "../data/knowledge/scriptures.json";
import nanHuaijinOutline from "../data/knowledge/commentary-outlines/nan-huaijin-jingangjing.json";
import platformSutraOutline from "../data/knowledge/commentary-outlines/tanjing-shangrong.json";

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
	sourceKind?: string;
	author?: string;
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
	"云何应住",
	"住心",
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
	"业障",
	"业报",
	"愿力",
	"孝亲",
	"禅宗",
	"坛经",
	"见性",
	"无念",
	"顿悟",
	"净土",
	"方便",
	"受持",
	"忍辱",
	"无得",
	"无说",
	"非相",
	"功德",
	"正信",
	"离相",
	"无我",
	"法华",
	"地藏",
];

const sourceKindLabels: Record<string, string> = {
	"经文原文": "经文原文",
	"经典目录": "经典目录",
	"commentary-outline": "讲解提纲",
	"annotated-scripture-outline": "译注提纲",
};

type CatalogItem = {
	id: string;
	title: string;
	kind: string;
	priority: number;
	dynasty?: string;
	translatorOrAuthor?: string;
	topics?: string[];
	status?: {
		content?: string;
	};
};

type OutlineChapter = {
	number: number;
	title: string;
	topics: string[];
};

type OutlineSource = {
	sourceId: string;
	targetScriptureId: string;
	title: string;
	author: string;
	sourceKind: string;
	introTopics: string[];
	chapters: OutlineChapter[];
};

type KnowledgeEntry = {
	id: string;
	scriptureId: string;
	scriptureTitle: string;
	position: number;
	type: string;
	originalText: string;
	translation?: string;
	sourceKind: string;
	author?: string;
	weight: number;
};

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
	const expandedTerms: string[] = [];

	if (normalized.includes("安住") || normalized.includes("住心")) {
		expandedTerms.push("云何应住", "降伏其心", "无所住");
	}
	if (normalized.includes("执念") || normalized.includes("执着")) {
		expandedTerms.push("无所住", "所住", "降伏其心");
	}
	if (normalized.includes("放下") || normalized.includes("因果")) {
		expandedTerms.push("因果", "业报", "因缘");
	}
	if (normalized.includes("布施") || normalized.includes("功德")) {
		expandedTerms.push("布施", "福德", "功德", "不住相");
	}
	if (normalized.includes("无念") || normalized.includes("坛经")) {
		expandedTerms.push("坛经", "无念", "见性", "禅宗");
	}

	const chinesePairs = Array.from(question.matchAll(/[\u4e00-\u9fff]{2,}/g))
		.flatMap(([word]) => {
			if (word.length <= 4) return [word];
			return Array.from({ length: word.length - 1 }, (_, index) => word.slice(index, index + 2));
		})
		.filter((word) => !["怎么", "什么", "如何", "理解", "遇到", "时候", "问题", "自己", "可以", "一个", "不是", "是否"].includes(word))
		.filter((word) => word.length >= 2);

	return Array.from(new Set([question.trim(), ...terms, ...expandedTerms, ...chinesePairs].filter(Boolean)));
}

function scoreText(question: string, text: string, weight = 1) {
	const haystack = normalizeText(text);
	const terms = getQuestionTerms(question);

	return terms.reduce((score, term) => {
		const normalizedTerm = normalizeText(term);
		if (!normalizedTerm || normalizedTerm.length < 2) return score;
		if (!haystack.includes(normalizedTerm)) return score;
		return score + Math.round(Math.min(14, normalizedTerm.length + 1) * weight);
	}, 0);
}

function buildCatalogEntries(): KnowledgeEntry[] {
	return (scripturesCatalog.items as CatalogItem[]).map((item) => ({
		id: `catalog-${item.id}`,
		scriptureId: item.id,
		scriptureTitle: item.title,
		position: item.priority,
		type: "catalog",
		originalText: `${item.title}：${item.topics?.join("、") || "佛教经典"}。${item.translatorOrAuthor || ""}${item.dynasty ? `，${item.dynasty}` : ""}`,
		translation: item.status?.content === "ready" ? "本经典已有本地正文，可继续细读。" : "本经典已进入目录，正文待补全。",
		sourceKind: "经典目录",
		author: item.translatorOrAuthor,
		weight: item.status?.content === "ready" ? 0.95 : 0.55,
	}));
}

function buildOutlineEntries(outline: OutlineSource): KnowledgeEntry[] {
	const introEntry: KnowledgeEntry = {
		id: `${outline.sourceId}-intro`,
		scriptureId: outline.targetScriptureId,
		scriptureTitle: outline.title,
		position: 0,
		type: "outline-intro",
		originalText: `${outline.title}导读：${outline.introTopics.join("、")}`,
		translation: `${outline.author}相关提纲，可作为理解方向，不直接替代经典原文。`,
		sourceKind: outline.sourceKind,
		author: outline.author,
		weight: 0.9,
	};

	return [
		introEntry,
		...outline.chapters.map((chapter) => ({
			id: `${outline.sourceId}-${chapter.number}`,
			scriptureId: outline.targetScriptureId,
			scriptureTitle: outline.title,
			position: chapter.number,
			type: "outline-chapter",
			originalText: `第 ${chapter.number} 章「${chapter.title}」：${chapter.topics.join("、")}`,
			translation: `${outline.author}相关提纲，适合用来定位问题所在章节和主题。`,
			sourceKind: outline.sourceKind,
			author: outline.author,
			weight: 1,
		})),
	];
}

function buildKnowledgeEntries(): KnowledgeEntry[] {
	const paragraphs = (diamondSutra.paragraphs as DiamondParagraph[])
		.filter((paragraph) => paragraph.originalText.trim() && paragraph.type !== "byline" && paragraph.type !== "juan")
		.map((paragraph) => ({
			id: paragraph.id,
			scriptureId,
			scriptureTitle,
			position: paragraph.position,
			type: paragraph.type,
			originalText: paragraph.originalText,
			translation: paragraph.translations[0]?.translatedText,
			sourceKind: "经文原文",
			author: "鸠摩罗什译",
			weight: 1.25,
		}));

	return [
		...paragraphs,
		...buildOutlineEntries(nanHuaijinOutline as OutlineSource),
		...buildOutlineEntries(platformSutraOutline as OutlineSource),
		...buildCatalogEntries(),
	];
}

function buildCitation(entry: KnowledgeEntry, score: number): KnowledgeCitation {
	return {
		id: entry.id,
		scriptureId: entry.scriptureId,
		scriptureTitle: entry.scriptureTitle,
		position: entry.position,
		type: entry.type,
		originalText: entry.originalText,
		translation: entry.translation,
		sourceKind: entry.sourceKind,
		author: entry.author,
		score,
	};
}

function getMatchedTopics(question: string, citations: KnowledgeCitation[]) {
	const questionText = normalizeText(question);
	const citationText = normalizeText(citations.map((citation) => citation.originalText).join(" "));
	const questionTopics = topicTerms.filter((term) => questionText.includes(normalizeText(term)));
	const expandedQuestionTopics = getQuestionTerms(question).filter((term) =>
		topicTerms.some((topic) => normalizeText(topic) === normalizeText(term))
	);
	const citationTopics = topicTerms.filter((term) => citationText.includes(normalizeText(term)));

	return Array.from(new Set([...questionTopics, ...expandedQuestionTopics, ...citationTopics])).slice(0, 5);
}

function getThemeGuidance(topics: string[]) {
	const joined = topics.join("、");

	if (topics.some((topic) => ["应作如是观", "如是观", "如梦幻泡影", "凡所有相", "皆是虚妄", "非相"].includes(topic))) {
		return `这组依据的重点在“观”：先承认眼前感受很真，但不要急着把它判成最终事实。所谓如梦幻泡影，不是说事情没有发生，而是提醒你别被一时显现拖着走。`;
	}

	if (topics.some((topic) => ["因果", "业报", "业障", "愿力"].includes(topic))) {
		return `这组依据更接近“因缘”：因果不是宿命论，而是提醒你看清已有条件、正在造作的条件，以及当下还能改变的条件。放下不是不负责，而是不再用焦虑替代行动。`;
	}

	if (topics.some((topic) => ["布施", "福德", "功德", "受持"].includes(topic))) {
		return `这组依据在分辨“功德”和“执功德”：事情可以认真做，善意可以真实给出，但如果一直抓着“我付出了、我应该得到”，心又回到了交换和证明里。`;
	}

	if (topics.some((topic) => ["应无所住", "无所住", "安住", "执念", "心", "降伏其心", "云何应住", "住心"].includes(topic))) {
		return `这组依据指向“住心”：真正要处理的不是外境本身，而是心黏在外境后的反复拉扯。先看见自己正住在什么上，再把注意力收回下一步行动。`;
	}

	if (topics.some((topic) => ["我相", "人相", "众生相", "寿者相", "无我", "四相"].includes(topic))) {
		return `这组依据在照见“四相”：很多痛苦不是事情本身，而是“我必须被理解、我不能输、我必须正确”的形象维护。把我相放小，问题本身会清楚很多。`;
	}

	if (topics.some((topic) => ["坛经", "见性", "无念", "顿悟", "禅宗"].includes(topic))) {
		return `这组依据更偏禅宗语境：重点不是把道理说得更玄，而是在当下这一念里看见自己的反应模式。能看见，就已经从自动反应里松开一点。`;
	}

	if (topics.some((topic) => ["无得", "无说", "空", "般若"].includes(topic))) {
		return `这组依据提醒“不可执为所得”：理解可以发生，结果也可以争取，但不要把某个答案、身份或成果变成新的束缚。般若不是多拿一个概念，而是少被一个概念牵走。`;
	}

	if (joined) {
		return `这组依据主要围绕「${joined}」。可以先不急着求一个绝对答案，而是看这些关键词正在把你的问题带向哪个执着点、哪个可行动的位置。`;
	}

	return "这组依据提示：先回到具体情境，分清哪些是事实，哪些是情绪解释，哪些是自己正在追加的判断。";
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
	const topics = getMatchedTopics(question, citations);
	const translation = first.translation ? `白话参考：${first.translation}` : "";
	const sources = Array.from(new Set(citations.map((citation) => `${sourceKindLabels[citation.sourceKind || ""] || "知识库"}《${citation.scriptureTitle}》`)));

	return [
		`你问的是：「${question}」。`,
		`本次命中：${sources.join("、")}。`,
		getThemeGuidance(topics),
		translation,
	]
		.filter(Boolean)
		.join("\n\n");
}

function buildInterpretation(question: string, citations: KnowledgeCitation[]) {
	if (citations.length === 0) {
		return "当前知识库里还没有检索到足够直接的经典依据，所以我不展开推断。可以先补充相关经典段落，或换一个更具体的问题再问。";
	}

	const topics = getMatchedTopics(question, citations);
	const topCitation = citations[0];
	const sourceLine = `${sourceKindLabels[topCitation.sourceKind || ""] || "知识库"}《${topCitation.scriptureTitle}》第 ${topCitation.position} 段`;
	const practicalQuestion = topics.length
		? `你可以先问自己：我现在是被「${topics.slice(0, 3).join("、")}」中的哪一处牵住了？`
		: "你可以先问自己：这件事里，事实、情绪和自我证明分别是什么？";

	return [
		`你问的是「${question}」。我先从 ${sourceLine} 入手，而不是套一个固定答案。`,
		getThemeGuidance(topics),
		`落到当下，重点不是马上压掉情绪，也不是把道理讲赢，而是先分清：这件事真正需要处理的是什么，哪些只是心里追加出来的故事。${practicalQuestion}`,
		"这个回答只调用本地知识库生成，没有调用网页搜索；下面的依据会列出实际命中的经典或提纲。",
	].join("\n\n");
}

export function answerFromKnowledge(question: string, retrievalText = question): KnowledgeAnswer {
	const trimmedQuestion = question.trim();
	const entries = buildKnowledgeEntries();

	const citations = entries
		.map((entry) => ({
			entry,
			score: scoreText(
				retrievalText,
				[entry.originalText, entry.translation, entry.scriptureTitle, entry.sourceKind, entry.author].filter(Boolean).join(" "),
				entry.weight
			),
		}))
		.filter((item) => item.score > 0)
		.sort((a, b) => b.score - a.score || a.entry.position - b.entry.position)
		.slice(0, 5)
		.map((item) => buildCitation(item.entry, item.score));

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
