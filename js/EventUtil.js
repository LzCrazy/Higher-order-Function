/**
 * Created by jalance on 2017/5/13.
 */
var EventUtil={

    addHandler:function (ele,type,handler) {
        if(ele.addEventListener){
            ele.addEventListener(type, handler, false);
        }else if(ele.attachEvent){
            ele.attachEvent("on" + type, handler);
        }else{
            ele["on" + type] = handler;
        }
    }
}