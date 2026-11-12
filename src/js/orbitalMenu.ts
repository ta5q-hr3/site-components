// 周回星ノード Menu項目要素
interface PlanetNode {
  id: string;         // '01','02'...
  name: string;       // メニュー項目の題目
  description: string;// メニューパネルの説明文
  angle: number;      // 公転角度(current
  baseAngle: number;  // 初期の角度 (デフォルト = 復元位置)
  distanceX: number;  // 軌道の横幅(長い半径)
  distanceY: number;  // 軌道の縦幅(短い半径)
  radius: number;     // 星の描画サイズ(半径値
  color: string;      // 色設定 HEX
  x: number;          // 毎フレーム計算される画面上の座標（初期値は0）
  y: number;          // 
  scale: number;      // 拡大・縮小倍率
}
// --------------------
// メニュー項目の星
// --------------------
const nodes: PlanetNode[] = [
  // MENU 01
  { id:'01',
    name:'CORE ARCHITECTURE',
    description:'Foundational framework and modular system design for high-performance web applications.',
    angle:0,
    baseAngle:0,
    distanceX:280,
    distanceY:110,
    radius:10,
    color:'#4df3ff',
    x:0,
    y:0,
    scale:1
  },
  // MENU 02
  // Math.PI : 3.14159...
  { id:'02',  name:'INTERACTIVE MOTION',  
    description:'Fluid physics, GSAP timelines, and spatial UI/UX dynamics crafted for Awwwards standards.',
    angle: Math.PI * 0.5,
    baseAngle: Math.PI * 0.5,
    distanceX:340,  distanceY:135,  radius:8,
    color:'#ffffff', x:0, y:0, scale:1
  },
  // MENU 03
  { id: '03', name:'KNOWLEDGE RAG',
    description:'Advanced vector embeddings, YAML metadata schemas, and structured synthesis workflows.',
    angle:Math.PI,
    baseAngle: Math.PI,
    distanceX:400,  distanceY:160,  radius:9, 
    color: '#ffb86c', x:0,  y:0,  scale:1
  },
  // MENU 04
  { id:'04', name:'AUTOMATION PIPELINE',
    description:'Google Apps Script integrations, python text utilities, and seamless CI/CD test automation.',
    angle: Math.PI * 1.5, baseAngle: Math.PI * 1.5, 
    distanceX:460,  distanceY:185,  radius:11,  
    color:'#ff79c6',  x:0,  y:0,  scale:1
  },
];// const nodes: PlaneNode[]


/**
 * Exported main method
 * @param stage : HTMLElement ... <div class="om-fullscreen-stage" id="omStage">
 */
export function initOrbitalMenu( stage: HTMLElement ) {

const canvas = stage.querySelector(`#omCanvas`) as HTMLCanvasElement | null;
if (!canvas) return;
const ctx = canvas.getContext(`2d`);//HTMLCanvasElement.CanvasRenderingContext2D ... 2Dで描画するペンのようなもの
if (!ctx) return;
// メニューパネル <div id="omActivePanel" の中身
const title = stage.querySelector('#omPanelTitle') as HTMLElement | null;
const desc = stage.querySelector('#omPanelDesc') as HTMLElement | null;
// リンクをつける場合 const actionBtn = stage.querySelector('#omActionBtn') as HTMLElement | null;

let animationId: number;  // アニメーションフレームID
let globalRotation = 0;   // 全体の回転状態(角度)  回転に伴って値を蓄積させる(自動で回転させるための値)
let targetRotation = 0;   // 特定エレメントの軌道(選択項目)の回転状態(角度)  値の回転状態まで進めるための値
let activeNodeId = nodes[0].id;// 選択中星ノードのid 初期は先頭のid01


// --------------------
// Utility Methods
// --------------------
// method: 画面リサイズへの追従  canvasサイズを画面解像度に合わせて調整する --------------------
const resize = () => {
  const dpr = window.devicePixelRatio || 1;//高解像度 or 1(そのまま)
  canvas.width = window.innerWidth * dpr;
  canvas.height = window.innerHeight * dpr;
  ctx.scale( dpr, dpr );
};
// method: スクロールで軌道を回転させる  マウスホイールイベントでtargetRotationを増やす --------------------
const handleWheel = (e: WheelEvent) => {
  targetRotation += e.deltaY * 0.002;
};
// method: タッチ操作対応  マウスホイールと同様に動作させる --------------------
let touchStartY = 0;// タッチを始めたポイントのY座標
const handleTouchStart = (e: TouchEvent) => {
  // タッチ操作のスタートを最初の接触位置(0)から取得する。 Y座標
  touchStartY = e.touches[0].clientY;
};
// 画面に触れたままの操作に対する処理 ... タッチポイントが動く毎に座標を更新する
const handleTouchMove = (e: TouchEvent) => {
  // 現在のタッチポイントY座標e.touches[0].clientY と 直前のタッチポイントY座標 の差分(deltaY) = 移動距離 を算出
  const deltaY = e.touches[0].clientY - touchStartY;
  // targetRotation から　移動距離 * 調整値(0.005)を減算して軌道を回転させる
  targetRotation -= deltaY * 0.005;
  // 続けて移動距離を計算するためにタッチポイントの基準Y座標を更新(上書き)する
  touchStartY = e.touches[0].clientY;
};
// method: 選択中の星ノードの内容へパネルの内容を書き換える --------------------
const updateActivePanel = ( node: PlanetNode ) => {
  if (title) title.textContent = `${node.id} // ${node.name}`;
  if (desc) desc.textContent = node.description;
};
// ノードクリック判定  カーソル座標と各ノードの位置からクリック対象かどうかを判定する --------------------
const handleClick = (e: MouseEvent) => {
  const rect = canvas.getBoundingClientRect();
  const mouseX = e.clientX - rect.left;//マウスポインターのイベント位置からcanvas上の座標を算出
  const mouseY = e.clientY - rect.top;

  nodes.forEach( node => {
    // マウス座標(mouseX,Y) と各星ノード(の中心座標)との距離を算出
    const dx = mouseX - node.x;
    const dy = mouseY - node.y;
    const dist = Math.sqrt( dx * dx + dy * dy );// △ 三平方の定理でx横軸,y立軸を結ぶ辺の長さをdist=距離とする

    // 当たり判定  算出距離が nodeの半径x2 = 直径以内に届く場合はヒット判定
    if ( dist < node.radius * node.scale * 2) {
      activeNodeId = node.id;
      updateActivePanel( node ); // パネル表示を該当星ノードの内容に更新する
    }
  });
};

// --------------------


// ----------------------------------------
// 描画  アニメーションループ
// ----------------------------------------
const render = () => {

// 座標の取得
const width = window.innerWidth;
const height = window.innerHeight;
const centerX = width / 2;
const centerY = height / 2;
// 慣性(Lerp)の表現  targetRotationまでの差分を10%(0.1)ずつ近づける...減速しながら止まる
globalRotation += (targetRotation - globalRotation) * 0.1;

ctx.clearRect( 0, 0, width, height );// 前フレームの描画を初期化

// 1. node:PlanetNode ごとの軌道(楕円)の描画 ======
nodes.forEach( node => {
  ctx.beginPath();
  ctx.ellipse( centerX, centerY, node.distanceX, node.distanceY, 0, 0, Math.PI *2 );
  ctx.strokeStyle = 'rgba( 255, 255, 255, 0.05)';
  ctx.lineWidth = 1;
  ctx.stroke();
});
// 2. 各ノードの位置(x,y,仮想の奥行き), z軸ソート ======
nodes.forEach( node => {
  const currentAngle = node.baseAngle + globalRotation;//現在の回転角度
  // node に座標を指定  楕円軌道上でのx,y座標算出
  node.x = centerX + Math.cos( currentAngle ) * node.distanceX;
  node.y = centerY + Math.sin( currentAngle ) * node.distanceY;
  // 奥行き係数 (手前:大  奥:小)  
  const depthFactor = (Math.sin(currentAngle) + 1.5) /2;
  node.scale = 0.6 + depthFactor * 0.9;
});
// Y座標(の上下)でソート (手前のものを後から描画して重なりを表現する)
const sortedNodes = [...nodes].sort( (a, b) => a.y - b.y );
// ソートした最も後ろの要素 = 一番手前
const frontNode = sortedNodes[sortedNodes.length-1];
// 一番手前の星ノードを自動的に検知　するためのフック
if ( frontNode && frontNode.id !== activeNodeId) {
  // frontNode : 画面手前の星ノード,  
  // 選択中の星ノードと手前に来たノードが異なる時の処理
  activeNodeId = frontNode.id; 
  updateActivePanel(frontNode);
}

// 3. node:PlanetNode 自体の描画
sortedNodes.forEach( node => {
  const alpha = 0.3 + (node.scale / 1.5) * 0.7;// 透明度の定数  奥にあるほど低い
  const isActive = node.id ===activeNodeId;// true/false 選択中の星ノードの場合
  ctx.save();// 状態保存
  ctx.translate( node.x, node.y );// 座標を指定
  // 選択中 星ノードの場合に加飾----リング(外縁)を付ける
  if (isActive) {
    ctx.beginPath();
    ctx.arc( 0, 0, node.radius * node.scale * 1.8, 0, Math.PI * 2);
    ctx.strokeStyle = node.color;
    ctx.lineWidth = 1.5;
    ctx.globalAlpha = 0.8;
    ctx.stroke();
  }
  // 星ノードの円を描画
  ctx.beginPath();
  ctx.arc( 0, 0, node.radius * node.scale, 0, Math.PI * 2);
  ctx.fillStyle = node.color;
  ctx.globalAlpha = alpha;
  ctx.shadowBlur = isActive ? 20 : 10;//選択中の場合は発光(しているように見せる)
  ctx.fill();
  // ラベル
  ctx.font = `${isActive ? 'bold 12px' : '10px'} Inter, sans-serif`;
  ctx.fillStyle = '#ffffff';
  ctx.globalAlpha = isActive ? 1.0 : alpha * 0.6;
  ctx.fillText( node.name, 16, 4 );

  ctx.restore();// save()の状態保存を再現
});// sortedNodes.forEach()

// 次の描画フレームで再度renderを呼び出す...アニメーションを継続させる
animationId = requestAnimationFrame(render);

};// const render()


// イベントリスナー付与 (Utility methods)
window.addEventListener( 'resize', resize );
// touchmove や wheel の動作を阻害しないように passiveオプションを有効化
window.addEventListener( 'wheel', handleWheel, { passive: true } );
window.addEventListener( 'touchstart', handleTouchStart, { passive: true} );
window.addEventListener( 'touchmove', handleTouchMove, { passive: true } );
canvas.addEventListener( 'click', handleClick );


// ---- 初期化 ----
resize();
render();


// ---- ページが破棄されるときに不要なイベントやループを削除してメモリリークを防ぐ ----
return () => {
  window.removeEventListener( 'resize', resize );
  window.removeEventListener( 'wheel', handleWheel );
  window.removeEventListener( 'touchstart', handleTouchStart );
  window.removeEventListener( 'touchmove', handleTouchMove );  
  canvas.removeEventListener( 'click', handleClick );
  cancelAnimationFrame(animationId);
};


}// initOrbitalMenu()

