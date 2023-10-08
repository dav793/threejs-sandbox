import { Injectable, ElementRef } from '@angular/core';

import * as THREE from 'three';

@Injectable()
export class EngineService {

  private renderer: THREE.WebGLRenderer;
  private camera: THREE.PerspectiveCamera;
  private scene: THREE.Scene;
  private light: THREE.AmbientLight;

  private cube: THREE.Mesh;

  private frameId: number | null = null;

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

  createCanvas(canvas: ElementRef<HTMLCanvasElement>, width: number, height: number): void {

    // setup renderer
    this.renderer = new THREE.WebGLRenderer({
      canvas: canvas.nativeElement,
      alpha: true,                    // transparent background
      antialias: true                 // smooth edges
    });
    this.renderer.setSize(width, height);

    // create the scene
    this.scene = new THREE.Scene();

    // create the camera
    this.camera = new THREE.PerspectiveCamera(
      75, width / height, 0.1, 1000
    );
    this.camera.position.z = 5;
    this.scene.add(this.camera);

    // set soft white light
    this.light = new THREE.AmbientLight(0x404040);
    this.light.position.z = 10;
    this.scene.add(this.light);

    // add geometry
    const geometry = new THREE.BoxGeometry(1, 1, 1);
    const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
    this.cube = new THREE.Mesh(geometry, material);
    this.scene.add(this.cube);

    this.camera.position.z = 5;

  }

  public render(): void {
    this.frameId = requestAnimationFrame(() => {
      this.render();
    });

    this.cube.rotation.x += 0.01;
    this.cube.rotation.y += 0.01;
    this.renderer.render(this.scene, this.camera);
  }

  public resize(width: number, height: number): void {
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();

    this.renderer.setSize(width, height);
  }
}
