// For /components/ConstellationDots.astro
/*
DOM Structure ...

<div 
  class="constellation-stage" 
  style={`--dot-color: ${dotColor}; --stage-bg: ${stageBg};`}
>
  <div class="constellation-header">
    <h3 class="constellation-title">{title}</h3>
  </div>
  <div class="constellation-canvas-wrapper">
    <canvas class="constellation-canvas"></canvas>
    <div class="constellation-hint">Hover to Push Particles</div>
  </div>
</div>
*/

/**
 * 定数 定義
 */
// マウス(カーソル)の影響範囲定義
const mouse = {
  x: -1000,
  y: -1000,
  radius: 90
}

/**
 * Class Particle  Design
 */
class Particle {
  x: number;// x, y アニメーション中の現在位置
  y: number;
  baseX: number;// baseX, baseY 元あった位置
  baseY: number;
  size: number;
  density: number;// 粒子の「重さ」

  // Constructor  点要素に座標データ・パラメータを定義
  constructor( x:number, y:number ) {
    this.x = x;
    this.y = y;
    this.baseX = x;
    this.baseY = y;
    this.size = 1.5;
    //this.density = Math.random() * 30 + 1;// 30をランダムに減少させて +1
    this.density = Math.random() * 25 + 1;// 25をランダムに減少させて +1
  }

  // canvas への描画処理
  // @param ctx : HTMLCanvasElement.CanvasRenderingContext2D 描画
  // @param dotColor : 16進数色指定 "#f9edd9"
  draw( ctx: CanvasRenderingContext2D, dotColor: string ) {
    if (!ctx) return;
    ctx.fillStyle = dotColor;// 図形の内側
    ctx.globalAlpha = 0.85;// 合成される前に適用されるキャンバス内の図形やイメージの透明度 (デフォルト 1.0)
    ctx.beginPath();// すでにあるサブパスのリストを消去して新しいパスの起点を作成
    ctx.arc( this.x, this.y, this.size, 0, Math.PI * 2 );// 現在のパスに円弧を追加
    // arc( x, y, radius, startAngle, endAngle )
    //  (x, y) の中心座標、 radius を半径とした円弧を作成する。 時計回りに startAnglekからストロークしてendAngleまで
    ctx.closePath();// 現在の位置から最初の位置まで直線を引く
    ctx.fill();// サブパス内を塗りつぶし
  }

  // 毎フレームのアニメーション演算、dotの位置更新処理
  update() {
    let dx = mouse.x - this.x;// マウス(カーソル)の影響範囲
    let dy = mouse.y - this.y;//
    let distance = Math.sqrt( dx * dx + dy * dy );// √(x^2 + y^2)
    
    // 点とマウス(カーソル)との距離が 影響範囲 radius に入ったとき
    if ( distance < mouse.radius ) {
      let forceDirectionX = dx / distance;
      let forceDirectionY = dy / distance;
      let force = (mouse.radius - distance) / mouse.radius;
      let directionX = forceDirectionX * force * this.density;
      let directionY = forceDirectionY * force * this.density;
      // マウス(カーソル)と逆方向に向ける
      this.x -= directionX;
      this.y -= directionY;
    } else {
      // マウス(カーソル)との距離に応じて 加わる力の大小があるかのように 元の座標に戻す
      if ( this.x !== this.baseX ) {
        let dx = this.x - this.baseX;
        this.x -= dx / 10;// 10 ... 減衰の調整(値が大きいほどゆっくり動く(元の場所に戻る))
      }
      if ( this.y !== this.baseY ) {
        let dy = this.y - this.baseY;
        this.y -= dy / 10;
      }
    }
  }// update()

} // Class Particle


/**
 * Exporting Main Method
 *
 * @param stageEl : HTMLElement ... div.constellation-stage → コンポーネントのラッパー 要素
 */
export function initConstellation(stageEl: HTMLElement) {


// <canvas>
const canvas = stageEl.querySelector<HTMLCanvasElement>('.constellation-canvas');
if (!canvas) return;// 要素がない時に停止  HTMLCanvasElement | null
const ctx = canvas.getContext('2d');// HTMLCanvasElement.CanvasRenderingContext2D
if (!ctx) return;

let particles: Particle[] = [];

// ドットのCSS変数定義を取得する
/* <div
    class="constellation-stage"
    style={`--dot-color: ${dotColor}; --stage-bg: ${stageBg};`}
  > */
const computedStyle = getComputedStyle( stageEl );
const dotColor = computedStyle.getPropertyValue('--dot-color').trim() || '#ffffff';// *設定時のスペースや改行を取り除きます trim* 未指定,取得失敗時は白になります


// ==== 演出実行用の関数を設置 ====
// canvasのサイズ設定 dotの設置 
function setup() {
  if (!canvas) return;
  // <canvas>の大きさをラッパー要素大に拡大する
  const displayWidth = stageEl.clientWidth;
  const displayHeight = stageEl.clientHeight;
  canvas.width = stageEl.clientWidth;
  canvas.height = stageEl.clientHeight;
  // 高解像度ディスプレイ対策 解像度を倍にする
  const dpr = window.devicePixelRatio || 1;
  canvas.width = displayWidth * dpr;
  canvas.height = displayHeight * dpr;
  ctx?.scale( dpr, dpr );// 描画コンテキストのスケーリング

  // 点群  いったん空に
  particles = [];
  const gap = 24;
  // dot設置の繰り返し x軸方向にgap間隔で幅長が埋まるまで。 → y軸方向にgap間隔で高さが埋まるまで。 
  //for ( let y = 0; y < canvas.height; y += gap ) {
  for ( let y = 0; y < displayHeight; y += gap ) {
    //for ( let x = 0; x < canvas.width; x += gap ) {
    for ( let x = 0; x < displayWidth; x += gap ) {
      particles.push( new Particle(x,y) );
    }
  }
}

// dotを動かす アニメーションループ
function animate() {
  if (!ctx || !canvas) return;
  //ctx.clearRect( 0, 0, canvas.width, canvas.height );
  ctx.clearRect( 0, 0, canvas.clientWidth, canvas.clientHeight );
  particles.forEach( p => {
    p.update();
    p.draw( ctx, dotColor );
  });
  requestAnimationFrame(animate);
}

// ============================


// ラッパー要素上でのマウス(カーソル)の動きにイベント設置
stageEl.addEventListener( 'mousemove', (e) => {
  const rect = canvas.getBoundingClientRect();

  // canvasの「表示サイズ」に対する「クライアント上での実座標」の補正
  //  scaleX,scaleY canvasに対して実際に表示されている大きさがどのくらいの比率なのか
  const scaleX = canvas.width / ( rect.width * ( window.devicePixelRatio || 1 ) );
  const scaleY = canvas.height / ( rect.height * ( window.devicePixelRatio || 1 ) );

  mouse.x = ( e.clientX - rect.left ) * ( canvas.clientWidth / rect.width );
  mouse.y = ( e.clientY - rect.top ) * ( canvas.clientHeight / rect.height );
  //mouse.x = e.clientX - rect.left;
  //mouse.y = e.clientY - rect.top;
});
stageEl.addEventListener( 'mouseleave', () => {
  // マウス(カーソル)が離れると元に戻す
  mouse.x = -1000;
  mouse.y = -1000;
})

// リサイズ時の処理
window.addEventListener( 'resize', () => {
  setup();
});


// ---- 初期化 ----
setup();
animate();
// ---------------



}// initConstellation()
