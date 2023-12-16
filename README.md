# consoleDraw

Draw pixel art straight to your JavaScript console!

Just copy the code below and paste it into your console to try it out!

```javascript
const consoleDraw = (matrix, darkModeInvert = false) => console.log('\n' + matrix.map(row => '%c  '.repeat(row.length)).join('\n') + '\n', ...matrix.flat().map(darkModeInvert && window.matchMedia('(prefers-color-scheme: dark)').matches ? color => 'background-color:' + invertColor(color) : color => 'background-color:' + color));
```

Playground: https://consoledraw.io