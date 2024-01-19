/**
 * 生成代码字符串
 * @param node
 */
export function generate(node) {

    const context = {
        // 最终生成的代码字符串
        code: '',
        // 在生成代码时，通过调用 push 函数完成代码的拼接
        push(code) {
            context.code += code;
        },
        // 当前缩放级别，初始值为0
        currentIndent: 0,
        // 该函数用来换行，即在代码字符串后面追加\n字符。换行时应该保留缩进，所以还需要追加空格字符。
        newLine() {
            context.code  +='\n' + ` `.repeat(context.currentIndent);
        },
        // 缩进函数
        indent() {
            context.currentIndent++;
            context.newLine();
        },
        // 取消缩进函数,即让 currentIndent 自减后，调用换行函数
        deIndent() {
            context.currentIndent--;
            context.newLine();
        }
    }
    genNode(node, context);
    return context.code;
}

function genNode(node, context) {
    switch (node.type) {
        case 'FunctionDecl':
            genFunctionDecl(node,context);
            break;
        case 'ReturnStatement':
            genReturnStatement(node, context);
            break;
        case 'CallExpression':
            genCallExpression(node, context);
            break;
        case 'StringLiteral':
            genStringLiteral(node, context);
            break;
        case 'ArrayExpression':
            genArrayExpression(node, context);
            break;
    }
}

/**
 *
 * @param nodes
 * @param context
 */
function genNodeList(nodes, context) {
    const {push} = context;
    for (let i = 0; i < nodes.length ; i++) {
        const node = nodes[i];
        genNode(node, context);
        if( i < nodes.length -1) {
            push(`, `);
        }
    }
}

/**
 * 生成函数
 * @param node
 * @param context
 */
function genFunctionDecl(node, context) {
    // 从 context 对象中取出工具函数
    const {push, indent,deIndent} = context;
    // node.id 是一个标识符，用来描述函数的名称，即 node.id.name
    push(`function ${node.id.name}`);
    push(`(`);
    genNodeList(node.params, context);
    push(`)`);
    push(`{`);
    // 缩进
    indent();
    node.body.forEach(n => genNode(n, context));
    // 取消缩进
    deIndent();
    push(`}`);
}

function genReturnStatement(node, context) {
    const {push} = context;
    push(`return `);
    // 调用 genNode 函数递归地生成返回值代码
    genNode(node.return, context);
}

function genCallExpression(node, context) {
    const {push} = context;
    // 取得被调用函数名称和参数列表
    const { callee, arguments: args } = node;
    push(`${callee.name}(`);
    genNodeList(args,context);
    // 补全括号
    push(`)`);
}

function genStringLiteral(node, context) {
    const {push} = context;
    // 对于字符串字面量，只需要追加与 node.value 对应的字符串即可
    push(`'${node.value}'`);
}

function genArrayExpression(node, context) {
    const {push} = context;
    // 追加方括号
    push('[');
    genNodeList(node.elements, context);
    // 补全方括号
    push(']');
}
