export function ChartInternal(api) {
  var $$ = this
  // Note: This part will be replaced by rollup-plugin-modify
  // When bundling esm output. Beware of changing this line.
  // TODO: Maybe we should check that the modification by rollup-plugin-modify
  // is valid during unit tests.
  $$.d3 = (window as any).d3
    ? (window as any).d3
    : typeof require !== 'undefined'
    ? require('d3')
    : undefined
  $$.api = api
  $$.config = $$.getDefaultConfig()
  $$.data = {}
  $$.cache = {}
  $$.axes = {}
}
