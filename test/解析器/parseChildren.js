import {TextModes} from "./Constant.js";
import {parseComment} from "./parseComment.js";
import {parseCDATA} from "./parseCDATA.js";
import {parseElement} from "./parseElement.js";
import {parseInterpolation} from "./parseInterpolation.js";
import {parseText} from "./parseText.js";

/**
 * 解析
 * @param context
 * @param ancestors
 */
export function parseChildren(context,ancestors) {
    // 定义 nodes 数组存储子节点，它将作为最终的返回值
    const nodes = [];
    // 从上下文对象中取得当前状态，包括模式 mode 和模板内容 source
    const {mode, source} = context;
    // 开启 while 循环，只要满足条件就会一直对字符串进行解析
    while (!isEnd(context,ancestors)) {
        let node;
        // 只有 DATA 模式和 RCDATA 模式才支持插值节点的解析
        if(mode === TextModes.DATA || mode === TextModes.RCDATA) {
            // 只有 DATA 模式才支持标签节点的解析
            if(mode === TextModes.DATA && source[0] === '<') {
                if(source[1] === '!') {
                    if(source.startsWith('<!--')) {
                        //注释节点
                        node = parseComment(context);
                    } else if(source.startsWith('<![CDATA]')) {
                        // CDATA
                        node = parseCDATA(context, ancestors);
                    }
                } else if(source[1] === '/') {
                    // 结束标签，这里需要抛出错误，后文会详细解释原因
                    console.error('结束标签，这里错误');
                } else if(/[a-z]/i.test(source[1])) {
                    // 标签
                    node = parseElement(context, ancestors);
                }
            } else if(source.startsWith('{{')) {
                // 解析插值
                node = parseInterpolation(context);
            }
        }
        // node 不存在，说明处于其他模式，即非 DATA 模式且非 RCDATA 模式
        // 这时一切内容都作为文本处理
        if(!node) {
            node = parseText(context);
        }
        // 将节点添加到 nodes 数组中
        nodes.push(node);
    }
    // 当 while 循环停止后，说明子节点解析完毕，返回子节点
    return nodes;
}


/**
 * 结束方法
 * @param context
 * @param ancestors
 */
function isEnd(context, ancestors) {
    // 当模板内容解析完毕后，停止
    if(!context.source) return true;
    // 获取父级标签节点
    const parent = ancestors[ancestors.length -1];
    // 如果遇到结束标签，并且该标签与父级标签节点同名，则停止
    if(parent && context.source.startsWith(`</${parent.tag}>`)) return true;
}
