import {parseTag} from "./parseTag.js";
import {TextModes} from "./Constant.js";
import {parseChildren} from "./parseChildren.js";

/**
 *解析标签节点
 * @param context 上下文对象
 * @param ancestors  祖先节点
 */
export function parseElement(context,ancestors) {
    const element = parseTag(context);
    if(element.isSelfClosing) return element;
    // 切换到正确的文本模式
    if(element.tag === 'textarea' || element.tag === 'title') {
        // 如果由 parseTag 解析得到的标签是 <textarea> 或 <title>，则切换到 RCDATA 模式
        context.mode = TextModes.RCDATA;
    } else if(/style|xmp|iframe|noembed|noframes|noscript/.test(element.tag)) {
        // 如果由 parseTag 解析得到的标签是：
        // <style>、<xmp>、<iframe>、<noembed>、<noframes>、<noscript>
        // 则切换到 RAWTEXT 模式
        context.mode = TextModes.RAWTEXT;
    } else {
        // 否则切换到 DATA 模式
        context.mode = TextModes.DATA;
    }
    ancestors.push(element);
    element.children = parseChildren(context, ancestors);
    ancestors.pop();

    if(context.source.startsWith(`</${element.tag}>`)) {
        parseTag(context, 'end');
    } else {
        console.error(`${element.tag}标签缺少闭合标签`);
    }
    return element;
}
