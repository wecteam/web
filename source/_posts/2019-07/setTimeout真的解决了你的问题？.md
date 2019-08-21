---
title: setTimeout真的解决了你的问题？
subtitle: "因为web终端环境、网络状态等都是不一样的，也许你看到的是好的，用户看到的就可能是另一回事咯。"
date: 2019-07-10 20:34:18
cover: https://img11.360buyimg.com/jdphoto/s1194x705_jfs/t1/65322/6/5180/75475/5d36b561E7a659c37/62dfdc67f362cfed.jpg
tags: setTimeout Event Loop Nodejs
categories: 知识分享
ckey: 19
author:
    nick: 钟周强
    github_name: zhongzhouqiang
---

开发过程中，难免会遇到一些执行不合预期的场景，也许加载延迟、运行延迟......等等知道或不知道的原因的情况，但一时半会儿又没有解决方案时，你可能会心存希望的加上个setTimeout试试，而且还“神奇”地发现问题消失了。。。
但setTimeout真的解决问题了吗？
因为web终端环境、网络状态等都是不一样的，也许你看到的是好的，用户看到的就可能是另一回事咯。

## 如何确认setTimeout是否能够解决
确认setTimeout是否能够解决问题，无非就是确认其的执行时机，是否总是能够按照预期的去执行。
```javascript
setTimeout(() => console.log('A'), 0)

console.log('B')

// console 输出：
// B
// A
```
如上的输出，A总是在B之前，但上面设置的延时是零，这是为什么呢？
主要原因是跟js本身的事件循环执行机制(Event Loop)有关，另外setTimeout不同浏览器存在不同计时器最小延迟精度（Chrome为4ms）而非0ms就能执行

## 浏览器环境的Event Loop
javascript的运行是单线程的，所以所有的运行都是串行的，但一些io等异步任务并非js本身执行，如果选择等待的话就会造成堵塞，所以js采用了Event Loop的事件循环执行机制去解决这些问题，即主线程+各种任务的方式：

- 主线程调用栈（call stack）
- 宏任务（macroTask）
- 微任务（microTask）

![Event_Loop](https://i.loli.net/2019/07/11/5d26a2e6b1df237278.jpg)

> **小结**：
> 在一次Event Loop中，每当执行完同步任务（不占用主线程调用栈），就会执行微任务且直至微任务队列清空；进而才从宏任务队列取第一个宏任务进入下一次的Event Loop

依照上图的执行顺序，可以对下面代码执行分析：

```javascript
// setTimeout1
setTimeout(function onSetTimeout1() {
    console.log('A')
}, 0)
// promise1
new Promise(resolve => {
    console.log('B')
    resolve()
}).then(function onPromise1() {
    console.log('C')
})
// setTimeout2
setTimeout(function onSetTimeout2() {
    console.log('D')
    // promise2
    new Promise(resolve => {
        console.log('E')
        resolve()
    }).then(function onPromise2() {
        console.log('F')
    })
}, 0)

console.log('G')
```

- 执行setTimeout1，并交由浏览器计时处理（将在满足计时条件时，会被作为一个宏任务[onSetTimeout1]进入宏任务队列）
- 执行promise1，输出**B**，并由resolve触发then回调作为一个微任务[onPromise1]进入微任务队列
- 执行setTimeout2，并交由浏览器计时处理（将在满足计时条件时，会被作为一个宏任务[onSetTimeout2]进入宏任务队列）
- 执行console.log('G')，输出**G**，到此同步任务执行完毕
- 进入清空微任务执行，故执行onPromise1，输出**C**，微任务已清空
- 进入新一轮Event Loop，执行宏任务队列第一个宏任务onSetTimeout1，输出**A**，到此同步任务执行完毕
- 无微任务，即微任务已清空
- 进入新一轮Event Loop，执行宏任务队列第一个宏任务onSetTimeout2，输出**D**
- 执行promise2，输出**E**，并由resolve触发then回调作为一个微任务[onPromise2]进入微任务队列
- 进入清空微任务执行，故执行onPromise2，输出**F**，微任务已清空

## nodejs环境的Event Loop
nodejs环境的Event Loop跟浏览器的是两个概念，其是通过libuv库来实现的，整体为6个阶段：
- **timers**：此阶段执行由setTimeout()和setInterval()到期的回调。
- **pending callbacks**：执行由上一轮延迟到本轮循环的I/O回调。
- **idle,prepare**：仅在内部使用。
- **poll**：检索新的I/O事件; 执行与I/O相关的回调（除了close callbacks、timers回调、setImmediate()回调）; 节点将在适当时阻止此处。
- **check**：setImmediate()在这里调用回调。
- **close callbacks**：一些close回调，例如socket.on('close', ...)。

```
   ┌───────────────────────────┐
┌─>│           timers          │
│  └─────────────┬─────────────┘
│  ┌─────────────┴─────────────┐
│  │     pending callbacks     │
│  └─────────────┬─────────────┘
│  ┌─────────────┴─────────────┐
│  │       idle, prepare       │
│  └─────────────┬─────────────┘      ┌───────────────┐
│  ┌─────────────┴─────────────┐      │   incoming:   │
│  │           poll            │<─────┤  connections, │
│  └─────────────┬─────────────┘      │   data, etc.  │
│  ┌─────────────┴─────────────┐      └───────────────┘
│  │           check           │
│  └─────────────┬─────────────┘
│  ┌─────────────┴─────────────┐
└──┤      close callbacks      │
   └───────────────────────────┘
```

> **小结**：
> 以上为nodejs每次Event Loop都将经过这6个阶段；每个阶段都有相应的任务队列，且执行阶段时只有队列清空或达到回调上限才会进入下一个阶段；另还有两个在阶段之外的：
> - nextTickQueue（process.nextTick）：在每个阶段执行完之后执行该队列，直至清空或达到回调上限
> - microTaskQueue（promise等）：当nextTickQueue执行完之后会执行该队列
> - 当以上两个队列执行完，才进入下一个阶段执行

## setTimeout(fn, 0)

setTimeout的回调最快进入任务队列是由执行环境最小延迟精度决定的，正常情况下执行环境是做不到0ms的，所以push到macTaskQueue或timers任务队列的时候已经 > 0ms；另外如果主线程调用栈一直处于占用中的话，已经在回调队列中的任务也是需要一直处于等待的，并非能在计时结束就能够立即执行的

## setTimeout(fn, 0)与setImmediate
从Event Loop可知setTimeout回调是在timers阶段执行的，而setImmediate是在check阶段执行的，故setTimeout(fn, 0)与setImmediate的执行时机取决于push setTimeout回调时，当前是执行在哪个阶段，如下情况可以了解一下：
- 当push setTimeout回调不确定时
```javascript
setTimeout(() => console.log('setTimeout'), 0)
setImmediate(() => console.log('setImmediate'))

// console 输出：
// setTimeout
// setImmediate
// 当执行环境在接近于0就push setTimeout回调到timers队列，且timers阶段未执行时

// or

// setImmediate
// setTimeout
// 当执行环境在timers阶段已执行，才push setTimeout回调到timers队列时
```

- 当push setTimeout回调确定在timers阶段未执行时

```javascript
setTimeout(() => console.log('setTimeout'), 0)
setImmediate(() => console.log('setImmediate'))
const startTime = Date.now()
while (Date.now() - startTime < 200) {
  // 占用主线程中
}

// console 输出：
// setTimeout
// setImmediate

// 主线程一直占用中，即在timers阶段执行前，已push setTimeout回调到timers队列，故setTimeout先于setImmediate输出
```

- 当push setTimeout回调确定在timers阶段已执行时

```javascript
const fs = require('fs')
fs.readFile('./test', () => {
  setTimeout(() => console.log('setTimeout'), 0)
  setImmediate(() => console.log('setImmediate'))
})

// console 输出：
// setImmediate
// setTimeout

// 新的I/O回调在poll阶段中进行，执行完进入check阶段，故setImmediate先于setTimeout输出
```
## 最后该不该用setTimeout
当然一些特殊的场景通过setTimeout执行时机，还是可以解决一些问题的；但能不用时一定不要用，比如因为网络延迟，应该选择去相应加载完成时处理执行，而不应该用setTimeout解决；同理应该找到问题的根本，而不是盲目地用setTimeout。![Uploading Event_Loop.jpg… (9120qwevz)]()

毕竟setTimeout一时爽，一直setTimeout并非一直爽；而且还有一个很严重的问题，就是维护性比较差，毕竟谁也不会愿意去维护满满setTimeout的代码

## 参考文章
- [图解搞懂JavaScript引擎Event Loop](https://juejin.im/post/5a6309f76fb9a01cab2858b1)
- [Event Loop的规范和实现](https://juejin.im/post/5a6155126fb9a01cb64edb45#heading-7)
- [这一次，彻底弄懂 JavaScript 执行机制](https://juejin.im/post/59e85eebf265da430d571f89)
- [JavaScript 运行机制详解：再谈Event Loop](http://www.ruanyifeng.com/blog/2014/10/event-loop.html)
- [The Node.js Event Loop, Timers, and process.nextTick()](https://nodejs.org/en/docs/guides/event-loop-timers-and-nexttick/)
- [Node 定时器详解](http://www.ruanyifeng.com/blog/2018/02/node-event-loop.html)
- [Understanding setImmediate()](https://flaviocopes.com/node-setimmediate/)
- [不要混淆nodejs和浏览器中的event loop](https://cnodejs.org/topic/5a9108d78d6e16e56bb80882)