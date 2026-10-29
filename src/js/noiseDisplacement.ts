
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin( ScrollTrigger );


/**
 * Exported main method
 */
export function initNoiseDisplacement( stage: HTMLElement ) {
  
// 対象要素を取得する
const container = stage.querySelector('.container') as HTMLElement | null;
if (!container) return;

// SVGフィルター要素の取得
const turb = container.querySelector('feTurbulence');
const disp = container.querySelector('feDisplacementMap');
if (!turb || !disp) return;

// アニメーションパラメーター
const animState = {
  scale: 120, // 歪みの強さ 初期値
  freqX: 0.08 // ノイズの細かさ 初期値
}

// GSAP ScrollTrigger
const tween = gsap.to( animState, {
  //画面内にstageが侵入したタイミング...top75% でアニメーション発火
  scale: 0,       // to ノイズ0
  freqX: 0.0001,  // to 細かさほぼなし
  duration: 1.5,
  ease: 'power3.out', // 減速しながら停止
  scrollTrigger: {
    trigger: stage,
    markers: true,
    start: 'top 50%',// 画面上端から75%の位置に stage が来たら開始
    toggleActions: 'play none none reverse', // スクロールバックでも実行
  },
  onUpdate: () => {
    // animState の数値変化に合わせてSVGフィルターの属性値を毎フレーム更新する
    disp.setAttribute( 'scale', String( animState.scale ) );
    turb.setAttribute( 'baseFreauency', `${animState.freqX} 0.0001` );
  }
});

// ノイズ状態でのざらざら背景
let frameId: number;
function animateNosiseSeed() {
  // ノイズ演出中 or 通常時には少しのざらざら背景を適用
  if ( animState.scale > 0.1 ) {
    const currentSeed = parseFloat( turb!.getAttribute('seed') || '0' );
    turb!.setAttribute( 'seed', String(currentSeed + 1));
  }
  frameId = requestAnimationFrame(animateNosiseSeed);
}
animateNosiseSeed();

// コンポーネント破棄時にアニメーション・ループを停止
return () => {
  tween.kill();
  cancelAnimationFrame(frameId);
};


} // initNoiseDisplacement()