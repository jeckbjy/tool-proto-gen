// This file is generated automatically, DO NOT modify it manually!!! 
package handler
import (
    "github.com/name5566/leaf/network/protobuf"
    "github.com/golang/protobuf/proto"
)

func register(m interface{}, h interface{}) {
    msg.Processor.SetRouter(m.(proto.Message), skeleton.ChanRPCServer)
    skeleton.RegisterChanRPC(reflect.TypeOf(m), h)
}

func init() {
    register(&EchoReq{}, onEchoReq)
    register(&EchoRsp{}, onEchoRsp)
}
