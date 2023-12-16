# consoleDraw

Draw pixel art straight to your JavaScript console!

Just copy the code below and paste it into your console to try it out!

```js
const consoleDraw = (matrix, darkModeInvert = false) => console.log('\n' + matrix.map(row => '%c  '.repeat(row.length)).join('\n') + '\n', ...matrix.flat().map(darkModeInvert && window.matchMedia('(prefers-color-scheme: dark)').matches ? color => 'background-color:' + invertColor(color) : color => 'background-color:' + color));
```

Once you've added the function to your console, you can call it with a matrix of colors. The matrix should be an array of arrays of strings, where each string is a valid CSS color (e.g. `#000000`). The function will then draw the matrix to your console.

```js
const pokeBall = [
  ["#00000000","#00000000","#00000000","#00000000","#000000ff","#000000ff","#000000ff","#000000ff","#00000000","#00000000","#00000000","#00000000"],
  ["#00000000","#00000000","#000000ff","#000000ff","#fb0007ff","#fb0007ff","#fb0007ff","#fb0007ff","#000000ff","#000000ff","#00000000","#00000000"],
  ["#00000000","#000000ff","#fb0007ff","#fb0007ff","#fb696fff","#fb0007ff","#fb0007ff","#fb0007ff","#fb0007ff","#fb0007ff","#000000ff","#00000000"],
  ["#00000000","#000000ff","#fb0007ff","#fb696fff","#fb696fff","#fb696fff","#fb0007ff","#fb0007ff","#fb0007ff","#fb0007ff","#000000ff","#00000000"],
  ["#000000ff","#fb0007ff","#fb0007ff","#fb0007ff","#fb696fff","#fb0007ff","#fb0007ff","#fb0007ff","#fb0007ff","#fb0007ff","#fb0007ff","#000000ff"],
  ["#000000ff","#fb0007ff","#fb0007ff","#fb0007ff","#fb0007ff","#000000ff","#000000ff","#fb0007ff","#fb0007ff","#fb0007ff","#fb0007ff","#000000ff"],
  ["#000000ff","#000000ff","#fb0007ff","#fb0007ff","#000000ff","#ffffffff","#ffffffff","#000000ff","#fb0007ff","#fb0007ff","#000000ff","#000000ff"],
  ["#000000ff","#ffffffff","#000000ff","#000000ff","#000000ff","#ffffffff","#ffffffff","#000000ff","#000000ff","#000000ff","#d5d5d5ff","#000000ff"],
  ["#00000000","#000000ff","#ffffffff","#ffffffff","#ffffffff","#000000ff","#000000ff","#d5d5d5ff","#d5d5d5ff","#d5d5d5ff","#000000ff","#00000000"],
  ["#00000000","#000000ff","#d5d5d5ff","#ffffffff","#ffffffff","#ffffffff","#d5d5d5ff","#d5d5d5ff","#d5d5d5ff","#d5d5d5ff","#000000ff","#00000000"],
  ["#00000000","#00000000","#000000ff","#000000ff","#d5d5d5ff","#d5d5d5ff","#d5d5d5ff","#d5d5d5ff","#000000ff","#000000ff","#00000000","#00000000"],
  ["#00000000","#00000000","#00000000","#00000000","#000000ff","#000000ff","#000000ff","#000000ff","#00000000","#00000000","#00000000","#00000000"]
];
consoleDraw(pokeBall);
```

Playground: https://consoledraw.io