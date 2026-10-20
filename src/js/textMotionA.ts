// アニメーションライブラリの読み込み
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ScrambleTextPlugin } from 'gsap/ScrambleTextPlugin';

gsap.registerPlugin(ScrollTrigger, ScrambleTextPlugin);


/**
 * Exporting Main method
 */
export function initTextMotionA() {

// <artcile>の取得
const articles = document.querySelectorAll<HTMLElement>('.tma-article');
if (articles.length === 0) return; // 概要要素のない場合に処理停止

articles.forEach((article, index) => {
  // <article> <div wrapper> <section class="tma-section">
  const section = article.querySelectorAll<HTMLElement>('.tma-section');
  // scramble text title
  const title = article.querySelector('.tma-title') as HTMLElement | null;
  
  if (!section) return; // sectionなしの場合は除外

  // 1. セクションのスクロールイン演出 (画面上部から40%地点に達した時)
  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: article,
      start: 'top 20%', // 画面の下から80%位置（上から20%)の スクロールインした位置
      end: 'bottom top',
      markers: true,
      toggleActions: 'play none none reverse',
      onEnter: () => updateThemeAndProgress(article, index + 1, articles.length),
      onEnterBack: () => updateThemeAndProgress(article, index + 1, articles.length)
    }
  });

  // フェードイン ＆ スライドアップ
  tl.fromTo(section, 
    { alpha: 0, },// 透明
    {
      alpha: 1,// 不透明
      //opacity: 1,
      y: 0,
      duration: 3.0,
      ease: 'power3.out'
    });

  // 2. 標題（h1）のスクランブルテキスト演出
  if (title && title.dataset.scramble) {
    tl.to(title, {
      scrambleText: {
        text: title.dataset.scramble,
        //chars: '■',
        //chars: '▓▒░█<>/\\#@$%&§±~*01',
        chars: '■▓▒░█⚪︎●',
        revealDelay: 0,
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

    }, 0); // セクションの出現と同時にスタート
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
    const currentEl = document.getElementById('osa-current-index');
    const totalEl = document.getElementById('osa-total-index');
    const progressBar = document.getElementById('osa-progress-bar');

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

