import { Component, NgZone, ViewChild, ElementRef, AfterViewInit, OnDestroy } from '@angular/core';
import { Subject, combineLatest, takeUntil } from 'rxjs';

import { EngineService } from 'src/app/modules/engine/engine.service';

@Component({
  selector: 'app-game-view',
  templateUrl: './game-view.component.html',
  styleUrls: ['./game-view.component.scss']
})
export class GameViewComponent {

  @ViewChild('canvas', { static: true }) private canvas: ElementRef<HTMLCanvasElement>;
  @ViewChild('fpsMeter', { static: true }) private fpsMeter: ElementRef<HTMLElement>;
  @ViewChild('memoryMeter', { static: true }) private memoryMeter: ElementRef<HTMLElement>;
  @ViewChild('memoryLimitMeter', { static: true }) private memoryLimitMeter: ElementRef<HTMLElement>;

  private destroy$: Subject<void> = new Subject<void>();

  constructor(
    private engineService: EngineService,
    private ngZone: NgZone
  ) { }

  public ngOnDestroy(): void {
    this.engineService.destroyCanvas(this.canvas);
    this.destroy$.next();
  }

  ngAfterViewInit(): void {
    this.engineService.createCanvas(this.canvas, window.innerWidth, window.innerHeight, window.devicePixelRatio);

    combineLatest([
      this.engineService.fps$,
      this.engineService.memoryHeapUsed$,
      this.engineService.memoryHeapLimit$
    ]).pipe(
      takeUntil(this.destroy$)
    ).subscribe(([fps, memoryUsed, memoryLimit]) => {
      this.fpsMeter.nativeElement.innerHTML = `FPS: ${Math.floor(fps)}`;
      this.memoryMeter.nativeElement.innerHTML = `Memory used: ${memoryUsed.toFixed(1)} MB`;
      this.memoryLimitMeter.nativeElement.innerHTML = `Memory limit: ${memoryLimit.toFixed(1)} MB`;
    });

    this.startRenderLoop();
  }

  public startRenderLoop(): void {
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
