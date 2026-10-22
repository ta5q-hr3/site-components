// アニメーションライブラリの読み込み
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ScrambleTextPlugin } from 'gsap/ScrambleTextPlugin';

gsap.registerPlugin(ScrollTrigger, ScrambleTextPlugin);


// ===================
// Utility Methods
// ===================

/**
 * ---- 背景色の変更メソッド ----
 * @param currentArticle: HTMLElement ... .tma-article <article>
 * @param pageContainer: HTMLElement ... .tma-main <main>
 * <article>に指定されたテーマカラー light | dark に入れ替える
 * CSSに .tma-article[data-bg="light"] | [data-bg="dark"] のセレクタを設定しており、
 * transition で背景色を設定しているため、 data-bg プロパティが変更されるとアニメーション付きで色設定が変わります
 */
function updateThemeColor( currentArticle: HTMLElement, pageContainer: HTMLElement ) {
  if (!currentArticle) return;
  if (!pageContainer) return;
  const bgType = currentArticle.getAttribute('data-bg');

  if (bgType === 'dark') {
    // <main>のスクロールバーを変色させる
    pageContainer.setAttribute( 'data-current-theme', 'dark' );
  } else { // bgType === 'light'
    pageContainer.setAttribute( 'data-current-theme', 'light' );
  }

}

/**
 * ---- プログレスバーの更新 ---
 * @param currentIndex : number これから表示するarticleのindex
 * @param total : number articleの数
 */
function updateProgress( currentIndex: number, total: number ) {
  // 関係要素の取得
  const currentEl = document.getElementById('progress-bar-current-index');// インデックスの現在表記Element (0始まりの2桁表記)
  const totalEl = document.getElementById('progress-bar-total-index');// articleのトータル数Element
  const progressBar = document.getElementById('progress-bar');// プログレスバーElement
  // 最下部に到達する前に最終インデックス番号に更新する
  const currentVal = currentIndex / total;
  const indexVal = currentVal >= 0.96 || currentIndex > total ? total : currentIndex;
  if (currentEl) currentEl.textContent = String(indexVal).padStart( 2, '0' );
  //if (totalEl) totalEl.textContent = String(total).padStart( 2, '0' );
  // プログレスバーを伸び縮み
  if (progressBar) {
    const percent = currentVal * 100;//伸縮サイズの算出
    gsap.to( progressBar, {
      height: `${percent}%`,
      duration: 0.3,
      ease: 'power2.out',
      overwrite: 'auto'
    });
  }
}

// ===================


/**
 * Exporting Main method
 */
export function initTextMotionA() {

// <main>を取得
const pageContainer = document.querySelector('.tma-main') as HTMLElement | null;
// <artcile>[]の取得
const articles = document.querySelectorAll<HTMLElement>('.tma-article');
if (articles.length === 0) return; // 概要要素のない場合に処理停止

articles.forEach((article, index) => {
  // <article> <div wrapper> <section class="tma-section">
  const section = article.querySelectorAll<HTMLElement>('.tma-section');
  // scramble text title
  const title = article.querySelector('h1.tma-title') as HTMLElement | null;
  
  //if (!section) return; // sectionなしの場合は除外?

  // articleごとの背景色変化アニメーション
  if (index > 0) {
    // 2段目以降は初期値 30%
    // css変数  --grad-percent
    gsap.set( article, { '--grad-p': 20 });
    article.classList.remove('is-solid-bg');// 2段目以降のアニメーション適用
  } else {
    // 1段目は最初から 100% = 透明度なし
    gsap.set( article, { '--grad-p': 100});
    article.classList.add('is-solid-bg');
  }

  // 1. セクションのスクロールイン演出 (画面上部から40%地点に達した時)
  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: article,
      start: 'top 20%', // 画面の下から80%位置（上から20%)の スクロールインした位置
      end: 'bottom top',
      //markers: true,
      toggleActions: 'play none none reverse',
      //onEnter: () => updateThemeAndProgress(article, index + 1, articles.length),
      //onEnterBack: () => updateThemeAndProgress(article, index + 1, articles.length)
      onEnter: () => {
        updateProgress( index + 1, articles.length );
        updateThemeColor( article, pageContainer );
      },
      onEnterBack: () => {
        updateProgress( index + 1, articles.length );
        updateThemeColor( article, pageContainer );
        if ( index > 0 ) {
          //gsap.to( article, { '--grad-p': 20 } );
          article.classList.remove('is-solid-bg');
        }
      },
      // スクロールバック時にはベタ塗り解除
      /*
      onReverseComplete: () => {
        if ( index > 0 ) {
          console.log("onReverseComp");
          article.classList.remove('is-solid-bg');
        }
      }
      */
    }
  });
  // articleの背景色透明度を変更する
  if ( index > 0 ) { // article 2段目以降
    tl.to( article, {
      '--grad-p': 100,
      duration: 0.65,
      ease: 'power2.out'
    }, 0);
  }

  // フェードイン ＆ スライドアップ
  tl.fromTo(section, 
    { alpha: 0, },// 透明
    {
      alpha: 1,// 不透明
      //opacity: 1,
      y: 0,
      duration: 1.5,
      ease: 'power3.out',
      /*
      onComplete: () => {
        // 演出完了後に背景グラデーションの撤去
        if (index > 0) {
          article.classList.add('is-solid-bg');
        }
      }
      */
  });

  // 2. 標題（h1）のスクランブルテキスト演出
  if (title && title.dataset.scramble) {
    tl.to(title, {
      scrambleText: {
        text: title.dataset.scramble,
        //chars: '■',
        //chars: '▓▒░█<>/\\#@$%&§±~*01',
        //chars: '■▓▒░█⚪︎●',
        chars: '■▓░⚪︎●',
        //revealDelay: 0,
        speed: 0.8,
        delimiter: ''
      },
      duration: 0.95,
      ease: 'none',
      onStart: () => {
        title.classList.add('is-glitching');// title要素にグリッチアニメーション用のクラスを付与
      },
      onComplete: () => {
        title.classList.remove('is-glitching');// 撤去
      }
    }, '+=0.05'); // セクションの出現とほぼ同時にスタート
  }
});// articles.forEach()



  // テーマカラー（スクロールバー）＆ プログレスの更新
  function updateThemeAndProgress(currentArticle: HTMLElement, currentIndex: number, total: number) {
    const bgType = currentArticle.getAttribute('data-bg');
    const mainEl = document.querySelector('.tma-main') as HTMLElement | null;

    if (mainEl) {
      if (bgType === 'dark') {
        mainEl.style.setProperty('--scrollbar-track-bg', '#040619');
        mainEl.style.setProperty('--scrollbar-thumb-bg', 'rgba(255, 255, 255, 0.35)');
      } else {
        mainEl.style.setProperty('--scrollbar-track-bg', '#f9edd9');
        mainEl.style.setProperty('--scrollbar-thumb-bg', 'rgba(0, 0, 0, 0.25)');
      }
    }

    // プログレスインジケーターの更新
    const currentEl = document.getElementById('progress-bar-current-index');
    const totalEl = document.getElementById('progress-bar-total-index');
    const progressBar = document.getElementById('progress-bar');

    if (currentEl) currentEl.textContent = String(currentIndex).padStart(2, '0');
    if (totalEl) totalEl.textContent = String(total).padStart(2, '0');
    if (progressBar) {
      const percent = (currentIndex / total) * 100;
      gsap.to(progressBar, {
        height: `${percent}%`,
        duration: 0.3,
        ease: 'power2.out',
        overwrite: 'auto'
      });
    }
  }

}// initTextMotionA()

