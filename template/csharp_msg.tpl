// This file is generated automatically, DO NOT modify it manually!!! 
using Google.Protobuf;
using Msg;
using System;
using System.Collections.Generic;

namespace Proto
{
    public class ProtoDic
    {
        static bool _init = false;
        static Dictionary<RuntimeTypeHandle, MessageParser> _parsers = new Dictionary<RuntimeTypeHandle, MessageParser>();
        static Dictionary<Type, int> _type2protoid = new Dictionary<Type, int>();
        static Dictionary<int, Type> _protoid2type = new Dictionary<int, Type>();

        public static void Setup()
        {
            if(_init) {
                return;
            }
            _init = true;

            <code>register<{name}}>({id}, {name}.Parser);</code>
        }

        public static MessageParser GetMessageParser(RuntimeTypeHandle typeHandle)
        {
            MessageParser messageParser;
            _parsers.TryGetValue(typeHandle, out messageParser);
            return messageParser;
        }

        public static Type GetProtoTypeByProtoId(int protoId)
        {
            return _protoid2type[protoId];
        }

        public static int GetProtoIdByProtoType(Type type)
        {
            return _type2protoid[type];
        }

        public static bool ContainProtoId(int protoId)
        {
            return _protoid2type.ContainsKey(protoId);
        }

        public static bool ContainProtoType(Type type)
        {
            return _type2protoid.ContainsKey(type);
        }

        private static void register<T>(int msgid, MessageParser parser) where T : Google.Protobuf.IMessage
        {
            Type type = typeof(T);
            int msgid_i = (int)msgid;
            _parsers[type.TypeHandle] = parser;
            _type2protoid[type] = msgid_i;
            _protoid2type[msgid_i] = type;
        }
    }
}