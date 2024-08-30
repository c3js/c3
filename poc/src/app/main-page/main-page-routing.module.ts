import { NgModule } from '@angular/core'
import { RouterModule, Routes } from '@angular/router'
import { MainPageComponent } from '@src/app/main-page/main-page.component'
import { TestSandboxComponent } from '@src/app/sandboxes/test-sandbox/test-sandbox.component'
import { ChartPocStoryComponent } from '@src/app/sandboxes/chart-poc-story/chart-poc-story.component'
import { SelectPointsSandboxComponent } from '@src/app/sandboxes/select-points-sandbox/select-points-sandbox.component'
import { VerticalLineSyncSandboxComponent } from '@src/app/sandboxes/vertical-line-sync-sandbox/vertical-line-sync-sandbox.component'
import { BarChartSandboxComponent } from '@src/app/sandboxes/bar-chart-sandbox.component/bar-chart-sandbox.component'
import { ChartListSandboxComponent } from '@src/app/sandboxes/chart-list-sandbox/chart-list-sandbox.component'

const routes: Routes = [
  {
    path: '',
    component: MainPageComponent,
  },
  {
    path: 'test-sandbox',
    component: TestSandboxComponent,
  },
  {
    path: 'chart-poc-story',
    component: ChartPocStoryComponent,
  },
  {
    path: 'select-points-sandbox',
    component: SelectPointsSandboxComponent,
  },
  {
    path: 'vertical-line-sync-sandbox',
    component: VerticalLineSyncSandboxComponent,
  },
  {
    path: 'bar-chart-sandbox',
    component: BarChartSandboxComponent,
  },
  {
    path: 'chart-list-sandbox',
    component: ChartListSandboxComponent,
  },
]

@NgModule({
  declarations: [],
  imports: [RouterModule.forChild(routes)],
  providers: [],
})
export class MainPageRoutingModule {}
