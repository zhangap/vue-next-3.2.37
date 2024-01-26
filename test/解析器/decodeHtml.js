const namedCharacterReferences = {
    "gt": ">",
    "gt;": ">",
    "lt": "<",
    "lt;": "<",
    "ltcc;": "⪦"
};
const CCR_REPLACEMENTS = {
    0x80: 0x20ac,
    0x82: 0x201a,
    0x83: 0x0192,
    0x84: 0x201e,
    0x85: 0x2026,
    0x86: 0x2020,
    0x87: 0x2021,
    0x88: 0x02c6,
    0x89: 0x2030,
    0x8a: 0x0160,
    0x8b: 0x2039,
    0x8c: 0x0152,
    0x8e: 0x017d,
    0x91: 0x2018,
    0x92: 0x2019,
    0x93: 0x201c,
    0x94: 0x201d,
    0x95: 0x2022,
    0x96: 0x2013,
    0x97: 0x2014,
    0x98: 0x02dc,
    0x99: 0x2122,
    0x9a: 0x0161,
    0x9b: 0x203a,
    0x9c: 0x0153,
    0x9e: 0x017e,
    0x9f: 0x0178
};

/**
 * 解码html
 * @param rawText  原始字符
 * @param asAttr
 */
export function decodeHtml(rawText, asAttr = false) {
    let offset = 0;

    const end = rawText.length;
    // 经过解码后的文本将作为返回值被返回
    let decodeText = '';
    // 引用表中实体名称的最大长度
    let maxCRNameLength = 0;

    // advance 函数用于消费指定长度的文本
    function advance(length) {
        offset += length;
        rawText = rawText.slice(length);
    }
    // 消费字符串，直到处理完毕为止
    while (offset < end) {
        // 用于匹配字符引用的开始部分，如果匹配成功，那么 head[0] 的值将有三种
        // 可能：
        // 1. head[0] === '&'，这说明该字符引用是命名字符引用
        // 2. head[0] === '&#'，这说明该字符引用是用十进制表示的数字字符引用
        // 3. head[0] === '&#x'，这说明该字符引用是用十六进制表示的数字字符
        const head = /&(?:#x?)?/i.exec(rawText);
        // 如果没有匹配，说明已经没有需要解码的内容了
        if(!head) {
            // 计算剩余内容长度
            const remaining = end - offset;
            // 把剩余内容加到decodeText上
            decodeText += rawText.slice(0, remaining);
            // 消费剩余内容
            advance(remaining);
            break;
        }
        // head.index 为匹配的字符 & 在 rawText 中的位置索引
        // 截取字符 & 之前的内容加到 decodedText 上
        decodeText += rawText.slice(0, head.index);
        // 消费字符 & 之前的内容
        advance(head.index);
        // 如果满足条件，则说明是命名字符引用，否则为数字字符引用
        if(head[0] === '&') {
            let name = '';
            let value = '';
            // 字符 & 的下一个字符必须是 ASCII 字母或数字，这样才是合法的命名字符引用
            if (/[0-9a-z]/i.test(rawText[1])) {
                // 根据引用表计算实体名称的最大长度，
                if(!maxCRNameLength) {
                    maxCRNameLength = Object.keys(namedCharacterReferences).reduce((max, name) => Math.max(max, name.length), 0);
                }
                // 从最大长度开始对文本进行截取，并试图去引用表中找到对应的项
                for(let length = maxCRNameLength; !value && length > 0; --length) {
                    // 截取字符 & 到最大长度之间的字符作为实体名称
                    name = rawText.substr(1,length);
                    // 使用实体名称去索引表中查找对应项的值
                    value = (namedCharacterReferences)[name];
                }
                // 如果找到了对应项的值，说明解码成功
                if(value) {
                    // 检查实体名称的最后一个匹配字符是否是分号
                    const semi = name.endsWith(';')
                    // 如果解码的文本作为属性值，最后一个匹配的字符不是分号，
                    // 并且最后一个匹配字符的下一个字符是等于号（=）、ASCII 字母或数字，
                    // 由于历史原因，将字符 & 和实体名称 name 作为普通文本
                    if(asAttr && !semi && /[=a-z0-9]/i.test(rawText[name.length + 1] || '')) {
                        decodeText += '&' + name;
                        advance(1 + name.length);
                    } else  {
                        decodeText += value;
                        advance(1 + name.length);
                    }
                } else {
                    // 如果没有找到对应的值，说明解码失败
                    decodeText += '&' + name;
                    advance( 1 + name.length);
                }
            } else {
                // 如果字符 & 的下一个字符不是 ASCII 字母或数字，则将字符 & 作为普通文本
                decodeText += '&';
                advance(1);
            }
        } else {
            // 判断是十进制表示还是十六进制表示
            const hex = head[0] === '&#x';
            // 根据不同进制表示法，选用不同的正则
            const pattern = hex ?  /^&#x([0-9a-f]+);?/i : /^&#([0-9]+);?/;
            // 最终，body[1] 的值就是 Unicode 码点
            const body = pattern.exec(rawText);
            // 如果匹配成功，则调用 String.fromCodePoint 函数进行解码
            if(body) {
                // 根据对应的进制，将码点字符串转换为数字
                let cp = Number.parseInt(body[1], hex ? 16 : 10);
                // 码点的合法性检查
                if(cp === 0) {
                    // 如果码点值为 0x00，替换为 0xfffd
                    cp = 0xfffd;
                } else if(cp > 0x10ffff) {
                    // 如果码点值大于 0x10FFFF（0x10FFFF 为 Unicode 的最大值），这也是一个解析错误，解析器会将码点值替换为 0xFFFD。
                    // 如果码点值超过 Unicode 的最大值，替换为 0xfffd
                    cp = 0xfffd;
                } else if(cp >= 0xd800 && cp <= 0xdfff) {
                    // 如果码点值处于 surrogate pair 范围内，替换为 0xfffd
                    cp =  0xfffd;
                } else  if((cp >=0xfdd0 && cp <= 0xfdef) || (cp & 0xfffe) === 0xfffe) {
                    // 如果码点值处于 noncharacter 范围内，则什么都不做，交给平台处理
                } else if(
                    // 控制字符集的范围是：[0x01, 0x1f] 加上 [0x7f,
                    // 去掉 ASICC 空白符：0x09(TAB)、0x0A(LF)、0x0C(FF)
                    // 0x0D(CR) 虽然也是 ASICC 空白符，但需要包含
                    (cp >=0x01 && cp <=0x08) ||
                    (cp === 0x0b) ||
                    (cp >=0x0d && cp <=0x1f) ||
                    (cp >=0x7f && cp <=0x9f)
                ) {
                    // 在 CCR_REPLACEMENTS 表中查找替换码点，如果找不到，则使用原码点
                    cp = CCR_REPLACEMENTS[cp] || cp;
                }
                //解码后追加到 decodedText 上
                decodeText += String.fromCharCode(cp);
                // 消费整个数字字符引用的内容
                advance(body[0].length);
            } else {
                // 如果没有匹配，则不进行解码操作，只是把 head[0] 追加到decodedText 上并消费
                decodeText += head[0];
                advance(head[0].length);
            }
        }
    }
    return decodeText;
}
