// 周回星ノード Menu項目要素
interface PlanetNode {
  id: string;         // '01','02'...
  name: string;       // メニュー項目の題目
  category: string;   // 表示項目 : カテゴリ
  description: string;// メニューパネルの説明文
  angle: number;      // 公転角度(current
  baseAngle: number;  // 初期の角度 (デフォルト = 復元位置)
  distanceX: number;  // 軌道の横幅(長い半径) ... 描画される実サイズ(相対値ではない)
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
    name:'CORE ARCHITECTURE', category:'Basic',
    description:'Foundational framework and modular system design for high-performance web applications.',
    angle:0,
    baseAngle:0,
    distanceX:150,
    distanceY:60,
    radius:10,
    color:'#4df3ff',
    x:0,
    y:0,
    scale:1
  },
  // MENU 02
  // Math.PI : 3.14159...
  { id:'02',  name:'INTERACTIVE MOTION',  category:'Decorate',
    description:'Fluid physics, GSAP timelines, and spatial UI/UX dynamics crafted for Awwwards standards.',
    angle: Math.PI * 0.5,
    baseAngle: Math.PI * 0.5,
    distanceX:180,  distanceY:72.5,  radius:8,
    color:'#ffffff', x:0, y:0, scale:1
  },
  // MENU 03
  { id: '03', name:'KNOWLEDGE RAG',  category:'Document',
    description:'Advanced vector embeddings, YAML metadata schemas, and structured synthesis workflows.',
    angle:Math.PI,
    baseAngle: Math.PI,
    distanceX:210,  distanceY:85,  radius:9, 
    color: '#ffb86c', x:0,  y:0,  scale:1
  },
  // MENU 04
  { id:'04', name:'AUTOMATION PIPELINE',   category:'Tech',
    description:'Google Apps Script integrations, python text utilities, and seamless CI/CD test automation.',
    angle: Math.PI * 1.5, baseAngle: Math.PI * 1.5, 
    distanceX:240,  distanceY:97.5,  radius:11,  
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
// メニューパネル <div id="omActivePanel" <div id="omBottomDisplay" の中身
const displayContent = stage.querySelector('.om--bottom-display') as HTMLElement | null;
const categoryEl =  stage.querySelector('.category') as HTMLElement | null;
const titleEl = stage.querySelector('.title') as HTMLElement | null;
const descEl = stage.querySelector('.desc') as HTMLElement | null;
//const title = stage.querySelector('#omPanelTitle') as HTMLElement | null;
//const desc = stage.querySelector('#omPanelDesc') as HTMLElement | null;
// リンクをつける場合 const actionBtn = stage.querySelector('#omActionBtn') as HTMLElement | null;
// 自動公転のオンオフボタン
const toggleBtn = stage.querySelector('#omCenterToggle') as HTMLButtonElement | null;
const playIcon = toggleBtn?.querySelector('.play') as HTMLElement | null;
const pauseIcon = toggleBtn?.querySelector('.pause') as HTMLElement | null;

let animationId: number;          // アニメーションフレームID
let globalRotation = 0;           // 全体の回転状態(角度)  回転に伴って値を蓄積させる(自動で回転させるための値)
let targetRotation = 0;           // 特定エレメントの軌道(選択項目)の回転状態(角度)  値の回転状態まで進めるための値
let activeNodeId = nodes[0].id;   // 選択中星ノードのid 初期は先頭のid01
let isAutoRotation = true;        // 自動公転オンオフ  デフォルト ON:true
const autoRotationSpeed = 0.001;  // 自動公転スピード
const scrollRotationAmount = 0.002; // スクロール・ホイールで軌道を回転させる際の角度の増量値
const swipeRotationAmount = 0.005;  // タッチ操作時に軌道を回転させる角度の増量値

// --------------------
// Utility Methods
// --------------------
// method: 画面リサイズへの追従  canvasサイズを画面解像度に合わせて調整する --------------------
const resize = () => {
  const dpr = window.devicePixelRatio || 1;//高解像度 or 1(そのまま)
  const displayWidth = window.innerWidth;
  const displayHeight = window.innerHeight;
  // canvasの解像度を表示画面の解像度比率に合わせる
  canvas.width = displayWidth * dpr;
  canvas.height = displayHeight * dpr;
  //canvas.width = window.innerWidth * dpr;
  //canvas.height = window.innerHeight * dpr;
  // CSSサイズを画面幅に設定
  canvas.style.width = `${displayWidth}px`;
  canvas.style.height = `${displayHeight}px`;
  // 描画コンテキストにスケールを適用。座標計算位置をCSSと同期
  ctx.setTransform( 1, 0, 0, 1, 0, 0 );
  ctx.scale( dpr, dpr );
};

// method: 選択中の星ノードの内容へパネルの内容を書き換える --------------------
/*
const updateActivePanel = ( node: PlanetNode ) => {
  if (title) title.textContent = `${node.id} // ${node.name}`;
  if (desc) desc.textContent = node.description;
};
*/

// method: 選択した星ノードの内容に表記を切り替える --------------------
const setActiveNode = (nodeId: string) => {
  if (activeNodeId === nodeId) return;
  activeNodeId = nodeId;
  const node = nodes.find(n => n.id === nodeId);
  if (!node) return;
  
  //切り替えフェード演出
  if ( displayContent ) {
    displayContent.classList.add('is-animating');
    setTimeout(() => {
      if (categoryEl) categoryEl.textContent = node.category;
      if (titleEl) titleEl.textContent = node.name;
      if (descEl) descEl.textContent = node.description;
      displayContent.classList.remove('is-animating');
    }, 200);
  }
};

// method: スクロールで軌道を回転させる  マウスホイールイベントでtargetRotationを増やす --------------------
const handleWheel = (e: WheelEvent) => {
  targetRotation += e.deltaY * scrollRotationAmount;
};

// method: クリック・タッチ操作の共通処理 --------------------
const handleCommonInteract = ( clientX: number, clientY: number ) => {
  const rect = canvas.getBoundingClientRect();
  const mouseX = clientX - rect.left;//マウスポインターのイベント位置からcanvas上の座標を算出
  const mouseY = clientY - rect.top;
  let clickedNode: PlanetNode | null = null;
  let minDistance = Infinity;

  nodes.forEach( node => {
    const dx = mouseX - node.x;
    const dy = mouseY - node.y;
    const dist = Math.sqrt( dx ** 2 + dy ** 2 );
    const threshold = node.radius * node.scale * 3.5;// エイムの許容範囲
    if ( dist < threshold && dist < minDistance ) {
      minDistance = dist;
      clickedNode = node;
    }
  });

  if ( clickedNode ) {
    const node = clickedNode as PlanetNode;
    setActiveNode( node.id );
    // 軌道の正面に星ノードを公転させる
    const targetFrontAngle = Math.PI * 0.5;// 正面位置
    const diff = targetFrontAngle - ( node.baseAngle + globalRotation );// 星ノードと正面位置との差分
    targetRotation += diff;
  }

}// handleCommonInteract()

// method: マウス用クリックイベント --------------------
const handleClicker = ( e: MouseEvent ) => {
  handleCommonInteract( e.clientX, e.clientY );
}

// method: タッチ操作対応  マウスホイールと同様に動作させる --------------------
let touchStartX = 0;
let touchStartY = 0;// タッチを始めたポイントのY座標
let hasSwiping = false;// 移動中=スワイプ中フラグ
// // タッチ操作の起点
const handleTouchStart = (e: TouchEvent) => {
  if ( e.touches.length > 0 ) {
    // タッチ操作が "接触距離" を持つ場合に
    // タッチ操作のスタートを最初の接触位置(0)から取得する。 Y座標
    touchStartX - e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
    hasSwiping = false;// タッチ操作の開始時はフラグをリセット
  }
};
// // 画面に触れたままの操作=スワイプに対する処理 ... タッチポイントが動く毎に座標を更新する --------------------
const handleTouchMove = (e: TouchEvent) => {
  if (e.touches.length === 0) return;
  const currentX = e.touches[0].clientX;
  const currentY = e.touches[0].clientY;
  // 現在のタッチポイントY座標e.touches[0].clientY と 直前のタッチポイントY座標 の差分(deltaY) = 移動距離 を算出
  const deltaX = currentX - touchStartX;
  const deltaY = currentY - touchStartY;
  //const deltaY = e.touches[0].clientY - touchStartY;
  // タッチの移動距離が一定以上の時に "スワイプ操作"に判定
  if ( Math.hypot( deltaX, deltaY ) > 6 ) {
    hasSwiping = true;
  }
  // targetRotation から　移動距離 * 調整値(0.005)を減算して軌道を回転させる
  targetRotation -= deltaY * swipeRotationAmount;
  // 続けて移動距離を計算するためにタッチポイントの基準Y座標を更新(上書き)する
  touchStartX = currentX;
  touchStartY = currentY;
  //touchStartY = e.touches[0].clientY;
};
// // スワイプせず、タップと判定する場合 --------------------
const handleTouchEnd = ( e: TouchEvent ) => {
  if ( !hasSwiping && e.changedTouches.length > 0 ) {
    const touch = e.changedTouches[0];
    handleCommonInteract( touch.clientX, touch.clientY );// 星ノード選択時の処理
  }
}

// method: ノードクリック判定  カーソル座標と各ノードの位置からクリック対象かどうかを判定する --------------------
const handleClick = (e: MouseEvent) => {
  const rect = canvas.getBoundingClientRect();
  const mouseX = e.clientX - rect.left;//マウスポインターのイベント位置からcanvas上の座標を算出
  const mouseY = e.clientY - rect.top;
  // ポインターイベントの座標取得を修正中...
  // CSS上の表示サイズに対して、実際のCanvasピクセル解像度の比率を計算
  //const scaleX = canvas.width / rect.width;
  //const scaleY = canvas.height / rect.height;
  //const mouseX = ( e.clientX - rect.left ) * scaleX;
  //const mouseY = ( e.clientY - rect.top ) * scaleY;
  //const mouseX = ( e.clientX - rect.left ) * ( canvas.width / window.devicePixelRatio / rect.width );
  //const mouseY = ( e.clientY - rect.top ) * ( canvas.height / window.devicePixelRatio / rect.height );
  let clickedNode: PlanetNode | null = null;
  let minDistance = Infinity;

  // DEBAG LOG : //   console.log(`Click coordinates -> X: ${mouseX}, Y: ${mouseY}`);
  // EDIT: 各星ノードとの距離を測定　 → 判定範囲内で最も中心に近いものを選択する

  nodes.forEach( node => {
    // マウス座標(mouseX,Y) と各星ノード(の中心座標)との距離を算出 ... クリック位置に最も近い星ノードを特定する
    const dx = mouseX - node.x;
    const dy = mouseY - node.y;
    const dist = Math.sqrt( dx * dx + dy * dy );// △ 三平方の定理でx横軸,y立軸を結ぶ辺の長さをdist=距離とする
    const threshold = node.radius * node.scale * 3.5;// タッチ許容値(範囲)を設けました
    // DEBAG LOG : // console.log(`Node [${node.name}] position -> X: ${node.x.toFixed(1)}, Y: ${node.y.toFixed(1)}, Distance: ${dist.toFixed(1)}, Threshold: ${node.radius * node.scale * 2}`);
    // 当たり判定  算出距離が nodeの半径x2 = 直径以内に届く場合はヒット判定
    if ( dist < threshold && dist < minDistance ) {
      minDistance = dist;
      clickedNode = node;
    //if ( dist < node.radius * node.scale * 2) {
      //activeNodeId = node.id;
      //updateActivePanel( node ); // パネル表示を該当星ノードの内容に更新する
    }
  });

  if (clickedNode) {
    const node = clickedNode as PlanetNode;
    setActiveNode( node.id );// クリックされた星ノードを渡す
    //activeNodeId = clickedNode.id;
    //updateActivePanel( clickedNode );
    // クリックされた星ノードを正面まで公転させる
    //  正面（最前面 = 下部手前の位置、例えば角度 Math.PI * 0.5）に来るように
    //  targetRotation の目標値を逆算して設定
    const targetFrontAngle = Math.PI * 0.5;
    const diff = targetFrontAngle - ( node.baseAngle + globalRotation );
    // 現在の回転値に差分を追加。
    targetRotation += diff;

  }
};// handleClick()

// method: 自動公転オンオフボタン
const handleToggleAutoRotation = ( e: MouseEvent | TouchEvent ) => {
  e.stopPropagation();// canvasへのクリック判定伝播を防止
  isAutoRotation = !isAutoRotation;// 自動公転状態フラグの切り替え
  // アイコンのいずれかを取得
  if ( playIcon && pauseIcon ) {
    // 自動公転がオンになった
    if (isAutoRotation) {
      playIcon.style.display ='block';
      pauseIcon.style.display ='none';
      toggleBtn?.classList.remove('is-paused');
    } else {
      playIcon.style.display ='none';
      pauseIcon.style.display ='block';
      toggleBtn?.classList.add('is-paused');
    }
  }
}

// --------------------


// ----------------------------------------
// 描画  アニメーションループ
// ----------------------------------------
const render = () => {

// 座標の取得
const w_innerWidth = window.innerWidth;
const w_innerHeight = window.innerHeight;
const isMobile = w_innerWidth <= 800;// 横幅が小さな画面での表示時にcenterYの値を調整する(上方への位置調整を大きくする)
const centerX = w_innerWidth / 2;
//const centerY = w_innerHeight / 2 - 40;// 軌道の位置を上方向にオフセット
const centerY = isMobile ? w_innerHeight / 2 -60 : w_innerHeight / 2 - 40;
// 慣性(Lerp)の表現  targetRotationまでの差分を10%(0.1)ずつ近づける...減速しながら止まる
globalRotation += (targetRotation - globalRotation) * 0.1;
// 自動公転  フラグON のときに公転する
if (isAutoRotation) {
  targetRotation += autoRotationSpeed;
}

ctx.clearRect( 0, 0, w_innerWidth, w_innerHeight );// 前フレームの描画を初期化

// 1. node:PlanetNode ごとの軌道(楕円)の描画 ======
nodes.forEach( node => {
  ctx.beginPath();
  ctx.ellipse( centerX, centerY, node.distanceX, node.distanceY, 0, 0, Math.PI *2 );
  ctx.strokeStyle = 'rgba( 255, 255, 255, 0.05)';
  ctx.lineWidth = 1;
  ctx.stroke();
});
// 2. 各ノードの位置(x,y,仮想の奥行き), z軸ソート ======
// 画面幅が狭い場合に(ブレークポイント:550px)軌道全体の幅を縮小させる 係数
const screenScale = Math.min( 1, w_innerWidth / 550 );
nodes.forEach( node => {
  const currentAngle = node.baseAngle + globalRotation;//現在の回転角度
  // 画面幅に応じたスケール調整値
  const scaleDistanceX = node.distanceX * screenScale;
  const scaleDistanceY = node.distanceY * screenScale;
  // node に座標を指定  楕円軌道上でのx,y座標算出
  node.x = centerX + Math.cos( currentAngle ) * scaleDistanceX;
  node.y = centerY + Math.sin( currentAngle ) * scaleDistanceY;
  //node.x = centerX + Math.cos( currentAngle ) * node.distanceX;
  //node.y = centerY + Math.sin( currentAngle ) * node.distanceY;
  // 奥行き係数 (手前:大  奥:小)  
  const depthFactor = (Math.sin(currentAngle) + 1.5) / 2;
  //node.scale = 0.6 + depthFactor * 0.9;
  // 星ノードの大きさ調整
  node.scale = (0.6 + depthFactor * 0.9) * Math.max( 0.7, screenScale );
});
// Y座標(の上下)でソート (手前のものを後から描画して重なりを表現する)
const sortedNodes = [...nodes].sort( (a, b) => a.y - b.y );
// ソートした最も後ろの要素 = 一番手前
const frontNode = sortedNodes[sortedNodes.length-1];
// 一番手前の星ノードを自動的に検知　するためのフック
if ( frontNode && frontNode.id !== activeNodeId) {
  // frontNode : 画面手前の星ノード,  
  // 選択中の星ノードと手前に来たノードが異なる時の処理
  setActiveNode( (frontNode as PlanetNode).id );
  activeNodeId = frontNode.id; 
  //updateActivePanel(frontNode);
}

// 3. node:PlanetNode 自体の描画 =====
sortedNodes.forEach( node => {
  const alpha = 0.3 + (node.scale / 1.5) * 0.7;// 透明度の定数  奥にあるほど低い
  const isActive = node.id === activeNodeId;// true/false 選択中の星ノードの場合
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
  ctx.shadowColor = node.color;
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
// ----------------------------------------


// イベントリスナー付与 (Utility methods)
window.addEventListener( 'resize', resize );
// touchmove や wheel の動作を阻害しないように passiveオプションを有効化
window.addEventListener( 'wheel', handleWheel, { passive: true } );
window.addEventListener( 'touchstart', handleTouchStart, { passive: true} );
window.addEventListener( 'touchmove', handleTouchMove, { passive: true } );
window.addEventListener( 'touchend', handleTouchEnd, { passive: true } );
canvas.addEventListener( 'click', handleClicker );
if (toggleBtn) {
  toggleBtn.addEventListener( 'click', handleToggleAutoRotation);
  toggleBtn.addEventListener( 'touchend', handleToggleAutoRotation);
}

// ---- 初期化 ----
resize();
render();


// ---- ページが破棄されるときに不要なイベントやループを削除してメモリリークを防ぐ ----
return () => {
  window.removeEventListener( 'resize', resize );
  window.removeEventListener( 'wheel', handleWheel );
  window.removeEventListener( 'touchstart', handleTouchStart );
  window.removeEventListener( 'touchmove', handleTouchMove );  
  window.removeEventListener( 'touchend', handleTouchEnd );  
  canvas.removeEventListener( 'click', handleClicker );
  cancelAnimationFrame(animationId);
};


}// initOrbitalMenu()

