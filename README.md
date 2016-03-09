Alex-proxy 是一个基于 [TooTallNate/proxy](https://github.com/TooTallNate/proxy) 的node.js的http代理服务器，在它的基础上实现了移动设备的http代理、监控、劫持.

# Features
 
 * http代理服务器
 * http请求监控
 * http请求劫持，自定义返回body和header，并可以进行劫持管理
 * 可以实现数据分享
 * 通过移动设备和PC的二维码绑定方式，实现监控和劫持的权限
 
# Usages

 * 如果没有安装过bower先安装 `npm install bower -g`
 * `git clone https://github.com/hcnode/alex-proxy`
 * `cd alex-proxy`
 * `npm install`
 * `npm start`
 * 将手机网络连接和PC同一个内网
 * 设置手机网络http代理服务器：server-ip:8008
 * PC访问http://server-ip:8008/
 * 使用该手机扫描右边的二维码从而PC获取该设备http监控权限
 * 此页面可自动显示该手机的http请求数据
 
# Screenshots 

![screenshot1](https://raw.githubusercontent.com/hcnode/alex-proxy/master/screenshot/screenshot1.png)
![screenshot2](https://raw.githubusercontent.com/hcnode/alex-proxy/master/screenshot/screenshot2.png)
![screenshot3](https://raw.githubusercontent.com/hcnode/alex-proxy/master/screenshot/screenshot3.png)
![screenshot4](https://raw.githubusercontent.com/hcnode/alex-proxy/master/screenshot/screenshot4.png)
