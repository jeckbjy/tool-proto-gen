module.exports = {
    // 需要输出的文件类型
    output:[], 
    msgid_open: true,
    msgid_path: './msgid.json',
    langs: {
        go:    {tpl:"go_msg.art", out:"msg.go"},
        csharp:{tpl:"csharp_msg.art", out:"ProtoDic.cs"},
        js:    {tpl:"js_msg.art", out:"message.js"}
    }
}
