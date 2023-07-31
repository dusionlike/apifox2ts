# apifox2ts

## 介绍

apifox2ts 可以将 apifox 的数据自动生成具有类型定义的请求代码，灵感来自[Rapper](https://github.com/thx/rapper)

> 理论上符合 OpenAPI 规范的数据都可以使用

- 让后端写好接口文档，咱自动生成类型定义、注释和请求代码
- 一键同步apifox的数据，减少跟后端撕逼
- 可以自定义请求函数，满足各种奇葩后端写的接口
- 自带mock模拟请求，这个是apifox的功能，这里提一嘴是让你不要忘了用这个功能

## 使用方法

### 安装

```bash
npm i apifox2ts
```

### 配置

在项目根据目录下创建 apifox2ts.config.ts

```ts
import { defineConfig } from 'apifox2ts'

export default defineConfig({
  sourceURL:
    'http://127.0.0.1:4523/export/openapi?projectId=3081874&specialPurpose=openapi-generator',
})
```

- `sourceURL` 可以是本地路径，也可以是http地址，在apifox的`项目概览`=>`代码生成`=>`OpenAPI 格式 URL` 复制那个地址
- `destDir` 生成代码的路径，默认为 `src/api`
- `name` 生成代码的文件名，默认为 `index`，当配置为数组时，`name` 为必填

### 使用

在package.json中添加脚本

```json
{
  "scripts": {
    "gen": "apifox2ts"
  }
}
```

执行 `npm run gen` 即可

## 自定义请求函数

在所有请求发出之前（main.ts），调用 `overrideFetch` 方法，可以自定义请求函数，例如使用 axios

```ts
import { overrideFetch } from 'apifox2ts'
import Axios from 'axios'

overrideFetch(async ({ url, method, params }) => {
    const response = await Axios.request({ method, url, ...(method === 'GET' ? { params } : { data: params }) })
    return response.data;
});
```
