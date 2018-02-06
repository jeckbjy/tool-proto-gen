#!/bin/bash

mkdir -p ./build

./protoc --plugin=protoc-gen-fairy --fairy_out=./build -I=./protos ./protos/*.proto