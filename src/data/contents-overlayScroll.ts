/**
 * overlayScrolling.astroに読み込むコンテンツデータです。
 * 
 * - 背景色の指定  #f9edd9 / #040619
 * - articleの内容の拡張性を確保
 */

import type { OverlayScrollingArticle } from "@/types/OverlayScrollingContentType";


/*
// コンテンツの最小単位
export type ItemType =
 | { type: "text"; body: string }// テキストコンテンツ
 | { type: "image"; url: string; alt?: string; caption?: string };// 画像コンテンツ
// | { type: "code"; code: string; language?: string; caption?: string }  // 拡張用 サンプルコード
// | { type: "video"; url: string; control?: string; option?: string; } // 拡張用 Video要素

// 最小単位コンテンツ群(配列) <p>相当
export interface Blocks {
  id?: string;        //コンテンツ内識別子(機能拡張用)
  title?: string;     //小項目タイトル  省略可
  itemtype: ItemType; //コンテンツの最小単位
}

// 中項目 最小単位群を内包するセクション <section>相当
export interface Contents {
  id?: string;          //コンテンツ内識別子(機能拡張用)
  title?: string;       //中項目(セクション)タイトル
  overview?: string;    //セクション導入文 省略可
  blocks: Blocks[];
}

export interface OverlayScrollingArticle {
  id: number;
  subtitle: string;
  title: string;
  bgColor: 'light' | 'dark';// '#f9edd9' | '#040619'  背景色指定
  content: Contents[];
}

*/


export const overlayContents: OverlayScrollingArticle[] = [
{
//Article
  id: 1,
  subtitle: "CONCEPT 01",
  title: "Ethereal Resonance",
  bgColor: "light",//#f9edd9
  content: [
    {
      title: "Introduction to Minimalism",
      overview: "静寂の中に宿る光と影。ミニマリズムがもたらす新しい視覚体験の幕開け。",
      blocks: [
        {
          itemtype: {
            type: "text",
            body: "余白の美学を追求し、ユーザーの意識を本質的なコンテンツへと導く洗練されたインタラクションを構築します。"
          }
        }
      ]//blocks
    }// content
  ]
//Article
},
{
//Article  
  id: 2,
  subtitle: "CONCEPT 02",
  title: "Cybernetic Void",
  bgColor: "dark",//#04619
  content: [
    {
      title: "Dark Mode Accessibility",
      overview: "深淵なる漆黒の空間に浮かび上がる幾何学構造。",
      blocks: [
        {
          itemtype: {
            type: "text",
            body: "暗色系（#040619）の背景では、視認性を自動判定してテキストカラーがクリーンな白系へ反転します。"
          }
        }
      ]
    }
  ]
//Article
},
{
//Article
  id: 3,
  subtitle: "CONCEPT 03",
  title: "Harmonic Flow",
  bgColor: "light",//#f9edd9
  content: [
    {
      title: "Layered Dynamics",
      blocks: [
        {
          itemtype: {
            type: "text",
            body: "異なるトーンが滑らかに交錯するレイヤー構造。スクロールの進行とともに世界観がダイナミックに切り替わります。"
          }
        }
      ]
    }
  ]
//Article
},
{
//Article
  id: 4,
  subtitle: "CONCEPT 04",
  title: "Quantum Matrix",
  bgColor: "dark",//#04619
  content: [
    {
      title: "Grid Systems",
      blocks: [
        {
          itemtype: {
            type: "text",
            body: "無限の拡張性を持つデータグリッド。どのような長大なコンテンツが含まれても破綻しない堅牢な設計。"
          }
        }
      ]
    }
  ]
//Article
},
{
//Article
  id: 5,
  subtitle: "CONCEPT 05",
  title: "Organic Genesis",
  bgColor: "light",//#f9edd9
  content: [
    {
      title: "Future Interfaces",
      blocks: [
        {
          itemtype: {
            type: "text",
            body: "自然の有機的フォルムとテクノロジーが融合する未来のインターフェース。すべての体験が美しく調和します。"
          }
        }
      ]
    }
  ]
//Article
}

];
// OverlayScrollingArticle
