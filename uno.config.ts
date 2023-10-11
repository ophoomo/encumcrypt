// uno.config.ts
import { defineConfig } from 'unocss'

export default defineConfig({
  // ...UnoCSS options
  shortcuts: {
    'btn': 'p-2 text-white rounded-md shadow-none cursor-pointer duration-200',
    'wh-full': 'w-full h-full',
    'flex-center': 'flex justify-center items-center',
  }
})