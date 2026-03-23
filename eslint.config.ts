import antfu from '@antfu/eslint-config'

export default antfu({
  astro: true,
  formatters: true,
  // @ts-expect-error - missing type in package
  perfectionist: true,
})
