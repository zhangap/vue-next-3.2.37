import {track, trigger} from "./reactive.js";

/**
 * 计算属性函数
 * @param getter
 */
export function computed(getter) {
    // 缓存变量
    let value = ''
    // 标记是否是脏数据，只有是脏数据的时候才需要重新计算
    let dirty = true

    const effectFn = effect(getter, {
        lazy: true,
        scheduler() {
            dirty = true
            // 当依赖值发生变化时，触发相应
            trigger(obj, 'value')
        }
    })

    const obj = {
        get value() {
            if (dirty) {
                value = effectFn()
                dirty = false
            }
            // 当访问值的时候，手动追踪
            track(obj, 'value')
            return value
        }
    }
    return obj

}
