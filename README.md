# tool-proto-gen

- 代码原出处:https://github.com/konsumer/node-protoc-plugin,在此基础上，做了一些调整，删除了一些依赖
- 可方便快速的实现protobuf插件，主要作用：将proto的message自动生成msgid和handler，以及自动注册
- protoc-puglin.js 核心类库，封装google-protobuf为promise方便调用
- protoc-gen-fairy是一个简单的例子，需要根据实际的项目进行调整

## 依赖 

- google-protobuf：核心依赖
- buffer-to-uint8array:将buffer转化为uint8array
- get-stream:将stdin转化为promise

## install

- 安装protoc 下载地址：https://github.com/google/protobuf/releases
- 安装node，并执行 npm install --save

## example

- 类unix系统
 ./protoc-gen.sh 和 protoc-gen-fairy需要有可执行权限,执行./protoc-gen.sh会在build目录下生产输出文件,然后可以拷贝到项目的工程目录中

- windows系统
 需要将sh转为bat，同时还需要增加一个bat用于用node执行protoc-gen-fairy

- 跨平台的方式:
 可参考bin的制作：https://www.zhihu.com/question/37491557

- 更多例子可参考:
 https://github.com/konsumer/node-protoc-plugin