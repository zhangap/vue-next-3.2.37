/**
 *
 * @param node
 * @param indent
 */
function dump(node, indent=0) {
    const type = node.type;
    const desc = type === 'Root' ? '' : type === 'Element' ? node.tag : node.content;
    // 打印
    console.log(`${'-'.repeat(indent)}${type}:${desc}`);
    // 递归打印子节点
    if(node.children) {
        node.children.forEach(n => dump(n, indent +1));
    }
}

/**
 * 转换html节点（模拟函数）
 * @param node
 */
function transformElement(node) {
    if(node.type === 'Element' && node.tag === 'p') {
        node.tag = 'h1';
    }
}
/**
 * 转换文本节点（模拟函数）
 * @param node
 */
function transFormText(node,context) {
    if(node.type === 'Text') {
        // node.content = node.content.repeat(2);
        context.replaceNode({
            type: 'Element',
            tag: 'span'
        })
    }
}
/**
 * 转换函数
 * @param ast
 */
export function transform(ast) {
    const context = {
        currentNode: null,
        childIndex:0,
        parent:null,
        nodeTransforms: [
            transformElement,
            transFormText
        ],
        // 替换节点
        replaceNode(node) {
            context.parent.children[context.childIndex] = node;
            context.currentNode = node;
        }
    }
    // 对节点的转换
    traverseNode(ast, context);
    console.log(dump(ast));
}

/**
 * AST的转换
 * @param ast
 * @param context
 */
function traverseNode(ast,context) {
    // 设置当前转换的节点
    context.currentNode = ast;
    // 增加退出阶段的回调函数组
    const exitFns = [];
    const transforms = context.nodeTransforms;
    for (let i = 0; i < transforms.length; i++) {
        // 2. 转换函数可以返回另外一个函数，该函数即作为退出阶段的回调函数
        const onExit = transforms[i](context.currentNode, context);
        if(onExit) {
            // 将退出阶段的回调函数添加到 exitFns 数组中
            exitFns.push(onExit);
        }
        if(!context.currentNode) return;
    }
    const children = context.currentNode.children;
    if(children) {
        for (let i = 0; i < children.length ; i++) {
            // 递归地调用 traverseNode 转换子节点之前，将当前节点设置为父节点
            context.parent = context.currentNode;
            // 设置位置索引
            context.childIndex = i;
            // 递归地调用时，将 context 透传
            traverseNode(children[i], context);
        }
    }
    // 在节点处理的最后阶段执行缓存到 exitFns 中的回调函数
    // 注意，这里我们要反序执行
    let i = exitFns.length;
    while (i--) {
        exitFns[i]();
    }
}
