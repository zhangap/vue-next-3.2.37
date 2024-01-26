import {decodeHtml} from "./decodeHtml.js";

const START_DELIMITER = '{{';
const END_DELIMITER = '}}';
/**
 * 解析插值
 * 逻辑：解析器在解析插值时，只需要将文本插值的开始定界符与结束定界符之间的内容提取出来，作为 JavaScript 表达式即可
 * @param context
 */
export function parseInterpolation(context) {
    const {advanceBy} = context;
    // 消费开始定界符
    advanceBy(START_DELIMITER.length);
    // 找到结束定界符的位置索引
    const closeIndex = context.source.indexOf(END_DELIMITER);
    if(closeIndex < 0) {
        console.error('插值缺少结束定界符');
    }
    // 截取开始定界符与结束定界符之间的内容作为插值表达式
    const content = context.source.slice(0, closeIndex);
    // 消费表达式的内容
    advanceBy(content.length);
    // 消费结束界定符
    advanceBy(END_DELIMITER.length);

    // 返回类型为 Interpolation 的节点，代表插值节点
    return {
        type: 'Interpolation',
        content: {
            type: 'Expression',
            // 表达式节点的内容则是经过 HTML 解码后的插值表达式
            content: decodeHtml(content)
        }
    }
}
