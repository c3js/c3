import { platformBrowserDynamic } from '@angular/platform-browser-dynamic'
import { AppModule } from './app/app.module'
import * as WebFont from 'webfontloader'

WebFont.load({
  google: {
    families: ['Roboto:400,500,700,900'],
  },
})

platformBrowserDynamic()
  .bootstrapModule(AppModule)
  .catch((err) => console.error(err))
