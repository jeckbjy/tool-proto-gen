const plugin = require('./protoc-plugin')
const conf = require('./protoc-conf')
const util = require('util')
const path = require('path')
const fs = require('fs')
const template = require('art-template')

// gen msgid
plugin(req => { 
    parseOptions(req.parameter)
    findMessages(req)
    buildId(req)

    return buildMessages(req)
})

// 解析参数
function parseOptions(options) {
    // find ./proto_conf.js
    if(fs.existsSync("./proto_conf.js")) {
        temp_conf = require("./proto_conf.js")
        deepCopy(conf, temp_conf)
    }

    // parse options,example:csharp,go,js
    if (options != "") {
        tokens = options.split(',').filter(String)
        tokens.forEach((type)=>{
            if (conf.output.indexOf(type) == -1) {
                conf.output.push(type)
            }
        })
    }
}

function findMessages(req) {
    var files = new Array()
    var messages = new Array()
    req.protos.forEach(proto => {
        file = proto.name.slice(0, -6)
        files.push(file)
        // console.error(file)
        proto.messageTypeList.forEach((message, m) => {
            name = message.name
            if (name.endsWith('Req') || name.endsWith('Rsp') || name.endsWith('Msg')) {
                messages.push({"file":file,"msg":message, "name":name, "id":0})
            }    
        })
    });

    req.files = files
    req.messages = messages
}

function loadMsgId(messages, msgid_path) {
    var maxid = 0
    if (msgid_path != "" && fs.existsSync(msgid_path)) {
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

function saveMsgId(messages, msgid_path) {
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
 * 构建唯一消息id
 * @param {*} req 
 */
function buildId(req) {
    var messages = req.messages
    if (conf.msgid_open) {
        loadMsgId(messages, conf.msgid_path)
        saveMsgId(messages, conf.msgid_path)
    } else {
        loadMsgId(messages, "")
    }
}

/**
 * 构建消息
 * @param {*} options 
 * @param {*} messages 
 */
function buildMessages(req) {
    
    var results = new Array()

    conf.output.forEach((type)=> {
        lang = conf.langs[type]
        if(lang != undefined) {
            build(results, req, getTemplatePath(lang.tpl), lang.out)
        }
    })

    return results
}

/**
 * TODO: filter prefix or suffix 
 * parse template and gen code
 * @param {Array} results 
 * @param {Array} messages 
 * @param {string} tpl_path 
 * @param {string} out_name 
 * @param {function (msg)bool} filter_cb 过滤消息，只有返回true的才生成
 */
function build(results, req, tpl_path, out_name, filter_cb) {
    if(tpl_path == "") {
        return
    }

    // example:"./template/go_msg.tpl"
    source = fs.readFileSync(tpl_path, 'utf-8')
    if(source == null) {
        console.error("can open template:", tpl_path)
        return
    }

    // do filter??
    if(filter_cb != undefined) {

    }

    var render = template.compile(source)
    var data = render(req)
    results.push({
        name : out_name,
        content: data
    })

    // file
    // messages = req.messages

    // // gen code
    // const formatter = tpl.format
    // const last_index = messages.length - 1

    // var code = ""
    // if(filter_cb != undefined && filter_cb != null) {
    //     messages.forEach((msg, index)=> {
    //         if(filter_cb(msg)) {
    //             code += formatter.format(msg) + "\n"
    //         }
    //     })
    // } else {
    //     messages.forEach((msg, index)=> {
    //         code += formatter.format(msg) + "\n"
    //     })
    // }

    //
    // var data = ""
    // data = tpl.prefix + code + tpl.suffix
    // results.push({
    //     name : out_name,
    //     content: data
    // })
}

function getTemplatePath(file) {
    // 首先查找相对本地地址
    tpl_path = "./templates/" + file
    if(fs.existsSync(tpl_path)) {
        return tpl_path
    }

    tpl_path = __dirname + "/templates/" + file
    // console.error("aaa",tpl_path)
    if(fs.existsSync(tpl_path)) {
        return tpl_path
    }

    console.error("can open template:", file)
    return ""
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
 * 深度拷贝,用于拷贝配置信息
 * @param {*} dst 
 * @param {*} src 
 */
function deepCopy(dst, src) {
    for (var k in src) {
        var datas = src[k]
        var datad = dst[k]

        var types = typeof datas
        var typed = typeof datad

        // 类型不同，直接覆盖
        if (Array.isArray(datas) && Array.isArray(datad)) {
            dst[k] = datad.concat(datas)
        } else if (typed === 'object' && types === 'object') {
            deepCopy(datad, datas)
        } else {
            dst[k] = datas
        }
    }
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
