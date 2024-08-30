import { NgModule } from '@angular/core'
import { MainPageComponent } from '@src/app/main-page/main-page.component'
import { MainPageRoutingModule } from '@src/app/main-page/main-page-routing.module'
import { RouterModule } from '@angular/router'
import { TestSandboxComponent } from '@src/app/sandboxes/test-sandbox/test-sandbox.component'
import { SharedModule } from '@src/app/common/shared/shared.module'
import { ChartPocStoryComponent } from '@src/app/sandboxes/chart-poc-story/chart-poc-story.component'
import { MatSlideToggleModule } from '@angular/material/slide-toggle'
import { CommonModule } from '@angular/common'
import { FormsModule, ReactiveFormsModule } from '@angular/forms'
import { SelectPointsSandboxComponent } from '@src/app/sandboxes/select-points-sandbox/select-points-sandbox.component'
import { VerticalLineSyncSandboxComponent } from '@src/app/sandboxes/vertical-line-sync-sandbox/vertical-line-sync-sandbox.component'
import { BarChartSandboxComponent } from '@src/app/sandboxes/bar-chart-sandbox.component/bar-chart-sandbox.component'
import { ChartListSandboxComponent } from '@src/app/sandboxes/chart-list-sandbox/chart-list-sandbox.component'
import { ResizableModule } from 'angular-resizable-element-labworks'

@NgModule({
  declarations: [
    MainPageComponent,
    TestSandboxComponent,
    ChartPocStoryComponent,
    SelectPointsSandboxComponent,
    VerticalLineSyncSandboxComponent,
    BarChartSandboxComponent,
    ChartListSandboxComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MainPageRoutingModule,
    RouterModule,
    SharedModule,
    MatSlideToggleModule,
    ResizableModule,
  ],
  providers: [],
})
export class MainPageModule {}
