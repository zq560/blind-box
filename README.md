# 强哥的地盘

本项目包含简单的静态前端和一个示例 Node.js 后端来保存订单。

本地运行步骤：

```bash
# 安装依赖
npm install

# 启动服务器（默认端口 3000）
npm start

# 在浏览器打开前端
http://localhost:3000/index.html

# 后台查看订单
http://localhost:3000/admin.html
```

注意：当前支付为模拟，真实接入微信支付需要使用微信商户号与官方 SDK。

如果你想显示自己的商品图片，可以把图片文件放到项目根目录，命名为 `product.png` 或 `product.jpg`，然后把 `index.html` 中 `<img src="product.svg" ...>` 改成 `product.png` 或 `product.jpg`。

如果你想让支付二维码显示你自己的微信收款码：

- 把你的微信收款二维码图片放到项目根目录
- 命名为 `wechat-qr.png` 或 `wechat-qr.jpg`
- 然后把 `index.html` 中的 `<img src="wechat-qr.svg" ...>` 改成你的二维码文件名

当前页面会在“提交订单”后显示扫码支付二维码。
