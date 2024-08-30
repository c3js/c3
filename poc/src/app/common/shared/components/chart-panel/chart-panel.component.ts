import { Component, ElementRef, Input, OnDestroy, OnInit, ViewChild } from '@angular/core'
import { ChartPanelData } from '@src/app/common/shared/components/chart-panel/chart-panel.types'

@Component({
  selector: 'lw-chart-panel',
  templateUrl: './chart-panel.component.html',
  styleUrls: ['./chart-panel.component.less'],
})
export class ChartPanelComponent implements OnInit, OnDestroy {
  @Input() data: ChartPanelData

  resizeObserver: ResizeObserver
  @ViewChild('chartPanel', { static: true }) chartPanel: ElementRef<HTMLDivElement>

  ngOnInit(): void {
    this.createResizeObserver()
  }

  ngOnDestroy(): void {
    this.destroyResizeObserver()
  }

  private createResizeObserver(): void {
    this.resizeObserver = new ResizeObserver((entries: ResizeObserverEntry[], observer: ResizeObserver) => {
      console.log('Panel resize', entries)
    })
    this.resizeObserver.observe(this.chartPanel.nativeElement)
  }

  private destroyResizeObserver(): void {
    this.resizeObserver.unobserve(this.chartPanel.nativeElement)
    this.resizeObserver = null
  }
}
