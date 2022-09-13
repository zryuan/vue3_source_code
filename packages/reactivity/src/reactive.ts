import { isObject } from '@vue/shared'
import { ReactiveFlag,mutableHandlers } from './baseHandler'
// reactive 创建对象的响应式数据
// 接收一个任意对象（只能对象）作为参数，返回一个proxy对象

// 同一个对象只能被代理一次，需要做target与proxy的映射
const reactiveMap = new WeakMap();

export function reactive(target){
    if(!isObject(target)){
        throw('target not is object');
    }
    // 判断是否存在target的映射，如果存在表示该target已经被代理过一次，直接返回之前生成的代理对象
    const exisitingProxy = reactiveMap.get(target);
    if(exisitingProxy){
        return exisitingProxy;
    }
    // 如果被代理对象target的该属性返回true，表示target是使用reactive生成的代理对象，所以直接返回该对象
    if(target[ReactiveFlag.IS_REACTIVE]){
        return target
    }
    // Reflect 与 Proxy 是配套使用的， Proxy的handler捕捉器与Reflect内的函数一一对应，且函数参数一致
    // Proxy 不自定义捕捉器时，默认走对象的默认行为
    // 猜测为了方便，没有自定义捕捉器，走的是对应的Reflect方法
    const proxy = new Proxy(target,mutableHandlers);

    reactiveMap.set(target,proxy);
    return proxy;
}