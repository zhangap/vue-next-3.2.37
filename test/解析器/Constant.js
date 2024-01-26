//定义文本模式（状态表）
export  const TextModes = {
    // 能解析标签、支持html实体
    DATA: 'DATA',
    // 不能解析标签，支持html实体
    RCDATA: 'RCDATA',
    // 不能解析标签，不支持html实体
    RAWTEXT: 'RAWTEXT',
    // 不能解析标签、不支持html实体
    CDATA: 'CDATA'
}
