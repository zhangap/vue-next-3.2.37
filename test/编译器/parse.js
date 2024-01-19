import {tokenize} from "./tokenize.js";

// 构建AST是基于状态机的工作原理的代码来实现的。
export function parse(str) {
    // 首先对模板进行标记化，得到 tokens
    const tokens = tokenize(str);
    // 创建root根节点
    const root = {
        type: 'Root',
        children: []
    };
    // 创建 elementStack 栈，起初只有 Root 根节点
    const elementStack = [root];
    // 开启一个 while 循环扫描 tokens，直到所有 Token 都被扫描完毕为止
    while (tokens.length) {
        //获取当前栈顶节点作为父节点
        const parent = elementStack[elementStack.length-1];
        // 当前扫描的token
        const t = tokens[0];
        switch (t.type) {
            case 'tag':
                // 如果当前 Token 是开始标签，则创建 Element 类型的 AST 节点
                const elementNode = {
                    type: 'Element',
                    tag: t.name,
                    children:[]
                }
                parent.children.push(elementNode);
                // 将当前节点压入栈中
                elementStack.push(elementNode);
                break;
            case 'text':
                const textNode = {
                    type: 'Text',
                    content: t.content,
                };
                parent.children.push(textNode);
                break;
            case 'tagEnd':
                // 遇到结束标签，将栈顶节点弹出
                elementStack.pop();
                break;
        }
        // 消费已经扫描过的 token
        tokens.shift();
    }
    return  root;
}
