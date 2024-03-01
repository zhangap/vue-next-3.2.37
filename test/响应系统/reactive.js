// 全局的effect函数
let activeEffect = null;

//effect栈
let effectStack = [];
const bucket = new WeakMap();


/**
 * 副作用函数
 * @param fn
 * @param options
 */
export function effect(fn, options = {}) {
    //effectFn函数执行时机： 第一次手动触发effectFn函数，其目的是为了主动收集依赖； 后面再执行的话，肯定是在set函数中trigger执行。
    const effectFn = () => {
        // 调用 cleanup 函数完成清除工作
        cleanup(effectFn)
        activeEffect = effectFn
        // 在执行副作用之前将当前副作用函数压入栈中
        effectStack.push(effectFn)
        const res = fn()
        // 在当前副作用函数执行完毕以后，将当前副作用函数弹出栈，并把activeEffect还原为之前的值
        effectStack.pop()
        activeEffect = effectStack[effectStack.length - 1]
        return res
    }
    //将options挂载到effectFn上
    effectFn.options = options
    // activeEffect.deps 用来存储所有与该副作用函数相关联的依赖集合
    effectFn.deps = []
    if (!options.lazy) {
        effectFn()
    }
    return effectFn
}

// 对于遗留的副作用函数，设计cleanup函数（分支和切换，三元表达式）
function cleanup(effectFn) {
    const deps = effectFn.deps
    for (let i = 0; i < deps.length; i++) {
        const tempDeps = deps[i]
        //这里删除的，不仅仅是删除了effectFn.deps中的值，同时也删除了deps中依赖的set的值。
        tempDeps.delete(effectFn)
    }
    // 清空
    effectFn.deps.length = 0
}

export function reactive(data) {
    const obj = new Proxy(data, {
        get(target, key) {
            track(target, key)
            return target[key]
        },
        set(target, key, newVal) {
            target[key] = newVal
            trigger(target, key)
        }
    })
    return obj
}

/**
 * 追踪函数
 * @param target
 * @param key
 */
export function track(target, key) {
    if (!activeEffect) return

    let depsMap = bucket.get(target)
    if (!depsMap) {
        bucket.set(target, (depsMap = new Map()))
    }
    let deps = depsMap.get(key)
    if (!deps) {
        depsMap.set(key, (deps = new Set()))
    }
    //在同一个effect函数中，如果一个属性有被多次使用，利用了set集合的去重功能，只会收集一次依赖
    deps.add(activeEffect)
    // deps 就是一个与当前副作用函数存在联系的依赖集合
    // 将其添加到 activeEffect.deps 数组中
    activeEffect.deps.push(deps)
}


/**
 * 触发
 * @param target
 * @param key
 */
export function trigger(target, key) {
    const depsMap = bucket.get(target)
    if (!depsMap) return
    const effects = depsMap.get(key)

    const effectsToRun = new Set()
    effects &&
    effects.forEach(effectFn => {
        //如果trigger出发执行额副作用函数与当前正在执行的副作用函数相同，则不触发执行
        if (effectFn !== activeEffect) {
            effectsToRun.add(effectFn)
        }
    })
    effectsToRun.forEach(effectFn => {
        // 如果一个副作用函数存在调度器，则调用该调度器、并将副作用函数作为参数传递
        if (effectFn.options.scheduler) {
            effectFn.options.scheduler(effectFn)
        } else {
            effectFn()
        }
    })
}

