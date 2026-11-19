/**
 * テキストを一度HTML Canvas へ描画し、Three.jsを使用して
 * テクスチャマテリアルとして操作します
 */

import * as THREE from 'three';
// OpenGL Shading Language ...シェーダー
import vertexShader from '@/components/magneticDeformCharacters/vertex.glsl?raw';
import fragmentShader from '@/components/MagneticDeformCharacters/fragment.glsl?raw';


// class
class MagneticDeformCharactersApp {

// //// Variables
private container: HTMLElement;
private scene: THREE.Scene;
private camera: THREE.PerspectiveCamera;
private renderer: THREE.WebGLRenderer;
private material: THREE.ShaderMaterial;
private mesh: THREE.Mesh;
private mouse = new THREE.Vector2( -1000, -1000 );
private targetMouse = new THREE.Vector2( -1000, -1000 );
private raycaster = new THREE.Raycaster;
private planeZ = new THREE.Plane( new THREE.Vector3( 0, 0, 1 ), 0 )
private currentScrollSpeed = 0;
private lastScrollY = window.scrollY;


// //// Utility Methods ////
// ---------- 2D Canvasで文字テクスチャを生成する
private createTextTexture( text: string): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');// CanvasRenderingContext2D
  canvas.width = 2048;
  canvas.height = 512;

  if (ctx) {
    ctx.clearRect( 0, 0, canvas.width, canvas.height );
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 110px "Inter", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText( text, canvas.width / 2, canvas.height / 2 );
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;
  return texture;

}

// ---------- イベント初期化
private initEvents() {
  const windowWidth = window.innerWidth;
  const windowHeight = window.innerHeight;
  window.addEventListener( 'mousemove', (e) => {
    const x = ( e.clientX / windowWidth ) * 2 - 1;
    const y = -( e.clientY / windowHeight ) * 2 + 1;
    this.raycaster.setFromCamera( new THREE.Vector2(x,y), this.camera );
    const target = new THREE.Vector3();
    this.raycaster.ray.intersectPlane( this.planeZ, target );

    this.targetMouse.set( target.x, target.y );
  });
  window.addEventListener( 'scroll', () => {
    const currentScrollY = window.scrollY;
    const delta = currentScrollY -this.lastScrollY;
    this.currentScrollSpeed = delta * 0.08;
    this.lastScrollY = currentScrollY;
  });
  window.addEventListener( 'resize', () => {
    this.camera.aspect = windowWidth / windowHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize( windowWidth, windowHeight );
  });
}

// ---------- マウス(カーソル)に合わせた演出実行
private animate = () => {
  requestAnimationFrame( this.animate );
  // マウス座標に追従  慣性移動
  this.mouse.lerp( this.targetMouse, 0.1 );
  this.material.uniforms.uMouse.value.copy( this.mouse );
  // スクロール速度の収束 (ゴムのような反復と収束のある復元)
  this.currentScrollSpeed *= 0.88;
  this.material.uniforms.uScrollSpeed.value = this.currentScrollSpeed;
  this.renderer.render( this.scene, this.camera );
}

// ------------------------------


// //// Constructor //// 
//constructor( containerId: string ) {
constructor() {

  const windowWidth = window.innerWidth;
  const windowHeight = window.innerHeight;

  this.container = document.getElementById('webgl-container')!;

  // シーン・カメラ・レンダラーの初期化 (Lowパフォーマンス最適化)
  this.scene = new THREE.Scene();
  this.camera = new THREE.PerspectiveCamera( 45, windowWidth / windowHeight, 0.1, 1000 );
  this.camera.position.z = 5;

  this.renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: true,
    powerPreference: 'high-performance'
  });
  this.renderer.setSize( windowWidth, windowHeight );
  this.renderer.setPixelRatio( Math.min(window.devicePixelRatio, 2) );// 高解像度画面への高負荷を防ぐ制限
  this.container.appendChild( this.renderer.domElement );

  // テキスト描画用2D Canvasを生成
  const textTexture = this.createTextTexture("MAGNETIC DEFORMING");

  // シェーダーマテリアルの構築
  this.material = new THREE.ShaderMaterial({
    uniforms: {
      uTexture: {value: textTexture},
      uMouse: {value: new THREE.Vector2(0,0)},
      uStrength: {value: 0.8},
      uRadius: {value: 1.5},
      uScrollSpeed: {value: 0.0}
    },
    vertexShader,    // ← OprnGL Shading Language  Vertex
    fragmentShader,  // ← Fragment Shader
    transparent: true,
    side: THREE.DoubleSide
  });

  // PlaneGeometry 磁気変形演出をスムーズ化
  const geometry = new THREE.PlaneGeometry( 4, 1.2, 64, 32 );
  this.mesh = new THREE.Mesh( geometry, this.material );
  this.scene.add( this.mesh );

  this.initEvents();
  this.animate();

}// constructor()


}// class KineticTypographyScene


//アプリケーションの起動
new MagneticDeformCharactersApp();

