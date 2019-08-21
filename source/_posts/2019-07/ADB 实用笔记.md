---
title: ADB（安卓调试桥）实用笔记
subtitle: "这只是一篇笔记，如果想要了解详细内容，你应该看一手知识，也就是官方的文档，如果你只是想要简单了解，可以看这篇。"
date: 2019-07-10 21:04:08
cover: https://img11.360buyimg.com/jdphoto/s2730x1280_jfs/t1/39534/17/12191/369823/5d36b6f3Ef3b96645/965fce5c15488678.jpg
tags: ADB
categories: ADB
ckey: 18
author:
    nick: 谢志强
    github_name: xiezhiqiang9
---


这只是一篇笔记，如果想要了解详细内容，你应该看一手知识，也就是官方的文档，如果你只是想要简单了解，可以看这篇。


ADB 全称 [Android Debug Bridge](https://developer.android.com/studio/command-line/adb.html)，即安卓调试桥，通过 ADB 能够与模拟器实例或者是连接的安卓设备进行通信，可以通过它来调试安卓应用，做应用的自动化测试，搭建云测试平台等。

## 安装

```bash
brew cask install android-platform-tools
```

通过 USB 连接手机，打开手机的开发者选项（允许通过 USB 调试、通过 USB 安装应用），使用 `adb devices` 可以查看连接的设备

![](https://camo.githubusercontent.com/eba394d45c0f9994b849bd071f75b18ed148b078/68747470733a2f2f757365722d676f6c642d63646e2e786974752e696f2f323031392f372f392f313662643632613064373037333439633f773d34373626683d31313626663d706e6726733d3336333133)

输出格式为 [serialNumber] [state]，serialNumber 就是序列号，state 有如下几种：

offline —— 表示设备未连接成功或无响应。

device —— 设备已连接。注意这个状态并不能标识 Android 系统已经完全启动和可操作，在设备启动过程中设备实例就可连接到 adb，但启动完毕后系统才处于可操作状态。

no device —— 没有设备/模拟器连接。

加上 `-l` 参数可以看到具体的设备信息：

![](https://camo.githubusercontent.com/f10097b1d2ef5d9840e81bbaa0c8465b0dfb93a0/68747470733a2f2f757365722d676f6c642d63646e2e786974752e696f2f323031392f372f31302f313662643738336437636133626135363f773d37363926683d373026663d706e6726733d3136353737)



使用 `adb help` 查看帮助

![](https://camo.githubusercontent.com/be48de1179440f728faee12443a41c5c8bb6673d/68747470733a2f2f757365722d676f6c642d63646e2e786974752e696f2f323031392f372f31302f313662643737623531613931323361613f773d35353926683d33343326663d706e6726733d3530313034)

## 命令语法
与其他工具的命令行类似，ADB 命令有相应的 options，从上面的 `adb help` 中可以看到对应的全局 options ，最常用的 options 就是 `-s` 也就是在多设备连接的时候使用指定序列号的设备。大致命令格式可以总结为：

```bash
adb [-d|-e|-s <serialNumber>] <command>
```

## 查看应用

查看设备安装的应用
```bash
adb shell pm list packages
```

![](https://camo.githubusercontent.com/9e5aebad961dbf244b9d143e16aee79009900ec6/68747470733a2f2f757365722d676f6c642d63646e2e786974752e696f2f323031392f372f31302f313662643738623338303334653638643f773d35353626683d34363726663d706e6726733d3633303236)

其中 `pm` 是 `package manager` 的缩写，`abd shell` 自然就是运行设备的终端 shell 的意思，因为 `android` 本身就是基于 `unix` 的。

可以通过参数来过滤，如 '-3' 为只显示第三方应用，`-s` 为只显示系统应用，同样也可以通过管道和 `grep` 来过滤，如我想知道设备中安装了哪些腾讯的应用软件：
```bash
adb shell pm list packages | grep tencent
```

![](https://camo.githubusercontent.com/7c45d0ec68f9b357386b15a6fa8861adc5e4e8b3/68747470733a2f2f757365722d676f6c642d63646e2e786974752e696f2f323031392f372f31302f313662643739323161393339613436653f773d35323326683d31323126663d706e6726733d3137373032)

可以看到安装的腾讯应用程序有 qq音乐（com.tencent.qqmusic）、qq邮箱（com.tencent.androidqqmail）、微信（com.tencent.mm）、手机QQ（com.tencent.mobileqq）、和平精英（com.tencent.tmgp.pubgmhd），而 com.tencent.androidqqmail 是系统应用，暂时不知道是哪个。


## 安装应用

可以通过 ADB 给手机安装电脑上有的 apk ，如给手机装上微博：

```bash
adb install /Users/huruji/Downloads/weibo.apk
```
一段时间后终端显示 `success` 则表明安装成功。

![](https://camo.githubusercontent.com/513468e860a752b4e697ccbe72b99021629bbc4f/68747470733a2f2f757365722d676f6c642d63646e2e786974752e696f2f323031392f372f31302f313662643739643437653961396233643f773d35363126683d353326663d706e6726733d39323330)


## 卸载应用

类似于上面，使用 uninstall 命令加上包名即可，如卸载微博：

```bash
adb uninstall com.sina.weibo
```
一段时间后终端显示 `success` 则表明卸载成功。

## 查看应用安装路径

如查看微博的安装路径
```bash
adb shell pm path com.sina.weibo
```
![](https://camo.githubusercontent.com/aae0f54ea418c6dd19054cd9c971b204f22f5a7c/68747470733a2f2f757365722d676f6c642d63646e2e786974752e696f2f323031392f372f31302f313662643761323865313065623361383f773d35303526683d343626663d706e6726733d3130353435)


## 打开应用

打开应用需要知道对应的包名和 Activity 名，可以先通过命令获取启动页，如获取微信的启动页：

```bash
adb shell dumpsys window windows | grep "Current"
```
![](https://camo.githubusercontent.com/7e6f797b6582e5e956025488caf26f4dd57aa06f/68747470733a2f2f757365722d676f6c642d63646e2e786974752e696f2f323031392f372f31302f313662643761623463363931616164383f773d37363526683d383526663d706e6726733d3231303636)

获取到包名和 Activity 名是 `com.tencent.mm/com.tencent.mm.ui.LauncherUI`，使用 `adb shell am start` 命令打开

```bash
adb shell am start com.tencent.mm/com.tencent.mm.ui.LauncherUI
```
其中 am 是 `Activity Manager` 的缩写

眼睛盯着手机就可以看到手机 “自动” 打开了微信（这个不好记录演示，得自己尝试）


## 退出应用

如退出微信：
```bash
adb shell am force-stop com.tencent.mm
```

## 复制文件

将电脑的文件复制到设备上成为 `push` ，将设备上的文件复制到电脑上成为 `pull`

```bash
adb pull <设备里的文件路径> [电脑上的目录]
```

```bash
adb push <电脑上的文件路径> <设备里的目录>
```

## 模拟按键、输入

通过输入 `adb shell input` 可以看到对应的提示：

![](https://camo.githubusercontent.com/9359699099212f9211ee87be5a193b16bd44c216/68747470733a2f2f757365722d676f6c642d63646e2e786974752e696f2f323031392f372f31302f313662643964363531376162616633613f773d35383326683d34313726663d706e6726733d3439323937)


输入文字就是
```bash
adb shell input text
```

模拟按键就是
```bash
adb shell input keyevent
```

模拟点击就是
```bash
adb shell input tap
```

模拟滑动就是
```bash
adb shell input swipe
```

比较需要记忆的就是按键的keycode，截取 awesome adb 的总结：


![](https://camo.githubusercontent.com/f2351a3396dee6f799041f8e6c186f8934520d5b/68747470733a2f2f757365722d676f6c642d63646e2e786974752e696f2f323031392f372f31302f313662643964636263633264663530313f773d33393926683d38313926663d706e6726733d3737313834)


![](https://camo.githubusercontent.com/dc03e847d93b0bf6a19eac11ea499380148d25f2/68747470733a2f2f757365722d676f6c642d63646e2e786974752e696f2f323031392f372f31302f313662643964643464393235666330373f773d34313026683d34323026663d706e6726733d3432313031)

还有就是 swipe 的坐标对应的是真实的屏幕分辨率，比如，我想让手机在抖音应用里自动切换视频就可以使用swipe：
```bash
adb shell input swipe 250 1000 250 100
```


![](https://camo.githubusercontent.com/c2f1d8d2b907d4ca605a467c52e759ac7facbeae/68747470733a2f2f757365722d676f6c642d63646e2e786974752e696f2f323031392f372f31302f313662646130313266613064393165643f773d33323026683d35363426663d67696626733d33383938353033)


## 窗口管理

窗口管理的命令是 `wm`，是 `window manager` 的缩写

如上面提到的需要获取到屏幕的分辨率：

```bash
adb shell wm size
```
![](https://camo.githubusercontent.com/d1bd3efec982eaf7312cdc0c2e03898ad6d65d9f/68747470733a2f2f757365722d676f6c642d63646e2e786974752e696f2f323031392f372f31302f313662646138353435386531613039303f773d33353226683d333426663d706e6726733d35323430)

也可以通过这个命令修改窗口分辨率，如：
```bash
adb shell wm size 720x1280
```
![](https://camo.githubusercontent.com/f0b9f8d7c2c87bcdd7ae9e5c7b6741d72ca6adc5/68747470733a2f2f757365722d676f6c642d63646e2e786974752e696f2f323031392f372f31302f313662646330376163666366653636383f773d38313226683d3134333026663d6a70656726733d323130363338)
同样可以通过 reset 还原回来
```bash
adb shell wm size reset
```

获取密度
```bash
adb shell wm density
```

同样可以修改和重置
```bash
adb shell wm density 500
```

```bash
adb shell wm density reset
```

设置内边距
```bash
adb shell wm overscan 50,100,0,200
```
![](https://camo.githubusercontent.com/f37b4901a96df1521f8de47c354d1299bfb36c96/68747470733a2f2f757365722d676f6c642d63646e2e786974752e696f2f323031392f372f31302f313662646330373862336565313038643f773d38303626683d3134323026663d6a70656726733d323732353037)
重置
```bash
adb shell wm overscan reset
```

## 设备信息

### 获取手机型号
```bash
adb shell getprop ro.product.model
```
![](https://camo.githubusercontent.com/ec8d973a82df8cba4cf4423ad4063eb86c40658e/68747470733a2f2f757365722d676f6c642d63646e2e786974752e696f2f323031392f372f31302f313662646162376233383430636530653f773d34353726683d333926663d706e6726733d35323234)

### 获取电池状况
```bash
adb shell dumpsys battery
```
![](https://camo.githubusercontent.com/8bbe2a2a52d846d066ff08ec201996f70fb91267/68747470733a2f2f757365722d676f6c642d63646e2e786974752e696f2f323031392f372f31302f313662646162396261396339363461343f773d34353926683d32373426663d706e6726733d3235393037)

`scale` 表示最大电量，level 表示当前电量。



### 获取 Android 版本

```bash
adb shell getprop ro.build.version.release
```
![](https://camo.githubusercontent.com/48c53e58f6393b9b724f6f9e54aa060c3188c04b/68747470733a2f2f757365722d676f6c642d63646e2e786974752e696f2f323031392f372f31302f313662646162633263323230633866303f773d35323026683d343126663d706e6726733d35333430)

还有其他的信息也可以通过 `getprop` 命令获取：
![](https://camo.githubusercontent.com/e138e8dd09f1cb053242222e3af5789f76d48ee1/68747470733a2f2f757365722d676f6c642d63646e2e786974752e696f2f323031392f372f31302f313662646163313837653765316538323f773d35323126683d34353226663d706e6726733d3639333734)

### 获取设备 IP 地址
```bash
adb shell ifconfig | grep Mask
```

![](https://camo.githubusercontent.com/3adf4384a3374b4fcb4843f9d8769cf99b68c312/68747470733a2f2f757365722d676f6c642d63646e2e786974752e696f2f323031392f372f31302f313662646162653434343436376236393f773d34393626683d353926663d706e6726733d3130333138)

设备的 IP 地址就是 `10.159.100.193`


## 截屏和录屏

### 截屏

截屏可以将文件存在设备里也可以导出到电脑，如导出到电脑：
```bash
adb shell screencap -p > /Users/huruji/Downloads/cap/a.png
```
`-p` 的意思就是存储为 png 格式，`>` 表示存储在电脑里，如果去掉 `>` 将路径换成设备的路径就是存储在设备里。


### 录屏

录屏保存在设备内，如果需要导出到电脑端可以使用之前提到的 `pull` 命令，录屏默认最长时间是180s：
```bash
shell screenrecord /sdcard/b.mp4
```

将文件导出
```bash
adb shell pull /sdcard/b.mp4
```

需要注意的是导出到的是当前文件夹，所以如果需要指定对应的文件夹，需要先 `cd` 到对应文件夹。


以上大概就是常用的操作，如果你需要通过代码控制的话就需要封装相应的包，毕竟裸着拼接字符串很难受，我大概在 npm 上搜索了一下，目前这类包相对较少，比较流行的就是[appium-adb](https://www.npmjs.com/package/appium-adb)，而这个也是服务于项目[https://github.com/appium/appium](https://github.com/appium/appium)

呼应下开头，开头提到的 ADB 用于云测试平台，目前我知道的开源的有[stf](https://github.com/openstf/stf) 和阿里开源的[macaca](https://github.com/macacajs)


如果你对于 ADB 有实践，求求你告诉我呀~

手动贴下个人博客的地址 [https://github.com/huruji/blog](https://github.com/huruji/blog)