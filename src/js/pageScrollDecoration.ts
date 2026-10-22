/**
 * <article>が連続する構成のページへ読み込みます。
 * import {initPageScrollDecoration} from "~ pageScrollDecoration.ts"
 * DOM構築後に initPageScrollDecorationを初期化してください
 *  → document.addEventListener('DOMContentLoaded', () => {initPageScrollDecoration();} );
 */

import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

/** -----------------------------
 * Exported main method
 * ------------------------------ */
export function initPageScrollDecoration() {


// HTMLElement <article class="psd-article" data-index={index}> の配列
const articles = gsap.utils.toArray<HTMLElement>('.psd-article');
if (articles.length === 0) return;// コンテンツがなければ停止

// <main class="psd-page">
const pageContainer = document.querySelector('.psd-page') as HTMLElement | null;

// 画面の高さを取得する
const windowHeight = window.innerHeight;


// ---------------------------------------------------
// スクロール状態に合わせて実行するメソッド群
// ---------------------------------------------------

// ==== コンテンツ量が<article>から溢れるラッパーの overflow分を取得する ====
const getOverflowHeight = ( container: HTMLElement | null ) => {
  if (!container) return 0;
  const containerHeight = container.offsetHeight;// border,paddingを含む高さ
  //return containerHeight > windowHeight ? containerHeight - windowHeight + 100 : 0;// overflowがある場合はその幅(=差分)を返す
  return containerHeight > windowHeight ? containerHeight - windowHeight : 0;// overflowがある場合はその幅(=差分)を返す
}

// ==== ScrollTriggerのピン留め間隔を動的に指定する ====
// 各 <article> の実際の高さ（offsetHeight）を取得し、画面の高さ（window.innerHeight）を超えている場合は、その差分だけピン留め（pin）のスクロール量を動的に加算・延長する
// ... 最後のブロックに演出/プログレスが適用されない問題への対処
const getPinDuration = ( article:HTMLElement ) => {
  const articleHeight = article.offsetHeight;// border,paddingを含むHTML要素の高さ number
  // コンテンツの高さが画面の高さを超えている場合、溢れている分のスクロール領域を延長する
  if ( articleHeight > windowHeight) {
    return `+=${articleHeight}`;
  }
  return '+=100%';// 画面内に収まる場合は画面と同じ高さ
};

// ==== プログレスインジケーターの更新処理 ====
// globalProgress : <main class="psd-page">のスクロール量 %  0.0 ~ 1.0
function updateProgress( currentIndex: number, globalProgress: number) {
  const currentEl = document.getElementById('progress-bar-current-index');
  const progressBar = document.getElementById('progress-bar');
  
  if (currentEl) {
    currentEl.textContent = String(currentIndex).padStart(2, '0');
  }
  if (progressBar) {
    // スクロール最下部にさしかかったら 100% へ (演出のおかげで最下段までスクロールできないので)
    let calcPercent = globalProgress * 100;
    if ( globalProgress >= 0.96 ) { // 96%以上スクロールしたら...
      calcPercent = 100;// 強制的にMAX 100% にします
    }
    // percentの値を 0 以上、 100 以下 に しています
    const percent = Math.min( Math.max(calcPercent,0), 100 );
    // プログレス表示=バーの長さ をページ全体のスクロール量(0%~100%)に合わせて 追従させる
    /*
    const percent = Math.min(
      Math.max( globalProgress * 100, ( 1 / articles.length ) * 100 ),
      100
    );
    */
    //const progressPercent = (currentIndex / articles.length) * 100;
    gsap.to( progressBar, {
      height: `${percent}%`,
      duration: 0.2,
      ease: 'power1.out',
      overwrite: 'auto'
    });
    //gsap.to(progressBar, { height: `${progressPercent}%`, duration: 0.4, overwrite: 'auto' });
  }
}

// ==== 表示中<article>の背景色をスクロールバートラックに反映する ====
function updateScrollbarColor( currentArticle: HTMLElement ) {
  // 主コンテンツブロック <main> がない時は実行しない
  if (!pageContainer) return;
  // 引数の<article>に適用されている背景色 computed style の取得して
  // CSS変数 : --scrollbar-track-bg  へ背景色を移植する
  const computedBgColor = window.getComputedStyle(currentArticle).backgroundColor;
  pageContainer.style.setProperty( '--scrollbar-track-bg', computedBgColor );

  // 明るい背景(Ex.#040619)の場合に thumb を色調反転させて視認性確保
  //  RGB値から簡易的に明度判定
  //  正規表現を用いて "rgb(r, g, b)" または "rgba(r, g, b, a)" から数値 = \d+ （0-255）のみを配列として抽出します。
  //  Ex. [ '100', '150', '200' ]
  const rgbMatch = computedBgColor.match(/\d+/g);
  //  正規表現マッチが空でなく、3要素以上の結果が返る
  if ( rgbMatch && rgbMatch.length >= 3 ) {
    // 10進数への変換
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
// ---------------------------------------------------



// 各<article>要素にスクロール演出イベントを設置する
//  演出内容 : <article>が覆い被さって重なる際に、下レイヤーの<article>が画面奥に向かって消える
//    最後の<article>以外に対して演出付与
articles.forEach( (article, index) => {
  const nextArticle = articles[index + 1];// 対象articleの次のarticle
  const container = article.querySelector('.psd-article__container') as HTMLElement | null; // コンテンツ掲載エリア
  const title = article.querySelector('.psd-article__title');
  const description = article.querySelector('.psd-article__description');
  const bgImage = article.querySelector('.psd-article__bg-image');

  //if (!container) return; // コンテンツコンテナがない場合に停止

  const overflowHeight = getOverflowHeight( container );

  // article ブロックのピン留め :: 画面の縦幅に対してoverflowする領域のスクロールを動的に延伸する
  /*
  const mainTL = gsap.timeline({
    scrollTrigger: {
      trigger: article,
      start: 'top top',
      end: () => `+=${ windowHeight + overflowHeight }`,// overflow領域を加算したスクロール終了位置に設定する
      pin: true,
      pinSpacing: false,
      scrub: 1.2,
      invalidateOnRefresh: true
    }
  });
  // overflow領域がある場合にピン留めを上へスライドさせる
  if ( overflowHeight > 0 ) {
    mainTL.to( container, {
      y: () => -overflowHeight, // ｙ方向を減算してみる...
      ease: 'none'
    }, 0 );
  }
  */

  // ---------------------------------
  // コンテンツブロックの重なり度合い(位置固定)の設定 (GSAP Pinning)
  // ---------------------------------
  ScrollTrigger.create({
    trigger: article,
    start: 'top top', // when the top of the trigger hits the top of the viewport
    end: getPinDuration(article),
    //end: '+=100%', // end after scrolling +=100% beyond the start
    pin: true, // pin the trigger element while active
    pinSpacing: false,
    scrub: 1.2, // smooth scrubbing, takes 1.2 second to "catch up" to the scrollbar
    invalidateOnRefresh: true // リサイズ時・レスポンシブ時の再計算を有効化
    /*
    // 各セクションのピン留め・スクロールの進捗割合（progress）を検知して動的にインデックスを計算するロジック
    // onToggle / onUpdate で状態変化を監視する
    // onToggle : セクションがアクティブ状態に入った（self.isActive === true）タイミングを監視
    onToggle: (self) => {
      if ( self.isActive ) {
        updateProgress( index + 1 );
        updateScrollbarColor( article );
      }
    },
    // すばやくスクロールした場合や最下部到達時の補正
    onUpdate: (self) => {
      // 最後のセクション かつ スクロール進捗が少しでも進んだら 最下部のindexで指定する
      if ( index === articles.length -1 && self.progress > 0.1 ) {
        updateProgress( articles.length );
        updateScrollbarColor( article );
      }
    }
    */
    // スクロールバーの色を<article>に合わせてコントロールする
    //  ScrollTriggerの進捗やセクションの切り替わりイベント（onEnter / onEnterBack）を利用して、
    //  現在表示されている <article> の実際の背景色（window.getComputedStyle）または指定カラーを取得し、CSS変数 --scrollbar-track-bg を書き換える
    // when the scroll position moves forward past the "start"
    /*
    onEnter: () => { 
      updateProgress(index + 1);
      updateScrollbarColor( article );
    }, 
    // A callback for when the scroll position moves backward past the "end" (typically when the trigger is scrolled back into view)
    onEnterBack: () => { 
      updateProgress(index + 1); 
      updateScrollbarColor( article );
    }
    */

  });


  // ---------------------------------
  // 次のArticleが上に重なってくる際のエフェクト ブラー＆ズームアウト
  // ---------------------------------
  //if (nexrArticle && container) {
  if (nextArticle) {
    /*
    mainTL.to( container, {
      scale: 0.9,
      opacity: 0.3,
      filter: 'blur(12px)',
      ease: 'power2.inOut'
    }, '>-0.2');// メインアニメーションの終了間際に重ねるように発火させる

    if (bgImage) {
      mainTL.to( bgImage, {
        scale: 1.15,
        filter: 'brightness(0.4) blur(5px)',
        ease: 'power2.inOut'
      }, '<');// コンテナの縮小と同時に背景画像もアニメーションさせる
    }
    */

    const exitTl = gsap.timeline({
      scrollTrigger: {
        trigger: nextArticle,
        start: 'top bottom', // 次のコンテンツ nextArticle が画面下部に侵入のタイミングで
        end: 'top top', // 画面上部に完全に重なる
        scrub: true,
        invalidateOnRefresh: true
      }
    });
    // ScrollTriggerのタイムライン
    // フレームアウトする(現在表示の)コンテンツ
    exitTl.to( container, {
      scale: 0.9,
      opacity: 0.3,
      filter: 'blur(10px)',
      //y: '-10vh',
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
  // タイトル テキスト の出現演出
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
  }, '-=0.8');

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

// ---------------------------------
// ページ全体
// ---------------------------------
ScrollTrigger.create({
  trigger: '.psd-page',// <main class="psd-page">
  start: 'top top',
  end: 'bottom bottom',
  scrub: true,
  onUpdate: (self) => {
    // ページ全体の進行度 0%~100% = 0.0~1.0
    const progress = self.progress;

    // 進行度から現在のインデックスを算出する
    // 全体進捗から現在のインデックス（1 ～ 5）を算出
    // 0.99 以上の場合は確実に最終インデックスへ到達させる
    let currentIndex = Math.floor(progress * articles.length) + 1;
    if (progress >= 0.98 || currentIndex > articles.length) {
      currentIndex = articles.length;
    }

    // インジケーターとスクロールバー色の更新
    updateProgress(currentIndex, progress);
    
    const currentArticle = articles[currentIndex - 1];
    if (currentArticle) {
      updateScrollbarColor(currentArticle);
    }
  }
});


// ---------------------------------
// ページ最下部に到達した時の判定補足処理。スクロールの最後にプログレスインジケーターを更新する
// スクロール量の加減にかかわらず、最後のセクションで必ず 05 / 05（100%）が表示されるようにする
// ---------------------------------
/*
ScrollTrigger.create({
  start: 'max',
  end: 'max',
  onEnter: () => {
    const lastArticle = articles[articles.length -1];// 最下層の<article>を取得
    if ( lastArticle ) {
      updateProgress( articles.length );//最下層を指定
      updateScrollbarColor( lastArticle );
    }
  }
});
*/


}// initPageScrollDecoration()

