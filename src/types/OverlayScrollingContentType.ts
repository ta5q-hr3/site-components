/**
 * overlayScrolling.astroに読み込むコンテンツデータの型定義です。
 * 
 */

/*
 export interface OverlayArticleItem {
  id: number;
  subtitle: string;
  body: string[];// 長文&複数段落構成への対応
  bgcolor: '#f9edd9' | '#040619';//背景色の指定
  image?: string;// 背景画像指定 省略可
 }
*/

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
