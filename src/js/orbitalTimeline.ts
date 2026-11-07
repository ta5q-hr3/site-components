// 楕円軌道の計算(3D調)
// ウィンドウフレームイン時のみ描画ループ実行

// 星ノード オブジェクト
interface Planet {
  name: string;
  angle: number;    // 公転角度
  distanceX: number; // 軌道の横幅(長い半径)
  distanceY: number; // 軌道の縦幅(短い半径)
  speed: number;    // 公転スピード
  radius: number;   // 星の描画サイズ
  color: string;    // 色設定
}


/**
 * Exported main method
 * @param stage 
 */
export function initOrbitalTimeline( stage:HTMLElement, uniqueId: string) {

console.log("INIT ORBITAL");

if (!uniqueId) return;

// 演出対象要素の取得
// <div class="container" id={`ot-container-${id}`}>
const container = document.getElementById(`ot-container-${uniqueId}`) as HTMLElement | null;
// <canvas class="canvas" id={`ot-canvas-${id}`}></canvas>
const canvas = document.getElementById(`ot-canvas-${uniqueId}`) as HTMLCanvasElement | null;
if (!container || !canvas) return;

const ctx = canvas.getContext('2d');
if (!ctx) return;

let animationId: number;
let isVisible = false;

// 周回する星ノードのオブジェクト データ定義
/* interface Planet {
  name: string;
  angle: number;    // 公転角度
  distanceX: number; // 軌道の横幅(長い半径)
  distanceY: number; // 軌道の縦幅(短い半径)
  speed: number;    // 公転スピード
  radius: number;   // 星の描画サイズ
  color: string;    // 色設定
} */
const planets: Planet[] =[
  { name: 'PHASE 01',
    angle: 0,
    distanceX: 180,
    distanceY: 70,
    speed: 0.008,
    radius: 6,
    color: '#4df3ff'
  },
  { name: 'PHASE 02',  angle: Math.PI * 0.5,  distanceX: 220,  distanceY: 85,  speed: 0.006,  radius: 8, color: '#ffffff' },
  { name: 'PHASE 03',  angle: Math.PI * 0.5,  distanceX: 270,  distanceY: 105,  speed: 0.005,  radius: 5, color: '#ffb86c' },
  { name: 'PHASE 04',  angle: Math.PI * 1.5,  distanceX: 320,  distanceY: 125,  speed: 0.004,  radius: 7, color: '#ff79c6' },
];


// 高解像度モニター対応 : 高解像度の場合にcanvasのサイズをピクセル比率に合わせて、containerのサイズまで広げる
const resizeCanvas = () => {
  const rect = container.getBoundingClientRect();
  const dpr = window.devicePixelRatio || 1;// 1かそれ以外か
  canvas.width = rect.width * dpr;
  canvas.height = rect.height * dpr;
  ctx.scale( dpr, dpr );
}


// 描画ループ
const render = () => {
  if (!isVisible) return;// 画面内にあるときのみ実行する
  // containerの座標
  const WT = container.clientWidth;
  const HT = container.clientHeight;
  const centerX = WT / 2;
  const centerY = HT / 2;
  // canvasのクリア
  ctx.clearRect( 0, 0, WT, HT );
  // 1. 星の軌道(楕円)を描画  planets:星ノード
  planets.forEach( planet => {
    ctx.beginPath;
    ctx.ellipse( centerX, centerY, planet.distanceX, planet.distanceY, 0, 0, Math.PI *2 );
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
    ctx.lineWidth = 1;
    ctx.stroke();
  });
  // 2. 星の公転   z軸(奥行き)の調整... 奥にある星を先に描画 → 手前にある星を後に描画 後の描画が手前になる
  planets.forEach( planet => {
    // 公転角度を　公転角度とスピードの和 に
    planet.angle += planet.speed;
  });
  //    軌道の縦幅(Y軸座標)でソートする
  const sortedPlanets = [...planets].sort( (a,b) =>{
    const yA = centerY + Math.sin(a.angle) * a.distanceY;// 軌道の縦幅順に並べる
    const yB = centerY + Math.sin(b.angle) * b.distanceY;
    return yA -yB;
  });
  // 3. 星の描画
  sortedPlanets.forEach( planet => {
    // △頂点の位置=描画座標 を計算
    const x = centerX + Math.cos(planet.angle) * planet.distanceX;// 中心位置から公転角度(スピード)毎の座標 x軸方向軌道半径
    const y = centerY + Math.sin(planet.angle) * planet.distanceY;
    // 手前( < y)にあるほど大きい。奥( > y)にあるほど小さい
    // -1 ~ 1 を 0.7 ~ 1.3 に変換
    const depthFactor = ( Math.sin(planet.angle) + 1.5 ) / 2;// 0.25 ~ 1.25
    const currentRadius = planet.radius * ( 0.6 + depthFactor * 0.8 );
    const alpha = 0.3 + depthFactor * 0.7;
    // 星のグロー処理(発光)
    ctx.shadowBlur = 12 * depthFactor;// 奥にあると暗い
    ctx.shadowColor = planet.color;
    // 星の描画
    ctx.beginPath();
    ctx.arc( x, y, currentRadius, 0, Math.PI * 2 );
    ctx.fillStyle = planet.color;
    ctx.globalAlpha = alpha;
    ctx.fill();
    ctx.shadowBlur = 0;// 描画の最後にシャドウをリセット ... 瞬き
    // ラベル
    ctx.font = '10px Inter, sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.globalAlpha = alpha * 0.7;
    ctx.fillText( planet.name, x + 12, y + 4 );
    ctx.globalAlpha = 1.0;
  });

  animationId = requestAnimationFrame(render);

}// const render()

// 画面内への侵入を監視
const observer = new IntersectionObserver( (entries) => {
  entries.forEach( entry => {
    // IN
    if (entry.isIntersecting) {
      isVisible = true;
      resizeCanvas();
      render();
    } else {
      isVisible = false;
      cancelAnimationFrame(animationId);
    }
  });

}, { threshold: 0.1 });

observer.observe( stage );// 監視対象 : stage <div class="orbitalStage" id={`ot-stage-${id}`}>"
window.addEventListener( 'resize', resizeCanvas );

return () => {
  observer.disconnect();
  window.removeEventListener( 'resize', resizeCanvas );
  cancelAnimationFrame( animationId );
}

}// initOrbitalTimeline()
