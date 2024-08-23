import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { FormsModule, ReactiveFormsModule } from '@angular/forms'
import { ChartComponent } from '@src/app/common/shared/components/chart/chart.component'
import { NumberInputComponent } from '@src/app/common/shared/components/number-input/number-input.component'
import { BarChartWrapperComponent } from '@src/app/common/shared/components/bar-chart-wrapper/bar-chart-wrapper.component'
import { LineChartWrapperComponent } from '@src/app/common/shared/components/line-chart-wrapper/line-chart-wrapper.component'

@NgModule({
  declarations: [ChartComponent, LineChartWrapperComponent, BarChartWrapperComponent, NumberInputComponent],
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  exports: [ChartComponent, NumberInputComponent, LineChartWrapperComponent, BarChartWrapperComponent],
  providers: [],
})
export class SharedModule {}
