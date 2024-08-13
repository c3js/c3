import cloneDeep from 'lodash/cloneDeep'
import { FormControlExtended } from '@src/app/common/types/form-control-extended'
import { lang } from '@src/app/common/constants/lang.constants'
import { selectedLang } from '@src/app/common/constants/constants'
import { UntypedFormControl } from '@angular/forms'
import { LwCustomError } from '@src/app/common/shared/validators/lw-custom-validator.validator'

const currentLang = lang[selectedLang]

function limitValueErrorMessage(key: string, errorMessages: any, control: UntypedFormControl) {
  return (errorMessages[key] as any).format(control.errors[key].requiredValue)
}

function getAttr(control: UntypedFormControl, input?: any) {
  return input?.$$attr ? input.$$attr : (control as FormControlExtended).$$attr
}

export function getErrorMessageMap(control: UntypedFormControl, inputName?: string, input?: any) {
  const errorMessages = Object.assign(
    cloneDeep(currentLang.errorMessages.commonErrorMessages),
    currentLang.errorMessages[inputName?.split('|')[0]]
  )

  const errorMessagesMap = {
    lwNgRequired: () => errorMessages.required,
    lwMaxLength: () => (errorMessages.maxlength as any).format(control.errors.lwMaxLength.requiredValue),
    lwMinLength: () => (errorMessages.minlength as any).format(control.errors.lwMinLength.requiredValue),
    maxValue: () => limitValueErrorMessage('maxValue', errorMessages, control),
    minValue: () => limitValueErrorMessage('minValue', errorMessages, control),
    required: () => errorMessages.required,
    dateInputValidation: () => errorMessages.dateInputValidation,
    fromLaterThanTo: () => errorMessages.fromLaterThanTo,
    isNotInList: () => errorMessages.isNotInList,
    maxlength: () =>
      (errorMessages.maxlength as any).format(
        getAttr(control, input)?.maxlength || control.errors.maxlength.requiredLength || $(input).attr('maxlength')
      ),
    isNotUnicode: () => errorMessages.isNotUnicode,
    isNotEmail: () => errorMessages.isNotEmail,
    isFloat: () => (errorMessages.isFloat as any).format(getAttr(control, input)?.isFloat || '2'),
    isNumber: () => errorMessages.isNumber,
    isURL: () => errorMessages.isURL,
    daysInMonth: () => limitValueErrorMessage('daysInMonth', errorMessages, control),
    isNotLongFloat: () => errorMessages.isNotLongFloat,
    [LwCustomError.COMPARE_TO]: () => errorMessages.compareTo,
    isExistIn: () => errorMessages.isExistIn,
    isPhone: () => errorMessages.isPhone,
    [LwCustomError.MAX_DATE]: () => limitValueErrorMessage(LwCustomError.MAX_DATE, errorMessages, control),
    [LwCustomError.MAX_TIME]: () => limitValueErrorMessage(LwCustomError.MAX_TIME, errorMessages, control),
    [LwCustomError.MIN_DATE]: () => limitValueErrorMessage(LwCustomError.MIN_DATE, errorMessages, control),
    [LwCustomError.MIN_TIME]: () => limitValueErrorMessage(LwCustomError.MIN_TIME, errorMessages, control),
  }

  return errorMessagesMap
}
