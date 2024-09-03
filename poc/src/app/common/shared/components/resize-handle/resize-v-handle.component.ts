import { Component, HostBinding, Input } from '@angular/core'

@Component({
  selector: 'lw-resize-v-handle',
  template: '<div></div>',
  styleUrls: ['./resize-v-handle.component.less'],
})
export class ResizeVHandleComponent {
  @HostBinding('style.top') top = '0px'
  @HostBinding('style.visibility') visibility = 'hidden'
}
