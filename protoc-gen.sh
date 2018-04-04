#!/bin/bash

mkdir -p ./build
rm -rf ./build/*

./protoc --plugin=protoc-gen-fairy --fairy_out=lang=csharp,go:./build -I=./protos ./protos/*.proto