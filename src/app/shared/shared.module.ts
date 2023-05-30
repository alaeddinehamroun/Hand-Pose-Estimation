import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Error404Component } from './error404/error404.component';
import { TruncatePipe } from '../pipes/truncate.pipe';



@NgModule({
  declarations: [
    Error404Component,
    TruncatePipe
  ],
  imports: [
    CommonModule
  ],
  exports: [
    Error404Component,
    TruncatePipe
  ]
})
export class SharedModule { }
