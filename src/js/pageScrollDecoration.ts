/**
 * <article>が連続する構成のページへ読み込みます。
 * import {initPageScrollDecoration} from "~ pageScrollDecoration.ts"
 * DOM構築後に initPageScrollDecorationを初期化してください
 *  → document.addEventListener('DOMContentLoaded', () => {initPageScrollDecoration();} );
 */

import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);


export function initPageScrollDecoration() {


// HTMLElement <article class="psd-article" data-index={index}> の配列
const articles = gsap.utils.toArray<HTMLElement>('.psd-article');
if (articles.length === 0) return;// コンテンツがなければ停止

// <main class="psd-page">
const pageContainer = document.querySelector('.psd-page') as HTMLElement | null;


// ------------------------------
// スクロール状態に合わせて実行するメソッド
// ------------------------------
// ==== プログレスインジケーターの更新処理 ====
function updateProgress(currentIndex: number) {
  const currentEl = document.getElementById('psd-current-index');
  const progressBar = document.getElementById('psd-progress-bar');
  
  if (currentEl) {
    currentEl.textContent = String(currentIndex).padStart(2, '0');
  }
  if (progressBar) {
    const progressPercent = (currentIndex / articles.length) * 100;
    gsap.to(progressBar, { height: `${progressPercent}%`, duration: 0.4 });
  }
}
// ==== 表示中<article>の背景色をスクロールバートラックに反映する ====
function updateScrollbarColor( currentArticle: HTMLElement ) {
  // 主コンテンツブロック <main> がない時は実行しない
  if (!pageContainer) return;
  // 引数の<article>に適用されている背景色 computed style の取得
  const computedBgColor = window.getComputedStyle(currentArticle).backgroundColor;
  // CSS変数 : --scrollbar-track-bg  へ背景色を移植する
  pageContainer.style.setProperty( '--scrollbar-track-bg', computedBgColor );

  // 明るい背景(Ex.#040619)の場合に thumb を色調反転させて視認性確保
  //  RGB値から簡易的に明度判定
  //  正規表現を用いて "rgb(r, g, b)" または "rgba(r, g, b, a)" から数値 = \d+ （0-255）のみを配列として抽出します。
  //  Ex. [ '100', '150', '200' ]
  const rgbMatch = computedBgColor.match(/\d+/g);
  //  正規表現マッチが空でなく、3要素以上の結果が返る
  if ( rgbMatch && rgbMatch.length >= 3 ) {
    // 10進数への変換が必要?
    const R = parseInt( rgbMatch[0], 10 );
    const G = parseInt( rgbMatch[1], 10 );
    const B = parseInt( rgbMatch[2], 10 );
    // RGBの値から輝度情報を取得します
    //  RGB値からの輝度(YIQ色空間:明るさ（白黒情報）)への変換アルゴリズム
    //  ... Y（輝度 / Luminance) : Y = (R*0.299) + (G*0.587) + (B*0.114)
    //      = (R*299 + G*587 + B*114) / 1000
    //      Y : 0(暗い) ~ 255(明るい)
    const brightness = ( R * 299 + G * 587 + B * 114 ) / 1000;
    // Y 輝度が 閾値 60 未満の場合に thumb を 白系にする
    if ( brightness < 60 ) {
      //暗い背景色の場合
      pageContainer.style.setProperty( '--scrollbar-thumb-bg', 'rgba(255, 255, 255, 0.65)' );
    } else {
      //明るい背景色の場合
      pageContainer.style.setProperty( '--scrollbar-thumb-bg', 'rgba(0, 0, 0, 0.25)' );
    }
  }

}// updateScrollbarColor()


// 各<article>要素にスクロール演出イベントを設置する
// <article>が覆い被さって重なる際に、下レイヤーの<article>が画面奥に向かって消える
articles.forEach( (article, index) => {

  // 最後の<article>以外に対して、次のセクションが被さってきた時の 前コンテンツ(article)の演出
  const nextArticle = articles[index + 1];

  const container = article.querySelector('.psd-article__container'); // 文章コンテンツ掲載エリア
  const title = article.querySelector('.psd-article__title');
  const description = article.querySelector('.psd-article__description');
  const bgImage = article.querySelector('.psd-article__bg-image');

  // ---------------------------------
  // コンテンツブロックの重なり度合い(位置固定)の設定 (GSAP Pinning)
  // ---------------------------------
  ScrollTrigger.create({
    trigger: article,
    start: 'top top', // when the top of the trigger hits the top of the viewport
    end: '+=100%', // end after scrolling +=100% beyond the start
    pin: true, // pin the trigger element while active
    pinSpacing: false,
    scrub: 1.2, // smooth scrubbing, takes 1.2 second to "catch up" to the scrollbar
    // スクロールバーの色を<article>に合わせてコントロールする
    //  ScrollTriggerの進捗やセクションの切り替わりイベント（onEnter / onEnterBack）を利用して、
    //  現在表示されている <article> の実際の背景色（window.getComputedStyle）または指定カラーを取得し、CSS変数 --scrollbar-track-bg を書き換える
    // when the scroll position moves forward past the "start"
    onEnter: () => { 
      updateProgress(index + 1);
      updateScrollbarColor( article );
    }, 
    // A callback for when the scroll position moves backward past the "end" (typically when the trigger is scrolled back into view)
    onEnterBack: () => { 
      updateProgress(index + 1); 
      updateScrollbarColor( article );
    }
  });

  // ---------------------------------
  // 次のArticleが上に重なってくる際のエフェクト ブラー＆ズームアウト
  // ---------------------------------
  if (nextArticle) {
    const exitTl = gsap.timeline({
      scrollTrigger: {
        trigger: nextArticle,
        start: 'top bottom', // 次のコンテンツ nextArticle が画面下部に侵入のタイミングで
        end: 'top top', // 画面上部に完全に重なる
        scrub: true
      }
    });

    // フレームアウトする(現在表示の)コンテンツ
    exitTl.to( container, {
      scale: 0.9,
      opacity: 0.3,
      filter: 'blur(10px)',
      y: '-10vh',
      ease: 'power2.inOut'
    }, 0);

    // 背景画像がある場合は ズームアウトと暗転 を行う
    if(bgImage) {
      exitTl.to( bgImage, {
        scale: 1.15,
        filter: 'brightness(0.4) blur(5px)',
        ease: 'power2.inOut'
      }, 0);
    }

  }

  // ---------------------------------
  // コンテンツがフレームインした時の演出
  // ---------------------------------
  gsap.timeline({
    scrollTrigger: {
      trigger: article,
      start: 'top 70%',
      toggleActions: 'play reverse play reverse' // Determines how the linked animation is controlled at the 4 distinct toggle places ... onEnter, onLeave, onEnterBack, onLeaveBack
                    // the following keywords for each action: "play", "pause", "resume", "reset", "restart", "complete", "reverse", and "none".
    }
  })
  .to( title, {
    y: '0%',
    duration: 1.2,
    ease: 'power4.out'
  })
  .to( description, {
    y: 0,
    opacity: 1,
    duration: 1.0,
    ease: 'power3.out'
  }, '-=0.8_');

  /* ---------------------------------------
  // 1. 各セクションのピン留め・レイヤー被せアニメーション
  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: article,
      start: 'top top',
      end: '+=100%',
      pin: true,
      pinSpacing: false, // 重なり合い（Overlapping）を実現
      scrub: 1, // 滑らかな慣性追従
      onEnter: () => updateProgress(index + 1),
      onEnterBack: () => updateProgress(index + 1)
    }
  });

  // 背景画像の視差効果（Parallax）
  if (bgImage) {
    tl.to(bgImage, {
      yPercent: 15,
      ease: 'none'
    }, 0);
  }

  // 2. テキストの優雅な単独イン・アニメーション（ScrollTrigger別軸）
  gsap.timeline({
    scrollTrigger: {
      trigger: article,
      start: 'top 60%',
      toggleActions: 'play reverse play reverse'
    }
  })
  .to(title, {
    y: '0%',
    duration: 1.2,
    ease: 'power4.out'
  })
  .to(description, {
    y: 0,
    opacity: 1,
    duration: 1.0,
    ease: 'power3.out'
  }, '-=0.8');
*/


});// end of articles.forEach()


}// initPageScrollDecoration()

