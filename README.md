# nodejs-coverage-lib

本项目是针对nodejs后台项目，实时生成覆盖率报告使用


### 安装

```
npm i nodejs-coverage-lib --save
```



### 使用
1. 在项目的入口文件中添加
```
require('nodejs-coverage-lib')
```

2. 添加新的依赖项

```
npm i nyc --save
```
这个是为了能够通过nyc来启动node的入口文件

3. 在package.json启动脚本中增加nyc的启动方式

```
"scripts": {
    "start": "node index.js",
    "cov": "nyc node index.js"
},
```
如上述，原先的启动命令是 ```node index.js```, 新的则为 ```nyc node index.js```

4. 在项目的package.json中添加如下的内容

```
"nyc": {
    "parser-plugins": [
      "typescript",
      "jsx",
      "asyncGenerators",
      "bigInt",
      "classProperties",
      "classPrivateProperties",
      "dynamicImport",
      "importMeta",
      "objectRestSpread",
      "optionalCatchBinding",
      "decorators-legacy"
    ],
    "all": true,
    "compact": false,
    "reporter": [
      "html"
    ]
}
```




### 注意
该覆盖率工具会额外监听8787的端口，若想要与自定义端口可直接在启动服务的命令后面添加 --port  xxx进行修改


完成测试以后，即可通过访问xx.xx.xx.xx:8787/download 进行下载覆盖率文件