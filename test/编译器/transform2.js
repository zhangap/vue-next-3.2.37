/**
 * 创建string节点
 * @param value
 */
function createStringLiteral(value) {
    return {
        type: 'StringLiteral',
        value,
    }
}

/**
 * 创建函数识别码节点
 * @param name
 * @returns {{name, type: string}}
 */
function createIdentifier(name) {
    return {
        type: 'Identifier',
        name,
    }
}

/**
 * 创建ArrayExpression 节点
 * @param elements
 * @returns {{elements, type: string}}
 */
function createArrayExpression(elements) {
    return {
        type: 'ArrayExpression',
        elements,
    }
}

// 用来创建 CallExpression 节点
function createCallExpression(callee,args) {
    return {
        type: 'CallExpression',
        callee: createIdentifier(callee),
        arguments: args,
    }
}

/**
 * 转换html节点（模拟函数）
 * @param node
 */
function transformElement(node) {
    return () => {
        // 如果被转换的节点不是元素节点，则什么都不做
        if(node.type !== 'Element') {
            return;
        }
        // 创建h函数调用语句
        // 1、h函数调用的第一个参数是标签名称，因此使用node.tag来生成一个字符串字面量节点
        const callExp = createCallExpression('h',[createStringLiteral(node.tag)]);
        // 2、处理h函数的调用参数
        node.children.length === 1
        // 如果当前标签节点只有一个子节点，则直接使用子节点的 jsNode 作为参数
            ? callExp.arguments.push(node.children[0].jsNode)
            // 如果当前标签节点有多个子节点，则创建一个 ArrayExpression 节点作为参数
            : callExp.arguments.push(createArrayExpression(node.children.map( c=>c.jsNode)));
        // 3. 将当前标签节点对应的 JavaScript AST 添加到 jsNode 属性下
        node.jsNode = callExp;
    }
}
/**
 * 转换文本节点
 * @param node
 * @param context
 */
function transFormText(node,context) {
    if(node.type !== 'Text') {
        return;
    }
    // 文本节点对应的 JavaScript AST 节点其实就是一个字符串字面量，
    // 因此只需要使用 node.content 创建一个 StringLiteral 类型的节点即可
    // 最后将文本节点对应的 JavaScript AST 节点添加到 node.jsNode 属性下
    node.jsNode = createStringLiteral(node.content);
}

/**
 * 转换Root根节点
 * @param node
 */
function transformRoot(node) {
    // 将逻辑编写在退出阶段的回调函数中，保证子节点全部被处理完毕
    return () => {
        if(node.type !== 'Root') return;
        // node 是根节点，根节点的第一个子节点就是模板的根节点，
        // 当然，这里我们暂时不考虑模板存在多个根节点的情况
        const vnodeJSAST = node.children[0].jsNode;
        // 创建 render 函数的声明语句节点，将 vnodeJSAST 作为 render 函数体的返回语句
        node.jsNode = {
            type: 'FunctionDecl',
            id: {
                type: 'Identifier',
                name: 'render'
            },
            params: [],
            body: [{
                type: 'ReturnStatement',
                return: vnodeJSAST
            }]
        }
    }
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
            transFormText,
            transformRoot,
        ],
        // 替换节点
        replaceNode(node) {
            context.parent.children[context.childIndex] = node;
            context.currentNode = node;
        }
    }
    // 对节点的转换
    traverseNode(ast, context);
}

