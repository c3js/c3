const RANDOM_STRING_RADIX = 36
const RANDOM_STRING_START = 2
const RANDOM_STRING_END = 15

export function generateId() {
  return Math.random().toString(RANDOM_STRING_RADIX).substring(RANDOM_STRING_START, RANDOM_STRING_END)
}

export function wait(timeout: number = 0): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve()
    }, timeout)
  })
}

export type WaitBlock = { wakeUp: () => void; wait: Promise<void> }
export function waitBlock(timeout: number = 0): WaitBlock {
  let wakeUp: () => void
  let timerId = null
  const promise = new Promise<void>((resolve) => {
    wakeUp = () => {
      if (timerId) {
        clearTimeout(timerId)
      }
      resolve()
    }
    timerId = setTimeout(() => {
      resolve()
    }, timeout)
  })
  return {
    wakeUp,
    wait: promise,
  }
}

export function arrayToObject<T = any>(arr: Array<T>, keyField: string): Record<string, T> {
  return Object.assign({}, ...arr.map((item) => ({ [item[keyField]]: item })))
}

export function getRandomColor(): string {
  const letters = '0123456789ABCDEF'
  let color = '#'
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)]
  }
  return color
}

export function getRandomInt(min: number, max: number): number {
  const minCeiled = Math.ceil(min)
  const maxFloored = Math.floor(max)
  return Math.floor(Math.random() * (maxFloored - minCeiled) + minCeiled)
}
