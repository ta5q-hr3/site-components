/**
 * 
 * マウスカーソルの座標位置に応じて.ift-cardを3Dチルトさせる
 * 内部のSVGレイヤー = data-depth ごとに異なる移動量を与えて立体的な視差を演出します
 * gsapのScrollTriggerを使用して追従開始・終了を監視
 */
/*
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);
*/
import { gsap, ScrollTrigger } from './gsap-config';


/**
 * Exported main method
 * @param stage : HTMLElement ... <div class="trkStage" data-unique-id={id}>
 * //@param uniqueId : string ... div.trkStage.dataset = data-unique-id={id}
 */
export function initFaceTracker( stage: HTMLElement, uniqueId: string ) {

// DOM要素取得
// ユニークidの取得
//const uniqueId = stage.dataset.uniqueId;
//console.log(`Initializing FaceTracker for instance: [${uniqueId}]`);
// スコープを引数stage:HTMLElementに限定して要素を取得する ... コンポーネントの複数配置に対応
// <div class="container" id={`ift-container-${id}`}>
// ユニークIDを使用してようそを取得する
const container = document.getElementById(`ift-container-${uniqueId}`) as HTMLElement | null;
const card = document.getElementById(`ift-card-${uniqueId}`) as HTMLElement | null;
//const container = stage.querySelector('.container') as HTMLElement | null;
//const card = stage.querySelector('.ift-card') as HTMLElement | null;
if (!container || !card) return;

// SVG内の全レイヤー要素
const layers = card.querySelectorAll<SVGElement>('.ift-layer');

// マウスカーソル 状態管理オブジェクト
let mouse = { x: 0, y: 0, inside: false};
let isActive = false;// 追従状態の有効/無効

// ---- Utility Methods ----
// SVG用を変形させる
function updateMotion() {
  // card の3Dチルト回転角度   ~15度程度
  const rotateX = -mouse.y * 6;
  const rotateY = mouse.x * 6;

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
    const depth = parseFloat( layer.getAttribute('data-depth') || '10' );
    const moveX = mouse.x * depth;// レイヤーごとにdepth値で移動量を変える...手前ほど大きく動く
    const moveY = mouse.y * depth;

    gsap.to( layer, {
      x: moveX,
      y: moveY,
      duration:0.4,
      ease: 'power2.out',
      overwrite: 'auto'
    });
  });

}// updateMotion()

// -------------------------


// 画面内へのエントリー時の処理
ScrollTrigger.create({
  trigger: stage,
  start: 'top 75%',
  //markers: true,
  onEnter: () => { isActive = true; },//エントリー時に 追従状態 有効
  onEnterBack: () => { isActive = true },//スクロールバック 追従状態 有効
  onLeaveBack: () => { isActive = false}//ウィンドウを切り替え 追従状態 無効
});

// マウスイベント時の座標算出  ** カードの中心を(0.0)にする → (0.0) を中心にして移動させて立体に見せる **
const handleMouseMove = (e: MouseEvent) => {
  if (!isActive) return;
  const rect = container.getBoundingClientRect();
  const centerX = rect.width / 2;
  const centerY = rect.height / 2;
  // マウスカーソル現在地の　中心からの相対位置計算(-1 ~ 1)
  // カーソル絶対位置 - コンテナ要素座標 - 中心位置座標
  const x = ( e.clientX - rect.left - centerX ) / centerX;
  const y = ( e.clientY - rect.top - centerY ) / centerY;
  mouse.x = Math.max( -1, Math.min( 1, x ) );// -1 ~ 1の範囲に調整
  mouse.y = Math.max( -1, Math.min( 1, y ) );
  mouse.inside = true;

  updateMotion();
}

// マウスが判定エリア外に出たら 座標(0.0) へ
const handleMouseLeave = () => {
  mouse.x = 0;
  mouse.y = 0;
  mouse.inside = false;
  updateMotion(); // 通常位置へ更新
}


// EventListener 登録
container.addEventListener( 'mousemove', handleMouseMove);
container.addEventListener( 'mouseleave', handleMouseLeave);

// コンポーネント破棄時のクリーンアップ
return () => {
  container.removeEventListener( 'mousemove', handleMouseMove );
  container.removeEventListener( 'mouseleave', handleMouseLeave );
}

}// initFaceTracker()
