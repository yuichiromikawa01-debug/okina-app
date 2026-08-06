import type { Citation, Message, MessageBlock, Thread, Work } from "@/domain/types";
import {
  getCollectionById,
  getRelatedCollections,
  getWorksForCollection,
} from "@/data/repositories";

function pickRandom<T>(items: T[]): T {
  return items[Math.floor(Math.random() * items.length)];
}

function buildCitation(work: Work): Citation {
  const source = work.sampleExcerpt || work.description;
  const excerpt =
    source.length > 140 ? `${source.slice(0, 137)}...` : source;
  return {
    workId: work.id,
    excerpt,
  };
}

function blocksToPlainText(blocks: MessageBlock[]): string {
  return blocks
    .filter((block): block is { type: "text"; content: string } => block.type === "text")
    .map((block) => block.content)
    .join("\n\n");
}

function blocksToCitations(blocks: MessageBlock[]): Citation[] {
  return blocks
    .filter(
      (block): block is { type: "citation"; citation: Citation } =>
        block.type === "citation"
    )
    .map((block) => block.citation);
}

type CollectionArticle = {
  paragraphs: [string, string, string];
  citationIntros?: [string, string, string];
};

const COLLECTION_ARTICLES: Record<string, CollectionArticle> = {
  heartbreak: {
    paragraphs: [
      "失恋直後は、答えを急がないことがいちばん大切です。言葉に預ける時間を、自分に許してください。悲しみは消えるのではなく、輪郭を変えて残っていきます。",
      "別れた夜は、眠れないのではなく「眠ることを選べない」時間が続きます。スマホの画面だけが白く光り、通知は来ない——来ないはずだと分かっているのに、指が勝手にアプリを開く。そんな夜を、何度も繰り返すのは自然な反応です。",
      "記憶をどう扱うかを学ぶしかありません。写真を消す、連絡先を残す、プレイリストから一曲だけ外す——正解はありません。大事なのは、自分のペースで輪郭を更新することです。",
    ],
    citationIntros: [
      "熊野ねこは、別れ直後の夜の正体をこう描いています。",
      "村上春樹（編）の『別れの文法』は、言えなかった言葉を文章の型に変える手がかりをくれます。",
      "吉本ばななの『涙の化学』は、涙を「弱さ」ではなく「処理」として捉え直す視点を示します。",
    ],
  },
  "wine-deep": {
    paragraphs: [
      "ワインは知識よりも、五感を開く体験から始まります。まずは一本、ゆっくりと。ラベルを読む前に、グラスに注がれた色と香りに耳を澄ませてみてください。",
      "テロワールという言葉は、土壌や気候がブドウに与える個性を指します。同じ品種でも、産地が変われば表情がまったく違います。知識は、その違いを言葉にするための道具にすぎません。",
      "ペアリングは正解探しではなく、自分の好みを発見するプロセスです。料理とワインの相性は、教科書より舌が教えてくれることが多いです。",
    ],
    citationIntros: [
      "この一冊は、初めての一本を選ぶときの視点を整理してくれます。",
      "産地の違いが味わいにどう現れるか、具体的な描写があります。",
      "食事とワインの組み合わせを、体験として楽しむヒントが詰まっています。",
    ],
  },
  "baystars-success": {
    paragraphs: [
      "組織の成功は、現場の小さな改善の積み重ねから生まれます。大きな改革より、毎日の習慣のほうが、長期的な成果につながることが多いです。",
      "チームづくりで大切なのは、勝利の瞬間だけでなく、負けたあとの振り返りの質です。データと対話の両方を使って、次の一手を決めていく文化が根づくと、組織は強くなります。",
      "リーダーの役割は、答えを出すことより、現場が自分で考えられる環境をつくることです。権限委譲は放任ではなく、信頼の設計です。",
    ],
    citationIntros: [
      "現場の改善サイクルが、どう成果に結びつくかを描いた一節です。",
      "負けから学ぶチームの文化づくりについて、具体的な事例があります。",
      "リーダーシップと現場力のバランスを考えるうえで参考になる視点です。",
    ],
  },
  "ohtani-mind": {
    paragraphs: [
      "大谷翔平の思考は、「昨日より少し」という積み上げに集約されます。天才の閃きというより、毎日のルーティンと、失敗を次の準備に変える姿勢が核にあります。",
      "メンタル面では、結果だけを見ないことが大切です。打席や投球のプロセスに集中できるかどうかが、長いシーズンを戦い抜く鍵になります。",
      "挑戦を続けるには、完璧主義より「改善の余地」を残す考え方が効きます。自分を責める時間を、次の一手を考える時間に少しずつ置き換えていく——それが持続可能な成長です。",
    ],
    citationIntros: [
      "日々の積み上げをどう設計しているか、本人の言葉に近い形で伝えられています。",
      "プレッシャーのなかで集中を保つための考え方が、ここにあります。",
      "失敗後の切り替え方について、実践的なヒントが得られます。",
    ],
  },
  "twenties-goals": {
    paragraphs: [
      "20代は実験の時期です。正解より、試した回数があなたの輪郭をつくります。キャリアも生き方も、一度で決めなくていい——むしろ、決めすぎないほうが選択肢は広がります。",
      "周りと比較して焦る気持ちは自然ですが、タイムラインは人それぞれです。SNSに映る「成功」の裏には、見えない試行錯誤があります。",
      "小さな決断の積み重ねが、五年後の自分をつくります。今日一つだけ、やってみたいことを選んで実行してみる——それだけで十分な一歩になります。",
    ],
    citationIntros: [
      "20代の選択を、実験として捉え直す視点が参考になります。",
      "比較から距離を置き、自分のペースを取り戻すヒントがあります。",
      "今日からできる小さな行動を、具体的に提案してくれます。",
    ],
  },
};

const DEFAULT_ARTICLE: CollectionArticle = {
  paragraphs: [
    "ご質問の核心に触れています。まずは、いま感じていることを言葉にしてみることから始めましょう。正しい答えを急がなくて大丈夫です。",
    "このコレクションに集めた本たちは、あなたの問いに応えるように選ばれています。それぞれ異なる角度から、同じテーマに光を当てています。",
    "読む順番に決まりはありません。今夜は短い一節から、週末は長めの章へ——体調と気分に合わせて選んでください。",
  ],
};

const FOLLOW_UP_BY_COLLECTION: Record<string, string[]> = {
  heartbreak: [
    "どの本から読み始めたいですか？",
    "今の気持ちに一番近い本はどれだと思いますか？",
  ],
  "wine-deep": [
    "まず味わってみたい一本はありますか？",
    "ワインのどんな側面に興味がありますか？",
  ],
  "baystars-success": [
    "組織づくりと現場力、どちらから深掘りしたいですか？",
    "チームのどんな課題に当てはめてみたいですか？",
  ],
  "ohtani-mind": [
    "メンタル面と技術面、どちらを先に知りたいですか？",
    "自分の挑戦にどう活かしたいか教えてください。",
  ],
  "twenties-goals": [
    "キャリアと生き方、どちらの視点で話しましょうか？",
    "20代で一番変えたいことは何ですか？",
  ],
};

const DEFAULT_FOLLOW_UPS = [
  "どの本から読み始めたいですか？",
  "もう少し詳しく教えてもらえますか？",
];

function truncateUserMessage(message: string, max = 30): string {
  return `「${message.slice(0, max)}${message.length > max ? "..." : ""}」`;
}

function buildCollectionBlocks(
  userMessage: string,
  works: Work[],
  collectionId: string,
  collectionTitle: string
): MessageBlock[] {
  const article = COLLECTION_ARTICLES[collectionId] ?? DEFAULT_ARTICLE;
  const citedWorks = works.slice(0, Math.min(3, works.length));
  const blocks: MessageBlock[] = [];

  const intro = `「${collectionTitle}」の文脈で考えると、あなたの${truncateUserMessage(userMessage)}という問いは、とても大切なところに触れています。`;
  blocks.push({ type: "text", content: intro });

  blocks.push({ type: "text", content: article.paragraphs[0] });

  if (citedWorks[0]) {
    blocks.push({ type: "text", content: article.citationIntros?.[0] ?? `『${citedWorks[0].title}』から、こんな一節を拾ってきました。` });
    blocks.push({ type: "citation", citation: buildCitation(citedWorks[0]) });
  }

  blocks.push({ type: "text", content: article.paragraphs[1] });

  if (citedWorks[1]) {
    blocks.push({ type: "text", content: article.citationIntros?.[1] ?? `続いて、『${citedWorks[1].title}』の視点です。` });
    blocks.push({ type: "citation", citation: buildCitation(citedWorks[1]) });
  }

  blocks.push({ type: "text", content: article.paragraphs[2] });

  if (citedWorks[2]) {
    blocks.push({ type: "text", content: article.citationIntros?.[2] ?? `最後に、『${citedWorks[2].title}』から。` });
    blocks.push({ type: "citation", citation: buildCitation(citedWorks[2]) });
  }

  const followUps = FOLLOW_UP_BY_COLLECTION[collectionId] ?? DEFAULT_FOLLOW_UPS;
  const followUp = pickRandom(followUps);
  blocks.push({ type: "text", content: followUp });

  return blocks;
}

function buildGeneralBlocks(userMessage: string): MessageBlock[] {
  const related = getRelatedCollections(2);
  const names = related.map((c) => c.title).join("、");
  return [
    {
      type: "text",
      content: `ご質問ありがとうございます。${truncateUserMessage(userMessage, 40)}について、まずは関連するコレクション——${names}——から探すのがおすすめです。`,
    },
    {
      type: "text",
      content:
        "気になるテーマを選ぶと、そのコレクションの本を参照しながら、もう少し深くお話しできます。どのテーマが、いまのあなたに近いと感じますか？",
    },
  ];
}

export function generateCollectionSelectReply(
  userMessage: string,
  collectionId: string
): Pick<Message, "content" | "blocks" | "citations"> {
  const works = getWorksForCollection(collectionId);
  const collection = getCollectionById(collectionId);
  const collectionTitle = collection?.title ?? "このコレクション";

  const blocks = buildCollectionBlocks(
    userMessage,
    works,
    collectionId,
    collectionTitle
  );
  const citations = blocksToCitations(blocks);

  return {
    content: blocksToPlainText(blocks),
    blocks,
    citations: citations.length ? citations : undefined,
  };
}

export function generateMockReply(
  userMessage: string,
  thread: Thread
): Message {
  const works = thread.collectionId
    ? getWorksForCollection(thread.collectionId)
    : [];
  const collection = thread.collectionId
    ? getCollectionById(thread.collectionId)
    : undefined;

  const blocks = collection
    ? buildCollectionBlocks(
        userMessage,
        works,
        thread.collectionId!,
        collection.title
      )
    : buildGeneralBlocks(userMessage);

  const citations = blocksToCitations(blocks);

  return {
    id: crypto.randomUUID(),
    role: "assistant",
    content: blocksToPlainText(blocks),
    blocks,
    citations: citations.length ? citations : undefined,
    createdAt: new Date().toISOString(),
  };
}

export function generateThreadTitle(firstMessage: string): string {
  const trimmed = firstMessage.trim();
  if (trimmed.length <= 28) return trimmed;
  return `${trimmed.slice(0, 28)}...`;
}
