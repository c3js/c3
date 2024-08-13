import { Component, OnInit } from '@angular/core'
import c3 from '@src/app/c3/src/index.js'

@Component({
  selector: 'lw-test-sandbox',
  templateUrl: './test-sandbox.component.html',
  styleUrls: ['./test-sandbox.component.less'],
})
export class TestSandboxComponent implements OnInit {
  chart1 = null
  chart2 = null

  ngOnInit() {
    this.chart1 = c3.generate({
      bindto: '#chart1',
      data: {
        columns: [this.generateData(100)],
      },
      zoom: {
        enabled: true,
        initialRange: [30, 60],
        onzoomstart: function (event) {
          console.log('onzoomstart', event)
        },
        onzoomend: function (domain) {
          console.log('onzoomend', domain)
        },
      },
      subchart: { show: true },
    })

    this.chart2 = c3.generate({
      bindto: '#chart2',
      data: {
        columns: [this.generateData(100)],
      },
      axis: {
        x: {},
      },
      zoom: {
        enabled: true,
        initialRange: [30, 60],
      },
    })
  }

  load() {
    this.chart1.load({
      columns: [this.generateData(Math.random() * 1000)],
    })
  }

  generateData(n): string[] {
    const column = ['sample']
    for (let i = 0; i < n; i++) {
      column.push(String(Math.random() * 500))
    }
    return column
  }
}
