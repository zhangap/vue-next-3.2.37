import {parseAttributes} from "./parseAttributes.js";

/**
 *  由于 parseTag 既用来处理开始标签，也用来处理结束标签，因此我们设计第二个参数 type，
 * 用来代表当前处理的是开始标签还是结束标签，type 的默认值为 'start'，即默
 * 认作为开始标签处理
 * @param context
 * @param type
 */
export  function parseTag(context, type='start') {
    // 从上下文对象中拿到 advanceBy 函数
    const {advanceBy,advanceSpaces} = context;

    // 处理开始标签和结束标签的正则表达式不同
    const match = type === 'start'
        // 匹配开始标签
        ? /^<([a-z][^\t\r\n\f />]*)/i.exec(context.source)
        // 匹配结束标签
        : /^<\/([a-z][^\t\r\n\f />]*)/i.exec(context.source);
    // 匹配成功后，正则表达式的第一个捕获组的值就是标签名称
    const tag = match[1];
    // 消费正则表达式匹配的全部内容，例如 '<div' 这段内容
    advanceBy(match[0].length);
    // 消费标签中无用的空白字符
    advanceSpaces();

    // 调用 parseAttributes 函数完成属性与指令的解析，并得到 props 数组，
    // props 数组是由指令节点与属性节点共同组成的数组
    // 调用时机：需要再消费标签的开始部分和无用的空白字符之后执行
    const props = parseAttributes(context);

    // 在消费匹配的内容后，如果字符串以 '/>' 开头，则说明这是一个自闭合标签
    const isSelfClosing = context.source.startsWith('/>');
    advanceBy(isSelfClosing ? 2:1);
    advanceSpaces();

    // 返回标签节点

    return {
        type: 'Element',
        // 标签名称
        tag,
        props,
        // 标签的属性暂时留空
        children: [],
        // 子节点留空
        isSelfClosing
    }
}
