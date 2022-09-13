import { track,trigger } from './effect';

// target如果是已经使用过reactive生成的代理对象，则直接返回该代理对象
export enum ReactiveFlag{
    IS_REACTIVE = '__is_reactived__',
}
export const mutableHandlers = {
    get(tar,prop,receiver){
        // 表示生成的代理对象返回该属性都返回true
        if(prop === ReactiveFlag.IS_REACTIVE) return true;
        //进行依赖收集
        track(tar,'get',prop);
        // receiver 指的是当前proxy，
        // 当目标对象tar 存在getter或者setter函数时，通过Reflect可以receiver传递给函数的this指针
        return Reflect.get(tar,prop,receiver);
    },
    set(tar,prop,value,receiver){
        const oldValue = tar[prop]; // 保存老值
        const result = Reflect.set(tar,prop,value,receiver);
        // 只有当老值和新值不同时触发依赖
        if(oldValue !== value){
            trigger(tar,'set',prop,value,oldValue);
        }

        return result
    }
}