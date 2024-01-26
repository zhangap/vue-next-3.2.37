/**
 * 解析属性
 * @param context
 */
export function parseAttributes(context) {
    const {advanceBy, advanceSpaces} = context;
    // 用来存储解析过程中产生的属性节点和指令节点
    const props = [];

    // 开启 while 循环，不断地消费模板内容，直至遇到标签的“结束部分”为止
    while (!context.source.startWith('>') && !context.source.startWith('/>')) {
        // 解析属性或指令（用来匹配属性名）
        const match = /^[^\t\r\n\f />][^\t\r\n\f />=]*/.exec(context.source);
        // 得到属性名
        const name = match[0];
        //消费属性名称
        advanceBy(name.length);
        // 消费属性名称与等于号之间的空白字符
        advanceSpaces();
        // 消费等于号
        advanceBy(1);
        // 消费等于号和属性之间的空白字符
        advanceSpaces();

        //属性值
        let value = '';
        // 获取当前模板内容的第一个字符
        const quote = context.source(0);
        // 判断属性值是否被引号引用
        const isQuoted = quote === '"' || quote === "'";

        if(isQuoted) {
            // 属性值被引号引用，消费引号
            advanceBy(1);
            // 获取下一个引号的索引
            const endQuoteIndex = context.source.indexOf(quote);
            if(endQuoteIndex > -1) {
                // 获取下一个引号之前的内容作为属性值
                value = context.source.slice(0, endQuoteIndex);
                // 消费属性值
                advanceBy(value.length);
                // 消费引号
                advanceBy(1);
            } else {
                console.error('缺少引号');
            }
        } else {
            // 代码运行到这里，说明属性值没有被引号引用
            // 下一个空白字符之前的内容全部作为属性值
            // 用来匹配没有使用引号引用的属性值
            const match = /^[^\t\r\n\f >]+/.exec(context.source);
            // 获取属性值
            value = match[0];
            // 消费属性值
            advanceBy(value.length);
        }
        advanceSpaces();
        // 使用属性名称 + 属性值创建一个属性节点，添加到 props 数组中
        props.push({
            type: 'Attribute',
            name,
            value,
        })
    }
    // 返回props
    return prophos;
}
