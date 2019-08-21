---
title: CSS Houdini实现动态波浪纹1
subtitle: CSS Houdini号称CSS领域最令人振奋的革新，它直接将CSS的API暴露给开发者，以往完全黑盒的浏览器解析流的部分环节对外开放，开发者可以自定义属于自己的CSS属性。
cover: http://img12.360buyimg.com/jdphoto/s800x530_jfs/t1/74847/21/5179/217476/5d35b8afEa7d7bcb6/685be624382850e6.jpg
date: 2019-07-22 19:00:00
tags:
  - CSS
categories: H5开发
ckey: 21
author:
  nick: 黄浩群
  github_name: huanghaoqun
---

CSS Houdini 号称 CSS 领域最令人振奋的革新。CSS 本身长期欠缺语法特性，可拓展性几乎为零，并且新特性的支持效率太低，兼容性差，比如09年提出的 flexbox 布局我到现在在移动端开发都还不敢直接使用。而 Houdini 直接将 CSS 的 API 暴露给开发者，以往完全黑盒的浏览器解析流的部分环节对外开放，开发者可以自定义属于自己的 CSS 属性。

![](http://img10.360buyimg.com/wq/jfs/t1/68616/22/5220/46079/5d35ae6cE910a7d93/c4847bf0290cc197.png)

CSS Houdini 提供的 Layout API 允许开发者编写自己的 Layout Module，自定义 display 这类的布局属性，Paint API 允许开发者编写自己的 Paint Module，自定义 background-image 这类的绘制属性，下边用 demo 演示如何用 CSS Paint API 实现一个动态波浪的效果。

## 基础：三步用上 Paint API
#### 1、HTML中通过 Worklets 载入样式的自定义代码：

```html
<script>
if ('paintWorklet' in CSS) {
  CSS.paintWorklet.addModule('paintworklet.js');
}
</script>
```

Worklets 类似于 Web Worker，是一个运行于主代码之外的独立工作进程，但比 Worker 更为轻量，负责 CSS 渲染任务最为合适。

#### 2、JS中registerPaint 方法定义 paint 属性的绘制逻辑：

```js
registerPaint('rect', class {
  static get inputProperties() { return ['--rect-color']; }
  paint(ctx, geom, properties) {
    const color = properties.get('--rect-color'); 
    ctx.fillStyle = color.cssText; 
    ctx.fillRect(0, 0, geom.width, geom.height);
  }
}
```

上边定义了一个名为 wave 的 paint 属性类，当 wave 被使用时，会实例化 wave 并自动触发 paint 函数，获取节点 CSS 定义的 --rect-color 变量，将元素的背景填充为指定颜色。ctx 参数是一个 Canvas 的 Context 对象，因此 paint 的逻辑跟 Canvas 的绘制方式一样。

#### 3、CSS 中使用的时候，只需要 paint 方法呼叫取用：

```css
.wave {
  background-image: paint(rect);
  --rect-color: rgb(255, 64, 129);
}
```

## 进阶：实现动态波纹

所以，要绘制一个波浪纹，可以这么写：

```html
<!-- index.html -->
<div id="wave"></div>

<style>
#wave {
  width: 20%;
  height: 70vh;
  margin: 10vh auto;
  
  background-image: paint(wave);
  --wave-color: rgba(255,255,255,0.54);
</style>

<script>
if ('paintWorklet' in CSS) {
  CSS.paintWorklet.addModule('paintworklet.js');
}

const wave = document.querySelector('#wave');
let start = performance.now();  
requestAnimationFrame(function raf(now) {
  const count = Math.floor(now - start);
  wave.style.cssText = `--animation-tick: ${count};`;
  requestAnimationFrame(raf);
});
</script>
```

```js
// paintworklet.js
registerPaint('wave', class {
  static get inputProperties() { 
    return ['--wave-color', '--animation-tick']; 
  }
  paint(ctx, geom, properties) {
    const waveColor = properties.get('--wave-color').toString();
    let tick = Number(properties.get('--animation-tick'));
    const { width, height } = geom;
    const initY = height * 0.4;

    tick = tick/6;
    ctx.beginPath();
    ctx.fillStyle = waveColor;
    ctx.moveTo(0, initY + Math.sin(tick / 20) * 10);
    for(let i=1; i<=width; i++) {
      ctx.lineTo(i, initY + Math.sin((i+tick) / 20) * 10);
    }
    ctx.lineTo(width, height);
    ctx.lineTo(0, height);
    ctx.lineTo(0, initY + Math.sin(tick / 20) * 10);
    ctx.fill();
  }
}
```

paintworklet 中，利用 sin 函数绘制波浪线，由于 AnimationWorklets 尚处于实验阶段，开放较少，这里用 requestAnimationFrame API 来做动画驱动，通过计时让波浪纹动起来。完成后能看到下边这样的效果。

![](http://img20.360buyimg.com/jdphoto/jfs/t1/59402/13/5150/39043/5d366e63E30cdb80f/ba1c0620d50bef37.gif)

然而事实上这个效果略显僵硬，sin 函数太过于规则了，现实中的波浪应该是不规则波动的，这种不规则主要体现在两个方面：

##### 1）波纹高度（Y）随位置（X）变化而不规则变化

![](http://img14.360buyimg.com/jdphoto/jfs/t1/40083/3/12170/6523/5d3671ebE5dd16e72/2b687d898da5cd39.jpg)

把图按照 x-y 正交分解之后，我们希望的不规则，可以认为是固定某一时刻，随着 x 轴变化，波纹高度 y 呈现不规则变化；

##### 2）固定某点（X 固定），波纹高度（Y）随时间推进而不规则变化

动态过程需要考虑时间维度，我们希望的不规则，还需要体现在时间的影响中，比如风吹过的前一秒和后一秒，同一个位置的波浪高度肯定是不规则变化的。

提到不规则，有朋友可能想到了用 Math.random 方法，然而这里的不规则并不适合用随机数来实现，因为前后两次取的随机数是不连续的，而前后两个点的波浪是连续的。这个不难理解，你见过长成锯齿状的波浪吗？又或者你见过上一刻10米高、下一刻就掉到2米的波浪吗？

为了实现这种连续不规则的特征，我们弃用 sin 函数，引入了一个包 simplex-noise。由于影响波高的有两个维度，位置 X 和时间 T，这里需要用到 noise2D 方法，它提前在一个三维的空间中，构建了一个连续的不规则曲面：

```html
<!-- index.html -->
...
<script>
...
let speedT = 0;
requestAnimationFrame(function raf(now) {
  speedT += 0.004;
  button.style.cssText = `--animation-tick: ${speedT};`;
  requestAnimationFrame(raf);
})；
</script>
...
```

```js
// paintworklet.js
...
let sim = new SimplexNoise();
...
paint(ctx, geom, properties) {
  const waveColor = properties.get('--wave-color').toString();
  let speedT = Number(properties.get('--animation-tick'));
  const { width, height } = geom;
  const initY = height * 0.4;

  let amp = 15;
  ctx.beginPath();
  ctx.fillStyle = waveColor;
  for(let x=0, speedX = 0; x <= width; x++){
    speedX += 0.004;
    var y = initY + sim.noise2D(speedX, speedT) * amp;
    ctx[x === 0 ? 'moveTo' : 'lineTo'](x,y);
  }
  ctx.lineTo(width, height);
  ctx.lineTo(0, height);
  ctx.lineTo(0, initY + sim.noise2D(0, speedT) * amp);
  ctx.fill();
}
...
```

复制绘制波纹的逻辑，修改峰值和偏置项等参数，可以画多一个不一样的波浪纹，效果如下，完工！

![](http://img12.360buyimg.com/jdphoto/jfs/t1/67101/33/5122/38219/5d366d3fE24f85efb/9d871d3a3e93bbae.gif)
