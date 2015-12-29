Alex-proxy is an HTTP proxy / HTTP monitor base on and inspiring by [TooTallNate/proxy](https://github.com/TooTallNate/proxy)

# Features
 
 * Http server proxy base on [TooTallNate/proxy](https://github.com/TooTallNate/proxy)
 * Provide web base http monitor, enables a developer to view all of the HTTP traffic between their machine and the Internet
 * Provide Body and header viewer so far, more functions are on processing
 * You can sharing your http traffic to others
 * Or you can bind your ip to others by typing the ip or scanning the qrcode
 
# Usages

 * Assume you have install bower, if not install first `npm install bower -g`
 * `git clone https://github.com/hcnode/alex-proxy`
 * `cd alex-proxy`
 * `npm install`
 * `vi ./config/default.json` edit hostname to your server's ip or hostname 
 * `npm start`
 * set pc/device's proxy with server-ip:8008
 * visit http://server-ip:8008 to view the local http traffic
 * visit http://server-ip:8008?ip=other_device_ip to view the particular device's traffic by binding ip
 
# Binding ip
 
 there are two ways to bind other ip to your pc/device, then the binded ip's pc can view your pc/device's http traffic
 
 * visit http://server-ip:8008 in your pc/device which you want to bind, click "管理ip绑定", type the ip you want to bind in the input, then enter.
 * visit http://server-ip:8008 in your pc/device which you want to be binded, click "显示二维码", then use the binded pc/device to scan the qrcode
 
# Screenshots 

![screenshot1](https://raw.githubusercontent.com/hcnode/alex-proxy/master/screenshot/screenshot1.png)
![screenshot2](https://raw.githubusercontent.com/hcnode/alex-proxy/master/screenshot/screenshot2.png)
![screenshot3](https://raw.githubusercontent.com/hcnode/alex-proxy/master/screenshot/screenshot3.png)
