// OpenGL Shading Language
// 頂点シェーダー  Vertext Shader
// マウス座標を受け取り、頂点ごとに距離に応じた磁気の引力(変位)をGPU上で並列計算
// GPU側で各頂点（メッシュの角や分割点）の位置を毎フレーム計算する処理

// ----------
// Uniform変数: TypeScript側から毎フレーム受取る入力値
// ----------
uniform vec2 uMouse;      // マウスのワールド座標 3D空間座標(z=0平面)に変換されたマウスの現在位置(x,y)
uniform float uStrength;  // 磁力の強度 (頂点の引き寄せ度合い)
uniform float uRadius;    // 影響範囲の半径
uniform float uScrollSpeed; // スクロールスピード 正: 下方向、  負: 上方向、  0: 停止
// Varying変数: 頂点(Vertex)シェーダーからフラグメント(Fragment)シェーダーへ渡す値
varying vec2 vUv;         // テクスチャを貼り付けるためのUV座標 (0.0 ~ 1.0)


void main() {
  // テクスチャ座標をそのままFragmentへ引き継がせる
  vUv = uv;
  // 元の頂点座標をコピー → 処理用の変数posへ ... 元のpositionを書き換えない
  vec3 pos = position;

  // ----------
  // 磁気変形演出 (カーソル位置へ引き寄せる)
  // ----------
  // 現在の頂点(pos.xy)と マウス(カーソル)位置=座標:uMouse の直線距離を算出 (XY平面)
  float dist = distance( pos.xy, uMouse );
  // 影響範囲 uRadius  の内側=値が小さい  に頂点がある場合に変形させる
  if ( dist < uRadius ) {
    // 距離に応じた減衰 (中心ほど引きが強い=1.0に近づく)  外縁部分ほど0.0に向けて減衰する
    float effect = pow( 1.0 - (dist / uRadius), 2.0 ) * uStrength;

    // 頂点からカーソルに向かう単位ベクトル:方向のみを持つ長さ1のベクトル の算出
    // マウス(カーソル)の方向へ頂点を変形させる
    // ※ 0ディバイドを避けるために dist > 0.0 のときのみ
    if ( dist > 0.0001 ) {
      vec2 dir = normalize( uMouse - pos.xy );
      // 引き寄せる方向へ変化量を加算する
      pos.xy += dir * effect;
    }
  }

  // ----------
  // スクロールと連動するストレッチ:縦方向の伸縮
  // ----------
  // スクロール方向を問わず 「スクロールの速さ」を使用 → 絶対値化abs( uScrollSpeed )
  //  スクロールスピードに比例してY軸方向に変形(Y座標の倍率を広げる)
  pos.y *= ( 1.0 + abs(uScrollSpeed) * 0.2 );

  // ----------
  // スクリーン座標に変換する
  // ----------
  // ローカル座標 → ワールド座標 → カメラ視点 → 射影変換のじゅんで掛け合わせ  出力
  gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
}

