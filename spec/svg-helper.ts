/**
 * Parse the d property of an SVG path into an array of drawing commands.
 * @param  {String} d SvgPath d attribute.]
 * @return {Array} an array of drawing commands.
 */
export function parseSvgPath(d) {
  //jshint ignore:line
  'use strict'

  const commands = []
  const commandTokens = ['M', 'L', 'I', 'H', 'V', 'C', 'S', 'Q', 'T', 'A']
  let command
  let in_x = false
  let in_y = false
  let x = ''
  let y = ''
  for (var i = 0; i <= d.length; i++) {
    if (commandTokens.indexOf(d[i]) !== -1) {
      if (in_x || in_y) {
        commands.push({ command: command, x: x, y: y })
        x = ''
        y = ''
      }
      command = d[i]
      in_x = true
      in_y = false
    } else {
      if (d[i] === ',') {
        if (in_y) {
          commands.push({ command: command, x: x, y: y })
          x = ''
          y = ''
        }
        in_x = !in_x
        in_y = !in_y
      } else if (in_x) {
        x += d[i]
      } else if (in_y) {
        y += d[i]
      }
    }
  }
  if (d[i] !== ',' && in_y) {
    commands.push({ command: command, x: x, y: y })
  }
  return commands
}
