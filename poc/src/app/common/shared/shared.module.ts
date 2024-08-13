import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { FormsModule, ReactiveFormsModule } from '@angular/forms'
import { ChartComponent } from '@src/app/common/shared/components/chart/chart.component'
import { NumberInputComponent } from '@src/app/common/shared/components/number-input/number-input.component'
import { ChartWrapperComponent } from '@src/app/common/shared/components/chart-wrapper/chart-wrapper.component'

@NgModule({
  declarations: [ChartComponent, ChartWrapperComponent, NumberInputComponent],
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  exports: [ChartComponent, NumberInputComponent, ChartWrapperComponent],
  providers: [],
})
export class SharedModule {}
