/**
 * 简易渲染器
 * @param vnode
 * @param container
 */
export function renderer(vnode, container) {
    if(typeof vnode.tag === 'string') {
        mountElement(vnode, container);
    } else if(typeof vnode.tag === 'object') {
        mountComponent(vnode, container);
    }
}


function mountElement(vnode, container) {
    // eslint-disable-next-line no-restricted-globals
    const el = document.createElement(vnode.tag);

    for (const key in vnode.props) {
        if(/^on/.test(key)) {
            el.addEventListener(key.substr(2).toLowerCase(), vnode.props[key], false);
        }
    }

    if(typeof vnode.children === 'string') {
        // eslint-disable-next-line no-restricted-globals
        el.appendChild(document.createTextNode(vnode.children));
    } else if(Array.isArray(vnode.children)) {
        vnode.children.forEach(child => {
            renderer(child, el);
        })
    }
    container.appendChild(el);
}

function mountComponent(vnode,container) {
    // 调用组件函数，获取组件要渲染的内容（虚拟 DOM）
    const subtree = vnode.tag.render();
    // 递归地调用 renderer 渲染 subtree
    renderer(subtree, container);
}
