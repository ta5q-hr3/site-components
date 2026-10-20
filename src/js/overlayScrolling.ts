// Script for the Component : OverlayScrolling
// /page/overlayScrolling.astro
// /component/OverlayScrollingArticle.astro

//import { gsap } from "gsap/gsap-core";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin( ScrollTrigger );

// 表示中の画面の高さを取得
const windowHeight = window.innerHeight;


// ===================
// Utility Methods
// ===================

// ---- getScrollLength() ----
// @param container:HTMLElement ...  .osa-article__container
// コンテナ内のコンテンツの高さが 100vh を超えている分のスクロール長を算出する
const getScrollLength = ( container: HTMLElement) => {
  const windowHeight = window.innerHeight;
  const containerHeight = container.offsetHeight;// コンテナ要素の画面外長を含めた高さ
  // 画面外の高さがある場合は差分の長さを返します
  return containerHeight > windowHeight ? containerHeight - windowHeight + 100 : 0;// 調整 +100 
}

// ---- updateProgress ----
// @param currentIndex: number
// @param total: number
// プログレスインジケーター(articleの数と現在位置の表示)を更新する
function updateProgress( currentIndex: number, total: number ) {
  const currentEl = document.getElementById('psd-current-index');
  const totalEl = document.getElementById('psd-total-index');
  const progressBar = document.getElementById('psd-progress-bar');
  //console.log(progressAmount);
  //最下部に到達する前に最終インデックス番号に更新する
  const indexVal = (currentIndex / total) >= 0.96 || currentIndex > total ? total : currentIndex;
  if (currentEl) {
    //currentEl.textContent = String(currentIndex).padStart( 2, '0' );
    currentEl.textContent = String(indexVal).padStart( 2, '0' );
  }
  if (totalEl) {
    totalEl.textContent = String(total).padStart( 2, '0' );
  }
  if (progressBar) {
    // スクロール最下部にさしかかったら 100% スクロールと判断する
    //let percent = progressAmount * 100;
    //if ( progressAmount >= 0.96 ) { // 96%以上スクロールしたら...
    //  percent = 100;// 強制的にMAX 100% にします
    //}

    const percent = ( currentIndex / total ) * 100;
    // percentの値を 0 以上、 100 以下 に しています
    //const percent = Math.min( Math.max(calcPercent,0), 100 );
    gsap.to( progressBar, {
      height: `${percent}%`, // 進捗程度の反映
      duration: 0.3,
      ease: 'power2.out',
      overwrite: 'auto'
    });
  }
}

// ---- updateThemeColor ----
// @param currentArticle: HTMLElement ... .osa-article
// @param pageContainer: HTMLElement .. .osa-page
// スクロール時に<article>にしていされたテーマカラー light | dark に応じて色設定を変更する
function updateThemeColor( currentArticle: HTMLElement, pageContainer: HTMLElement | null ) {
  if (!pageContainer) return;
  const bgType = currentArticle.getAttribute('data-bg');// 背景設定の取得

  // スクロールバーの track, thumb の色を変更する
  if (bgType === 'dark') {
    pageContainer.setAttribute('data-current-theme', 'dark');
    //pageContainer.style.backgroundColor = '#040619';
    //pageContainer.style.color = '#f9edd9';
    //pageContainer.style.setProperty( '--scrollbar-track-bg', '#040619' );
    //pageContainer.style.setProperty( '--scrollbar-thumb-bg', 'rgba(255, 255, 255, 0.35)' );
  } else { // bgType === 'light'
    pageContainer.setAttribute('data-current-theme', 'cream');
    //pageContainer.style.backgroundColor = '#f9edd9';
    //pageContainer.style.color = '#040619';
    //pageContainer.style.setProperty('--scrollbar-track-bg', '#f9edd9');
    //pageContainer.style.setProperty('--scrollbar-thumb-bg', 'rgba(0, 0, 0, 0.25)');
  }
}

// ===================



/**
 * Export function // main method
 */
export function initOverlayScrolling() {
  

// 要素取得
const articles = gsap.utils.toArray<HTMLElement>('.osa-article');
const pageContainer = document.querySelector('.osa-page') as HTMLElement | null;

if ( articles.length === 0 ) return; // 該当コンテンツエリアがない場合には処理停止

// 初期描画の完了 & レイアウトの完了を待機させる
//ScrollTrigger.refresh();

// 取得した要素群に演出付与
articles.forEach( ( article, index ) => {

  // 各<article>が画面中央に達したタイミングで ページプログレス と カラー変化 を実施
  /*ScrollTrigger.create({
    trigger: article,
    start: 'top top',
    end: 'bottom top',
    markers: true,
    //scrub: 1.2,
    onToggle: (self) => {
      if ( self.isActive ) {
        updateProgress( index + 1, articles.length );
        updateThemeColor( article, pageContainer );
      }
    }
  });*/

  
  const nextArticle = articles[index + 1]; // 対象 <article>の次の<article>
  const container = article.querySelector('.osa-article__container') as HTMLElement | null;// article内の内容

  if (!container) return; // コンテナエリアを有しない場合には処理対象 除外

  //const scrollLength = getScrollLength( container );// articleの内容が画面の高さを超える場合の差分長
  const scrollLength = getScrollLength( article );// articleの内容が画面の高さを超える場合の差分長
  if ( index !== articles.length ) article.style.paddingBottom = scrollLength + 'px';// 次のarticleが被るまでのスクロール量の確保

  // gsap ピン留め演出の付与
  
  const mainTL = gsap.timeline({
    scrollTrigger: {
      trigger: article,
      start: 'top top',// スタート位置： 対象要素の top が top に達したとき
      //end: () => `+=${windowHeight + scrollLength}`,// 画面の高さと差分の高さの heightに達したときに終了する
      //end: 'bottom bottom',
      end: 'bottom top',
      //markers: true, // 開発用マーカー表記
      pin: article,
      //pin: true,
      pinSpacing: false,
      //start: 'top center',
      //end: 'bottom center',
      scrub: 1.2,
      invalidateOnRefresh: true,// 画面リサイズ時の再描画機能
      // セクションがアクティブになった時にプログレス更新やカラー変化を実行する
      onToggle: (self) => {
        if (self.isActive) {
          updateProgress( index +1, articles.length );// プログレスバーの更新  self.progress:ページ全体の進行度 0%~100% = 0.0~1.0
          updateThemeColor( article, pageContainer );// 設定色への変更演出
        }
      }
    }
  });// mainTL:gsap.timline 
  

  // コンテンツが画面の高さから溢れる場合 コンテンツ コンテナ を上昇させる
  /*
  mainTL.to( container, {
    y: () => -scrollLength,
    ease: 'none',
    duration: 1
  }, 0);
  */
  /*
  if ( scrollLength > 0 ) {
    mainTL.to( article, {
      y: () => -(scrollLength +250),
      ease: 'none'
    }, 0);
  }
  */
  mainTL.to( article, {
    y: () => -(article.offsetHeight /2),
    ease: 'none'
  }, 0);
  
  
  // 次のarticleがある場合の退避演出  縮小とブラー
  
  if ( nextArticle ) {
    mainTL.to( container, {
      scale: 0.94,
      opacity: 0.1,
      filter: 'blur(10px)',
      ease: 'power2.inOut'
    }, '>-0.20');// pin の終了間際に発火するように調整する
  }
    
  

}); // articles.forEach()


}// initOverlayScrolling

