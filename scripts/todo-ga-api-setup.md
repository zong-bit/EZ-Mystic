# TODO: Google Analytics Data API 自动流量监控

## 状态
- [ ] 在 Google Cloud Console 创建服务账户
- [ ] 启用 Google Analytics Data API
- [ ] 创建服务账户密钥（JSON 文件）
- [ ] 在 Google Analytics 中将该服务账户添加为数据访问者
- [ ] 将密钥保存到项目中的安全位置
- [ ] 编写自动拉取流量数据的脚本

## 配置信息
- **GA Measurement ID**: `G-BKXH2XKRMJ`
- **GSC 验证文件**: `iZdsDRFA8lc9MPxrgudfQKuLKwrnDijPuuuBbEkILE4`
- **项目地址**: https://bornchart.app

## 目标
- 自动获取页面浏览量、用户来源、热门文章等数据
- 建立定期流量报告机制
- 基于数据指导内容优化

## 注意事项
- 所有外部网络请求必须走代理 `http://127.0.0.1:7897`
- 密钥文件需要妥善保管，不要提交到版本控制
