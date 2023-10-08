import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { EngineModule } from '../engine/engine.module';
import { GameViewComponent } from './game-view/game-view.component';

@NgModule({
  declarations: [
    GameViewComponent
  ],
  imports: [
    CommonModule,
    EngineModule
  ],
  exports: [
    GameViewComponent
  ]
})
export class GameModule { }
