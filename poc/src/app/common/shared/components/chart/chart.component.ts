import {
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  Output,
  SimpleChanges,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core'
import { ChartPoint } from '@src/app/common/shared/components/chart/chart.types'
import { generateId } from '@src/app/common/utils/helpers'
import c3 from '@src/app/c3/src/index.js'
import * as d3 from 'd3'

@Component({
  selector: 'lw-chart',
  templateUrl: './chart.component.html',
  styleUrls: ['./chart.component.less'],
  encapsulation: ViewEncapsulation.None,
})
export class ChartComponent implements AfterViewInit, OnChanges, OnDestroy {
  @Input() id = `chart_${generateId()}`

  @Input() params!: any

  @Output() pointer = new EventEmitter<ChartPoint>()

  @ViewChild('chart', { static: true }) chart!: ElementRef

  protected instance!: any
  private timeout!: ReturnType<typeof setTimeout>

  ngAfterViewInit(): void {
    this.init()
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (!changes['params'].firstChange && changes['params'].previousValue?.chartObj) {
      changes['params'].previousValue.chartObj?.destroy()
    }
    this.init()
  }

  ngOnDestroy(): void {
    this.instance.destroy()
    clearTimeout(this.timeout)
  }

  private init(): void {
    this.create()
    this.resize()
    this.subscribe()
  }

  private create(): void {
    const id = this.extractIdFromBindTo(this.params.bindto)
    this.setElementId(id)
    this.instance = c3.generate({
      bindto: id || this.chart.nativeElement,
      ...this.params,
    })
    this.params.chartObj = this.instance
  }

  private extractIdFromBindTo(bindTo: string): string {
    return bindTo.startsWith('#') ? bindTo.slice(1) : bindTo
  }

  private setElementId(id: string): void {
    if (id) {
      this.chart.nativeElement.id = id
    }
  }

  private resize(): void {
    this.timeout = setTimeout(() => this.instance.resize())
  }

  private subscribe(): void {
    const internal = this.instance.internal
    const pointer = this.pointer

    internal.main.on('click', function (this: d3.ContainerElement) {
      const coords = d3.mouse(this)
      pointer.emit({
        x: internal.x.invert(coords[0]),
        y: internal.y.invert(coords[1]),
      })
    })
  }

  getInstance(): any {
    return this.instance
  }
}
