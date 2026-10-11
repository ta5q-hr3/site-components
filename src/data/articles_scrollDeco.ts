export type Article = {
  index: number;
  title: string;
  subtitle: string;
  description: string;
  bgImage: string;
};

export const articlesData: Article[] = [

{
index: 1,
title: "アフォーダンスとシグニファイア",
subtitle: "Donald Norman — The Design of Everyday Things",
description:
  `モノが「できること」と、それを「伝える手がかり」。迷わせないデザインの出発点。
文化的背景や生活習慣、ユーザーのこれまでの経験から導き出される、近く対象に対する反射的理解について、ことこまかに分析することで、グローバルな機能性が実現されます。

そしてこの長いコンテンツ例がどのように表示されるかを検証するため、長い文章を用意しています。

現在の仕様では<article>内の構成を弄ることが難しそうなので、いったんテキストコンテンツの量を爆増させて縦長のブロックを再現しみましょう。

このページでは以下のブロックを用意しています。
 1. アフォーダンスとシグニファイア(ドナルド・ノーマン)
 2. 実行と評価の隔たり(ドナルド・ノーマン)
 3. less, but better(ディーター・ラムス)
 4. ユーザビリティ10原則(ヤコブ・ニールセン)
 5. ダブルダイヤモンド(英国デザイン評議会)
 6 .デザイン思考(IDEO / スタンフォードd.school)
 7. ゲシュタルトの法則(ウェルトハイマー、コフカ)


画像については以下の仕様で設定できます。
・1600×900 の暗色背景に、線画の図解です。テーマごとにアクセントカラーを変えています。
・例えば 01 はドアで「アフォーダンス→シグニファイア→フィードバック」を示し、06 は5段階が循環する図です。
・文字化けを避けるため、図中の文字は英語のみです。
・形式はSVGで、bgImage は /image/bg-01.svg のように指定しています。例示の .webp にしたい場合は、変換後に拡張子だけ書き換えてください。
・articles.ts は public/ 直下に image/ フォルダごと置く想定です。
`,
bgImage: "",
//bgImage: "/images/bg2.webp",
//bgImage: "/image/bg-01.svg",
},
{
index: 2,
title: "実行と評価の隔たり",
subtitle: "Donald Norman — Gulfs of Execution & Evaluation",
description:
  "やりたいことと操作の間、結果と理解の間。ユーザーが感じる二つの溝に橋をかける",
bgImage: "",
//bgImage: "/image/bg-02.svg",
},
{
index: 3,
title: "less, but better",
subtitle: "Dieter Rams — Ten Principles of Good Design",
description:
  "少なく、しかしより良く。装飾を削ぎ落とした先に残る、本質的な美しさ",
bgImage: "",
//bgImage: "/image/bg-03.svg",
},
{
index: 4,
title: "ユーザビリティ10原則",
subtitle: "Jakob Nielsen — 10 Usability Heuristics",
description:
  "可視性、一貫性、エラー防止。インターフェースを点検するための十の視点",
bgImage: "",
//bgImage: "/image/bg-04.svg",
},
{
index: 5,
title: "ダブルダイヤモンド",
subtitle: "British Design Council — Double Diamond",
description:
  "発散と収束を二度くり返す。課題を正しく見つけ、解決策を正しく形にする道のり",
bgImage: "",
//bgImage: "/image/bg-05.svg",
},
/*
{
index: 6,
title: "デザイン思考",
subtitle: "IDEO / Stanford d.school — Design Thinking",
description:
  "共感から始まり、試作と検証を行き来する。人を中心に据えた創造のプロセス",
bgImage: "/image/bg-06.svg",
},
{
index: 7,
title: "ゲシュタルトの法則",
subtitle: "Max Wertheimer, Kurt Koffka — Gestalt Principles",
description:
  "近接、類同、閉合。人が無意識にまとまりを見出す知覚の仕組みを味方につける",
bgImage: "/image/bg-07.svg",
},
*/

];
