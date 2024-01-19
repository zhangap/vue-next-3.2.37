// 工作流程
//     1、用来将模板字符串解析为模板 AST 的解析器（parser）
//             1、根据一定的规则将整个字符串切割为一个个Token,这里的token可以视作词法标记
//     2、用来将模板 AST 转换为 JavaScript AST 的转换器（transformer）；
//     3、用来根据 JavaScript AST 生成渲染函数代码的生成器（generator）

// 解析器的状态机

// 定义状态机的状态
const State = {
    // 初始状态
    initial: 1,
    // 标签开始状态
    tagOpen: 2,
    // 标签名称状态
    tagName: 3,
    // 文本状态
    text:4,
    // 标签结束状态
    tagEnd: 5,
    // 结束标签名称状态
    tagEndName: 6,
}
// 判断是否是字母
function isAlpha(char) {
    return (char >= 'a' && char <= 'z') || (char >= 'A' &&  char <= 'Z');
}

/**
 *  接收模板字符串作为参数，并将模板切割为 Token 返回
 * @param str
 */
export function tokenize(str) {
    // 状态机的当前状态: 初始状态
    let currentState = State.initial;
    // 缓存字符
    const chars = [];
    // 生成的 Token 会存储到 tokens 数组中，并作为函数的返回值返回
    const tokens = [];
    //使用while循环开启自动机，只要模板字符串没有被消费完，自动机就会一直执行
    while (str) {
        // 第一个字符
        const char = str[0];
        switch (currentState) {
            // 初始状态
            case State.initial :
                if(char === '<') {
                    currentState = State.tagOpen;
                    str = str.slice(1);
                } else if(isAlpha(char)) {
                    // 遇到字母，切换到文本状态
                    currentState = State.text;
                    // 将文本进行缓存
                    chars.push(char);
                    str = str.slice(1);
                }
                break;
            // 标签开始
            case State.tagOpen:
                // 遇到字母，切换到标签名称状态
                if(isAlpha(char)) {
                    currentState = State.tagName;
                    chars.push(char);
                    str = str.slice(1);
                } else if(char === '/') {
                    // 标签结束状态
                    currentState = State.tagEnd;
                    str = str.slice(1);
                }
                break;
            // 状态机处于标签名称状态
            case State.tagName:
                // 1. 遇到字母，由于当前处于标签名称状态，所以不需要切换状态，但需要将当前字符缓存到 chars 数组
                if(isAlpha(char)) {
                    chars.push(char);
                    str = str.slice(1);
                } else if(char === '>') {
                    // 标签名结束，切换到初始状态
                    currentState = State.initial;
                    tokens.push({
                        type: 'tag',
                        name: chars.join('')
                    });
                    chars.length = 0;
                    str = str.slice(1);
                }
                break;
            // 状态机当前处于文本状态
            case State.text:
                if(isAlpha(char)) {
                    chars.push(char);
                    str = str.slice(1);
                } else if(char === '<') {
                    currentState = State.tagOpen;
                    tokens.push({
                        type: 'text',
                        content: chars.join('')
                    });
                    chars.length = 0;
                    str = str.slice(1);
                }
                break;
            // 状态机当前处于标签结束状态
            case  State.tagEnd:
                if(isAlpha(char)) {
                    currentState = State.tagEndName;
                    chars.push(char);
                    str = str.slice(1);
                }
                break;
            // 状态机当前处于结束标签名称状态
            case State.tagEndName:
                if(isAlpha(char)) {
                    chars.push(char);
                    str = str.slice(1);
                } else if(char === '>') {
                    currentState = State.initial;
                    tokens.push({
                        type: 'tagEnd',
                        name: chars.join('')
                    });
                    chars.length = 0;
                    str = str.slice(1);
                }
                break;
        }
    }
    return tokens;
}
