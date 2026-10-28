/**
  /components/MagneticFlud
  - マウス(カーソル)の動きに合わせて球体を移動させます
  - Class Ballを定義し、それぞれランダムな数・ランダムな座標に向けて移動させます
  - 球体(Ball)がcanvas要素の端に到達すると座標値を反転させてバウンドさせます
  - 球体同士が接近したときにsvg filterで流体のように合体するように見える ハズ
 */

// マウス(カーソル)の標準座標とアクティブ/非アクティブ ... 画面外に設定しておき、canvas上での動作を検知して動きを与える
let mouse = { x: -1000, y: -1000, active: false };// マウス(カーソル)の基準座標値

// ===== Class Ball =====
class Ball {
  x: number;
  y: number;
  radius: number;//半径
  baseRadius: number;//初期半径
  isMouse: boolean;// マウスと接合しているか(カーソルと連動するか否か)
  vx: number;// 移動(軸)方向とスピード (速度ベクトル値)
  vy: number;

  constructor( x:number, y:number, radius:number, isMouse = false) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.baseRadius = radius;
    this.isMouse = isMouse;
    this.vx = (Math.random() - 0.5) * 2;// -1.0 ~ 1.0 の間に収まるランダム値となるように調整
    this.vy = (Math.random() - 0.5) * 2;
  }
  // ---- 球体の移動  フレーム毎の位置更新処理 ----
  update(rect: DOMRect) {
    if (this.isMouse) {
      // マウス(カーソル)と重なっている...追従するBall
      //  現在地からマウス(カーソル)へ向かって座標を15%ずつ移動...追従する動き
      //  フレーム毎の距離感で移動速度を変化させる (イージングの効果
      this.x += (mouse.x - this.x) * 0.15;
      this.y += (mouse.y - this.y) * 0.15;
    } else {
      // 漂っている球体
      //  動き回って<stage>の端で跳ね返る
      this.x += this.vx;// コンストラクターで指定した一定の速度
      this.y += this.vy;
      if ( this.x < 0 || this.x > rect.width ) this.vx *= -1;// 端まで行ったら値の正負を反転 → 反対方向
      if ( this.y < 0 || this.y > rect.height ) this.vy *= -1;

      // マウス カーソル = 大きな球体 に近づいた場合に引き寄せられる
      const dx = mouse.x - this.x;// マウス(カーソル)までの座標差
      const dy = mouse.y - this.y;
      const dist = Math.sqrt( dx * dx + dy * dy );// x:1 : y:2 : カーソルまでの距離(dist):√2 
      if (dist < 150) { // 距離が150px未満
        this.x += dx * 0.02;// 球体の座標をカーソルに向かって縮める
        this.y += dy * 0.02;
      }
    }// if (this.isMouse)
  }// update()
  // ---- 球体の描画 ----
  // ctx: canvasのコンテキスト
  // orbColor: コンポーネントに指定された球体の色設定値
  draw( ctx: CanvasRenderingContext2D, orbColor: string ) {
    if (!ctx) return;// canvasが取れない限りクラスが宣言されることはないような...
    ctx.fillStyle = orbColor;
    ctx.beginPath();
    // 円の描画 : arc( x座標, y座標, 半径, 開始角度, 終了角度 )
    ctx.arc( this.x, this.y, this.radius, 0, Math.PI * 2 );
    ctx.fill();
  }


}// class Ball
// ======================

/* ***********
 * Exported main method
 + @param stage : HTMLElement ... component wrapper <div class="magnetic-stage">
 * *********** */
export function initMagneticFlud( stage: HTMLElement ) {

//演出関連要素の取得
const container = stage.querySelector<HTMLElement>('.container');
const canvas = stage.querySelector<HTMLCanvasElement>('.canvas');
if (!container || !canvas) return; // どちらもちゃんと取得できていること

const ctx = canvas.getContext('2d');//HTMLCanvasElement.CanvasRenderingContext2D
if (!ctx) return;

// 色設定を取得する
const computedStyle = getComputedStyle(stage);
const orbColor = computedStyle.getPropertyValue('--orb-color').trim() || '#ffffff';

let frameId: number;// 描画フレームID
let particles: Ball[] = [];// class Ball

// 初期化
const setup = () => {
  // canvasの描画解像度をコンテナサイズに適合
  const rect = container.getBoundingClientRect();
  canvas.width = rect.width;
  canvas.height = rect.height;
  particles = [];

  // マウス (カーソル)を追従する大きな球体
  // Ball constructor( x:number, y:number, radius:number, isMouse = false)
  particles.push( new Ball( rect.width / 2, rect.height / 2, 60, true) );

  // 周囲の球体  12個
  for ( let i=0; i < 12; i++ ) {
    particles.push( new Ball(
      // 位置・サイズをランダムに生成
      Math.random() * rect.width,
      Math.random() * rect.height,
      Math.random() * 20 + 15 //半径  15~35pxの間に調整
    ) );
  }// for()

}// setup

// マウス(カーソル)操作
const handleMouseMove = ( e: MouseEvent ) => {
  const rect = container.getBoundingClientRect();
  // マウスの画面上の位置からコンテナ内の座標へ変換  mouse オブジェクトを更新する
  mouse.x = e.clientX - rect.left;
  mouse.y = e.clientY - rect.top;
  mouse.active = true;
}
// マウス(カーソル)が描画エリアから離れたら  初期値に戻す
const handleMouseLeave = () => {
  mouse.x = -1000;
  mouse.y = -1000;
  mouse.active = false;
}

function animate() {
  const rect = container!.getBoundingClientRect();
  // 前のフレームの描画を消去する
  ctx!.clearRect( 0, 0, rect.width, rect.height );
  // 球体の位置を update → draw 再描画
  particles.forEach( p => {
    p.update( rect );// rect:DOMRect
    p.draw( ctx, orbColor );// ctx: CanvasRenderingContext2D
  });
  // animateの再帰呼び出しで繰り返す
  frameId = requestAnimationFrame(animate);

}

// イベントリスナーの登録
const handleResize = () => setup();
window.addEventListener( 'resize', handleResize );// リサイズ時に初期化を実行
container.addEventListener( 'mousemove', handleMouseMove );
container.addEventListener( 'mouseleave', handleMouseLeave );

// 初期化
setup();
animate();

}// initMagneticFlud()