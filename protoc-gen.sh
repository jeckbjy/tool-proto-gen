#!/bin/bash

mkdir -p ./build
rm -rf ./build/*

# test demo, not use
protoc --plugin=protoc-gen-fairy --fairy_out=cs,go:./build -I=./protos ./protos/*.proto
# protoc --plugin=protoc-gen-fairy --fairy_out="type=cs,go;msgid=1000":./build -I=./protos ./protos/*.proto