import { isObject } from '@vue/shared'
// reactive 创建对象的响应式数据
// 接收一个任意对象（只能对象）作为参数，返回一个proxy对象
export function reactive(target){
    if(!isObject(target)){
        throw('target not is object');
    }


    // Reflect 与 Proxy 是配套使用的， Proxy的handler捕捉器与Reflect内的函数一一对应，且函数参数一致
    // Proxy 不自定义捕捉器时，默认走对象的默认行为
    // 猜测为了方便，没有自定义捕捉器，走的是对应的Reflect方法
    const proxy = new Proxy(target,{
        get(tar,prop,receiver){
            // receiver 指的是当前proxy，
            // 当目标对象tar 存在getter或者setter函数时，通过Reflect可以receiver传递给函数的this指针
            return Reflect.get(tar,prop,receiver);
        },
        set(tar,prop,value,receiver){
            Reflect.set(tar,prop,value,receiver);
            return true
        }
    });

    return proxy;
}