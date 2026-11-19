// OpenGL Shading Language
// テクスチャサンプリング
// 変化点に色収差(RGBシフト)を加えてクオリティアップを図ってみる
uniform sampler2D uTexture;
//uniform float uStrength;
varying vec2 vUv;

void main() {
  // 変形の程度に応じて色収差を発生
  //vec2 uv = vUv;
  vec4 color = texture2D( uTexture, vUv );

  gl_FragColor = color;
}