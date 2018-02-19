const plugin = require('./protoc-plugin')
const util = require('util')
const fs = require('fs')

const config = [
    {tpl_path:"go_msg.tpl", out_name:"msg.go"},
    // {tpl_path:"go_handler.tpl", out_name:"handler.go"},
    {tpl_path:"csharp_msg.tpl", out_name:"ProtoDic.cs"}
]

const msgid_path = './msgid.json'

// gen msgid
plugin(protos => { 
    var messages = new Array() 
    protos.forEach(proto => {
        proto.messageTypeList.forEach((message, m) => {
            // console.error('msg', message.name)
            name = message.name
            if (name.endsWith('Req') || name.endsWith('Rsp') || name.endsWith('Msg')) {
                file = proto.name.substring(0, proto.name.indexOf('.proto'))
                // console.error("proto.name", proto.name, file)                          
                messages.push({"file":file,"msg":message, "name":name, "id":0})
            }    
        })
    });

    loadMsgId(messages)
    saveMsgId(messages)

    var results = new Array()
    config.forEach((cfg)=> {
        build(results, messages, "./template/"+cfg.tpl_path, cfg.out_name)
    })

    return results
})

function loadMsgId(messages) {
    var maxid = 0
    if (fs.existsSync(msgid_path)) {
        msgidMap = require(msgid_path)
        messages.forEach((msg)=> {
            msgid = msgidMap[msg.name]
            // console.log(typeof(msgid))
            if (msgid != undefined) {
                msg.id = msgid
                if (msgid > maxid) {
                    maxid = msgid
                }
            }
        })
    }

    messages.forEach((msg)=>{
        if (msg.id == 0) {
            maxid++
            msg.id = maxid
        }
    })

    // 排序
    messages.sort((a, b)=>{
        return a.id - b.id
    })
}

function saveMsgId(messages) {
    // to obj
    var obj = new Object()
    messages.forEach((msg)=>{
        obj[msg.name] = msg.id
    })

    // save file
    var data =  JSON.stringify(obj, null, 4)
    fs.writeFile(msgid_path, data, (err)=>{
        if (err) {
            console.error("write msgid to file fail!")
        }
    })
}

/**
 * TODO: filter prefix or suffix 
 * parse template and gen code
 * @param {Array} results 
 * @param {Array} messages 
 * @param {string} tpl_path 
 * @param {string} out_name 
 * @param {function (msg)bool} filter_cb,过滤消息，只有返回true的才生成
 */
function build(results, messages, tpl_path, out_name, filter_cb) {
    // example:"./template/go_msg.tpl"
    text = fs.readFileSync(tpl_path).toString()
    if(text == null) {
        console.error("can open template:", tpl_path)
        return
    }

    tpl = genTemplate(text)
    if(text == null) {
        return
    }

    // gen code
    const formatter = tpl.format
    const last_index = messages.length - 1

    var code = ""
    if(filter_cb != undefined && filter_cb != null) {
        messages.forEach((msg, index)=> {
            if(filter_cb(msg)) {
                code += formatter.format(msg) + "\n"
            }
        })
    } else {
        messages.forEach((msg, index)=> {
            code += formatter.format(msg) + "\n"
        })
    }

    //
    var data = ""
    data = tpl.prefix + code + tpl.suffix
    results.push({
        name : out_name,
        content: data
    })
}

/**
 * parse template:
 * example <code>register({id}, &{msg})</code>
 * return format: { prefix:"aaa", suffix:"bbb", format:"register({id}, &{msg})" }
 * @param {string} text 
 */
function genTemplate(text) {
    const tag_beg = "<code>"
    const tag_end = "</code>"

    tag_beg_pos = text.indexOf(tag_beg)
    if (tag_beg_pos == -1) {
        return null
    }

    tag_end_pos = text.indexOf(tag_end, tag_beg_pos)
    if (tag_end_pos == -1) {
        return null
    }

    // find line begin
    line_beg = 0
    for(i = tag_beg_pos - 1; i >=0; i--) {
        ch = text.charAt(i)
        if (ch == '\n') {
            line_beg = i + 1
            break
        }
    }

    // find line end
    line_end = text.length
    for(i = tag_end_pos + tag_end.length; i < text.length; i++) {
        ch = text.charAt(i)
        if(ch == '\n') {
            line_end = i;
            break;
        }
    }

    space  = text.substring(line_beg, tag_beg_pos)
    prefix = text.substring(0, line_beg)
    suffix = text.substring(line_end + 1)
    format = space + text.substring(tag_beg_pos + tag_beg.length, tag_end_pos)

    return {prefix:prefix, suffix:suffix, format:format}
}

/**
 * string format like csharp
 * example:
 *  var template1="我是{0}，今年{1}了";
 *  var template2="我是{name}，今年{age}了";
 *  var result1=template1.format("loogn",22);
 *  var result2=template2.format({name:"loogn",age:22});
 *  //两个结果都是"我是loogn，今年22了"
 * @param {*} args 
 */
String.prototype.format = function(args) {
    var result = this;
    if (arguments.length > 0) {    
        if (arguments.length == 1 && typeof (args) == "object") {
            for (var key in args) {
                if(args[key]!=undefined){
                    var reg = new RegExp("({" + key + "})", "g");
                    result = result.replace(reg, args[key]);
                }
            }
        }
        else {
            for (var i = 0; i < arguments.length; i++) {
                if (arguments[i] != undefined) {
                    //var reg = new RegExp("({[" + i + "]})", "g");//这个在索引大于9时会有问题，谢谢何以笙箫的指出
　　　　　　　　　　　　var reg= new RegExp("({)" + i + "(})", "g");
                    result = result.replace(reg, arguments[i]);
                }
            }
        }
    }
    return result;
}
