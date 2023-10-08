import { Component, NgZone, ViewChild, ElementRef, AfterViewInit, OnDestroy } from '@angular/core';

import { EngineService } from 'src/app/modules/engine/engine.service';

@Component({
  selector: 'app-game-view',
  templateUrl: './game-view.component.html',
  styleUrls: ['./game-view.component.scss']
})
export class GameViewComponent {

  @ViewChild('canvas', { static: true }) private canvas: ElementRef<HTMLCanvasElement>;

  constructor(
    private engineService: EngineService,
    private ngZone: NgZone
  ) { }

  public ngOnDestroy(): void {
    this.engineService.destroyCanvas(this.canvas);
  }

  ngAfterViewInit(): void {
    this.engineService.createCanvas(this.canvas, window.innerWidth, window.innerHeight);
    this.animate();
  }

  public animate(): void {
    // We have to run this outside angular zones,
    // because it could trigger heavy changeDetection cycles.
    this.ngZone.runOutsideAngular(() => {
      if (document.readyState !== 'loading') {
        this.engineService.render();
      } else {
        window.addEventListener('DOMContentLoaded', () => {
          this.engineService.render();
        });
      }

      window.addEventListener('resize', () => {
        this.engineService.resize(window.innerWidth, window.innerHeight);
      });
    });
  }
  
}
