//
/**
 * @param stage : HTMLElement
 * 
 * マウスカーソルの座標位置に応じて.ift-cardを3Dチルトさせる
 * 内部のSVGレイヤー = data-depth ごとに異なる移動量を与えて立体的な視差を演出します
 * gsapのScrollTriggerを使用して追従開始・終了を監視

 */

import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

/**
 * Exported main method
 * @param stage : HTMLElement ... <div class="trkStage" data-unique-id={id}>
 */
export function initFaceTracker( stage: HTMLElement ) {

// DOM要素取得
// <div class="container" id={`ift-container-${id}`}>
const container = stage.querySelector('.container') as HTMLElement | null;
const card = stage.querySelector('.ift-card') as HTMLElement | null;
if (!container || !card) return;

// SVG内の全レイヤー要素
const layers = card.querySelectorAll<SVGElement>('.ift-layer');

// マウスカーソル 状態管理オブジェクト
let mouse = { x: 0, y: 0, inside: false};
let isActive = false;// 追従状態の有効/無効

// ---- Utility Methods ----
function updateMotion() {
  // card の3Dチルト回転角度 
  const rotateX = -mouse.y * 15;
  const rotateY = mouse.x * 15;

  // cardを傾ける  gsapでアニメーション補正
  gsap.to( card, {
    rotateX: rotateX,
    rotateY: rotateY,
    duration: 0.4,
    ease: 'power2.out',
    overwrite: 'auto'
  });

  layers.forEach( layer => {
    // レイヤーごとに data-depth に応じて移動量を調整する
  });


}// updateMotion()


// -------------------------


// 画面内へのエントリー時の処理
ScrollTrigger.create({

});

// マウスイベント時の座標算出  ** カードの中心を(0.0)にする → (0.0) を中心にして移動させて立体に見せる **
const handleMouseMove = (e: MouseEvent) => {

}
// マウスが判定エリア外に出たら 座標(0.0) へ
const handleMouseLeave = () => {

}


// EventListener 登録
container.addEventListener( 'mousemove', handleMouseMove);
container.addEventListener( 'mouseleave', handleMouseLeave);

// コンポーネント破棄時のクリーンアップ


}// initFaceTracker()