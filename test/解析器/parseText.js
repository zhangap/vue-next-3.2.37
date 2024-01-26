import {decodeHtml} from "./decodeHtml.js";

/**
 * 解析文本字符
 * @param context
 */
export function parseText(context) {
    // endIndex 为文本内容的结尾索引，默认将整个模板剩余内容都作为文本内容
    let endIndex = context.source.length;
    // 寻找字符 < 的位置索引
    const leftIndex =  context.source.indexOf('<');
    // 寻找定界符 {{ 的位置索引
    const delimiterIndex = context.source.indexOf('{{');
    // 取 ltIndex 和当前 endIndex 中较小的一个作为新的结尾索引
    if(leftIndex > -1 && leftIndex < endIndex) {
        endIndex = leftIndex;
    }
    // 取 delimiterIndex 和当前 endIndex 中较小的一个作为新的结尾索引
    if(delimiterIndex > -1 &&  delimiterIndex < endIndex) {
        endIndex = delimiterIndex;
    }
    const content = context.source.slice(0, endIndex);
    // 消费文本内容
    context.advanceBy(content.length);

    // 返回文本内容
    return {
        type: 'Text',
        // 调用 decodeHtml 函数解码内容
        content: decodeHtml(content)
    }
}
