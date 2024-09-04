import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { FormsModule, ReactiveFormsModule } from '@angular/forms'
import { NumberInputComponent } from '@src/app/common/shared/components/number-input/number-input.component'
import { BarChartWrapperComponent } from '@src/app/common/shared/components/bar-chart-wrapper/bar-chart-wrapper.component'
import { LineChartWrapperComponent } from '@src/app/common/shared/components/line-chart-wrapper/line-chart-wrapper.component'
import { ChartPanelComponent } from '@src/app/common/shared/components/chart-panel/chart-panel.component'
import { TrackVisibilityDirective } from '@src/app/common/shared/directives/track-visibility.directive'
import { ResizeVHandleComponent } from '@src/app/common/shared/components/resize-handle/resize-v-handle.component'
import { ScrollDirectionDirective } from '@src/app/common/shared/directives/scroll-direction.directive'

@NgModule({
  declarations: [
    LineChartWrapperComponent,
    BarChartWrapperComponent,
    NumberInputComponent,
    ChartPanelComponent,
    ResizeVHandleComponent,
    TrackVisibilityDirective,
    ScrollDirectionDirective,
  ],
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  exports: [
    NumberInputComponent,
    LineChartWrapperComponent,
    BarChartWrapperComponent,
    ChartPanelComponent,
    ResizeVHandleComponent,
    TrackVisibilityDirective,
    ScrollDirectionDirective,
  ],
  providers: [],
})
export class SharedModule {}
