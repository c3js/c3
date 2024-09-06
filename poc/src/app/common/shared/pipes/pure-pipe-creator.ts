import { Pipe, PipeTransform } from '@angular/core'

@Pipe({
  name: 'createPipeFromFunction',
})
export class PurePipeCreator implements PipeTransform {
  transform(callback, ...args): ReturnType<typeof callback> {
    return callback(...args)
  }
}
