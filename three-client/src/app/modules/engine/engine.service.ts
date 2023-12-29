import { Injectable, ElementRef } from '@angular/core';
import { Subject } from 'rxjs';

import * as THREE from 'three';
import { EffectComposer } from 'postprocessing';
// import { RenderPixelatedPass } from 'postprocessing';
// import { OutputPass } from 'postprocessing';

@Injectable()
export class EngineService {

  fps$: Subject<number> = new Subject<number>();
  memoryHeapUsed$: Subject<number> = new Subject<number>();
  memoryHeapLimit$: Subject<number> = new Subject<number>();

  private renderer: THREE.WebGLRenderer;
  private composer: EffectComposer;
  private camera: THREE.PerspectiveCamera;
  private scene: THREE.Scene;
  private ambientLight: THREE.AmbientLight;
  private sunLight: THREE.DirectionalLight;

  private cube: THREE.Mesh;
  private ground: THREE.Mesh;

  private frameId: number | null = null;

  private beginTime: any;
  private prevTime: any;
  private frames: number;

  constructor() { }

  destroyCanvas(canvas: ElementRef<HTMLCanvasElement>): void {
    if (this.frameId != null) {
      cancelAnimationFrame(this.frameId);
    }
    if (this.renderer != null) {
      this.renderer.dispose();
      this.renderer = undefined;
      canvas = undefined;
    }
  }

  createCanvas(canvas: ElementRef<HTMLCanvasElement>, width: number, height: number, pixelRatio: number): void {

    // setup renderer
    this.renderer = new THREE.WebGLRenderer({
      canvas: canvas.nativeElement,
      alpha: true,                    // transparent background
      antialias: true                 // smooth edges
    });
    this.renderer.setPixelRatio(pixelRatio);
    this.renderer.setSize(width, height);
    this.renderer.shadowMap.enabled = true;

    // initialize performance metrics
    this.beginTime = ( performance || Date ).now();
    this.prevTime = this.beginTime
    this.frames = 0;

    // create the scene
    this.scene = new THREE.Scene();

    // create the camera
    this.camera = new THREE.PerspectiveCamera(
      75, width / height, 0.1, 1000
    );
    this.camera.position.z = 5;
    this.scene.add(this.camera);

    // set soft white ambient light
    this.ambientLight = new THREE.AmbientLight(0x404040);
    this.ambientLight.position.z = 10;
    this.scene.add(this.ambientLight);

    // set sun light
    this.sunLight = new THREE.DirectionalLight( 0xffffff, 3 );
    this.sunLight.position.set( - 5, 10, 10 );
    this.sunLight.castShadow = true;
    this.sunLight.shadow.camera.top = 2;
    this.sunLight.shadow.camera.bottom = - 2;
    this.sunLight.shadow.camera.left = - 2;
    this.sunLight.shadow.camera.right = 2;
    this.sunLight.shadow.camera.near = 0.1;
    this.sunLight.shadow.camera.far = 40;
    this.scene.add(this.sunLight);

    // add geometry
    // this.cube = new THREE.Mesh(
    //   new THREE.BoxGeometry(1, 1, 1), 
    //   new THREE.MeshPhongMaterial({ color: 0xcbcbcb, depthWrite: true })
    // );
    // // this.cube.receiveShadow = true;
    // this.cube.castShadow = true;
    // this.scene.add(this.cube);

    // add geometry using custom shader
    const uniforms = {
      colorB: {type: 'vec3', value: new THREE.Color(0xACB6E5)},
      colorA: {type: 'vec3', value: new THREE.Color(0x74ebd5)}
    };

    const geometry = new THREE.BoxGeometry(1, 1, 1);
    const material =  new THREE.ShaderMaterial({
      uniforms,
      fragmentShader: this.fragmentShader(),
      vertexShader: this.vertexShader(),
    });

    this.cube = new THREE.Mesh(geometry, material);
    this.cube.castShadow = true;
    this.scene.add(this.cube);

    // add ground plane
    this.ground = new THREE.Mesh(
      new THREE.PlaneGeometry(100, 100),
      new THREE.MeshPhongMaterial({ color: 0x32a852, depthWrite: true })
    );
    this.ground.receiveShadow = true;
    this.ground.position.set( 0, -1.5, 0 );
    const angle = -90;
    const rads = angle * (Math.PI/180);
    this.ground.rotateX(rads);

    this.scene.add(this.ground);

  }

  public render(): void {
    this.frameId = requestAnimationFrame(() => {
      this.render();
    });

    // animate cube
    this.cube.rotation.x += 0.01;
    this.cube.rotation.y += 0.01;
    this.renderer.render(this.scene, this.camera);

    // update performance metrics
    this.frames++;
    var time = ( performance || Date ).now();
    if ( time >= this.prevTime + 1000 ) {
      const fps = ( this.frames * 1000 ) / ( time - this.prevTime );
      this.fps$.next(fps);

      const memoryHeapUsed = (performance as any).memory.usedJSHeapSize / 1048576;
      this.memoryHeapUsed$.next(memoryHeapUsed);

      const memoryHeapLimit = (performance as any).memory.jsHeapSizeLimit / 1048576;
      this.memoryHeapLimit$.next(memoryHeapLimit);    

      this.prevTime = time;
      this.frames = 0;
    }
  }

  public resize(width: number, height: number): void {
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();

    this.renderer.setSize(width, height);
  }

  vertexShader() {
    return `
      varying vec3 vUv; 

      void main() {
        vUv = position; 

        vec4 modelViewPosition = modelViewMatrix * vec4(position, 1.0);
        gl_Position = projectionMatrix * modelViewPosition; 
      }
    `;
  }

  fragmentShader() {
    return `
      uniform vec3 colorA; 
      uniform vec3 colorB; 
      varying vec3 vUv;

      void main() {
        gl_FragColor = vec4(mix(colorA, colorB, vUv.z), 1.0);
      }
    `;
  }
}
