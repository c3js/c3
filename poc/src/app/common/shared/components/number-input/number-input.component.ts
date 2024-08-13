import {
  Component,
  Input,
  OnInit,
  forwardRef,
  Injector,
  Optional,
  ElementRef,
  HostListener,
  ViewEncapsulation,
  InjectFlags,
} from '@angular/core'
import { NgControl, NG_VALUE_ACCESSOR, ControlValueAccessor, ControlContainer, NgForm, FormGroupDirective } from '@angular/forms'

@Component({
  selector: 'lw-number-input',
  templateUrl: './number-input.component.html',
  styleUrls: ['./number-input.component.less'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => NumberInputComponent),
      multi: true,
    },
  ],
  encapsulation: ViewEncapsulation.None,
})
export class NumberInputComponent implements ControlValueAccessor, OnInit {
  @Input() maxValue: number
  @Input() minValue: number
  @Input() relative = false
  @Input() hideErrorMessage? = false
  @Input() hideArrows? = false
  control: NgControl

  isDisabled = false

  onChange: (_: any) => void
  onTouched: () => void

  constructor(
    private elementRef: ElementRef,
    private readonly injector: Injector,
    @Optional() private form: ControlContainer
  ) {}

  ngOnInit(): void {
    this.control = this.injector.get(NgControl, null, InjectFlags.Optional)
  }

  writeValue(value: any): void {
    this.inputElement.value = value
  }

  registerOnChange(fn: (_: any) => void): void {
    this.onChange = fn
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn
  }

  increment(event?) {
    if (event) {
      event.target.blur()
    }
    if (this.isDisabled) {
      return
    }
    const parsedValue = parseInt(this.inputElement.value, 10)

    if (Number.isNaN(parsedValue)) return

    let numberValue = !parsedValue ? 0 : parsedValue || this.minValue - 1
    if (this.maxValue === null || this.maxValue === undefined || numberValue < this.maxValue) {
      numberValue++
      this.inputElement.value = numberValue.toString()
      this.onChange(numberValue)
    }
  }

  decrement(event?) {
    if (event) {
      event.target.blur()
    }
    if (this.isDisabled) {
      return
    }
    let numberValue = parseInt(this.inputElement.value, 10) || this.maxValue + 1
    if (this.minValue === null || this.minValue === undefined || numberValue > this.minValue) {
      numberValue--
      this.inputElement.value = numberValue.toString()
      this.onChange(numberValue)
    }
  }

  get invalid(): boolean {
    return this.control ? !!this.control.invalid : false
  }

  get touched(): boolean {
    return this.control && !!this.control.touched
  }

  get dirty(): boolean {
    return this.touched || this.submitted
  }

  get submitted(): boolean {
    return (this.form as NgForm | FormGroupDirective)?.submitted
  }

  get inputElement() {
    return (this.elementRef.nativeElement as HTMLElement).getElementsByTagName('input')[0] as HTMLInputElement
  }

  @HostListener('input')
  handleInput() {
    this.inputElement.value = this.inputElement.value.replace(/[e\+\-\,\.]/gi, '')
  }

  @HostListener('keydown', ['$event'])
  handleKeydown(event: KeyboardEvent) {
    if (event.key === 'e' || event.key === '+' || event.key === '-' || event.key === ',' || event.key === '.') {
      event.preventDefault()
      return
    }
    if (event.key === 'ArrowDown') {
      this.decrement()
      event.preventDefault()
      return
    }
    if (event.key === 'ArrowUp') {
      this.increment()
      event.preventDefault()
      return
    }
  }

  setDisabledState?(isDisabled: boolean) {
    this.isDisabled = isDisabled
  }
}
