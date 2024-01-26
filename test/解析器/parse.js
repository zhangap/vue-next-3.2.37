import {TextModes} from "./Constant.js";
import {parseChildren} from "./parseChildren.js";

export function parse(str) {
    // 上下文对象
    const context = {
        // 模板字符串
        source: str,
        mode: TextModes.DATA,
        // advanceBy 函数用来消费指定数量的字符，它接收一个数字作为参数
        advanceBy(num) {
            context.source = context.source.slice(num);
        },
        // 无论是开始标签还是结束标签，都可能存在无用的空白字符，例如 <div>
        advanceSpaces() {
            const match = /^[\t\r\n\f ]+/.exec(context.source);
            if(match) {
                // 调用 advanceBy 函数消费空白字符
                context.advanceBy(match[0].length);
            }
        }
    }
    const nodes = parseChildren(context, []);

    return {
        type: 'Root',
        children: nodes,
    }
}

