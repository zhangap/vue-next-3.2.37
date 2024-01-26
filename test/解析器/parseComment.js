const START_COMMENT = '<!--';
const END_COMMENT = '-->';
/**
 * 解析注释
 * @param context
 */
export function parseComment(context) {
    const {advanceBy} = context;
    // 消费注释开始的部分
    advanceBy(START_COMMENT.length);
    // 找到注释结束部分的位置索引
    const closeIndex = context.source.indexOf(END_COMMENT);
    // 截取注释节点的内容
    const content = context.source.slice(0, closeIndex);
    advanceBy(content.length);
    // 消费注释节点的部分
    advanceBy(END_COMMENT.length);
    // 返回节点类型
    return {
        type: 'Comment',
        content
    }
}
