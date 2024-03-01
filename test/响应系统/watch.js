/**
 * 增加watch监听函数
 * @param source
 * @param cb
 * @param options
 */
export function watch(source, cb, options = {}) {
    let getter = () => {}
    let oldValue, newValue
    if (typeof source === 'function') {
        getter = source
    } else {
        getter = () => traverse(source)
    }
    // cleanup 用来存储用户注册的过期回调
    let cleanup
    // 定义 onInvalidate 函数
    function onInvalidate(fn) {
        cleanup = fn
    }

    const effectFn = effect(() => getter(), {
        // lazy设置为true，下面会手动触发effectFn
        lazy: true,
        scheduler() {
            if (options.flush === 'post') {
                const p = Promise.resolve()
                p.then(scheduler)
            } else {
                scheduler()
            }
        }
    })

    function scheduler() {
        // 在 scheduler 中重新执行副作用函数，得到的是新值
        newValue = effectFn()
        // 在调用回调函数 cb 之前，先调用过期回调
        if (cleanup) {
            cleanup()
        }
        // 将旧值和新值作为回调函数的参数
        cb(newValue, oldValue, onInvalidate)
        // 更新旧值
        oldValue = newValue
    }

    if (options.immediate) {
        scheduler()
    } else {
        // 手动触发effectFn，获取旧值
        oldValue = effectFn()
    }
}

function traverse(value, seen = new Set()) {
    // 如果要读取的数据是原始值，或者已经被读取过了，那么什么都不做
    if (typeof value !== 'object' || value === null || seen.has(value)) return
    // 将数据添加到 seen 中，代表遍历地读取过了，避免循环引用引起的死循环
    seen.add(value)
    // 假设 value 就是一个对象，使用 for...in 读取对象的每一个值，并递归地 调用 traverse 进行处理

    for (const key in value) {
        traverse(value[key], seen)
    }
    return value
}
