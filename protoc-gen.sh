#!/bin/bash

mkdir -p ./build
rm -rf ./build/*

# test demo, not use
protoc --plugin=protoc-gen-fairy --fairy_out=csharp,go:./build -I=./protos ./protos/*.proto