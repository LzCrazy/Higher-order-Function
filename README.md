### 高阶函数
#### 1.安全的类型检测
javascript内置的类型检测机制并非完全可靠。例如：typeof(safari在对正则表达应用了会返回"function")，instanceof（在存在多个全局作用域的情况下）。

```
    var isArray=value instanceof Array;
```
结果是true，value必须是一个数组，而且还必须与Array构造函数在同一个全局作用域中（Array是window的属性）。

在检测某个对象是否是原生对象还是自定对象时候，使用原生的toString()方法，该方法都会返回一个【object NativeContructorname】 格式的字符串。每个类
在内部都有一个【【class】】属性，这个属性中就指定了字符中的构造函数
````
    console.log(object.prototype.toString.call(value));//"[object Array]"
````
由于原生数组的构造函数名与全局作用域无关，因此使用toString()就能保证返回一致的值
```
    function isArray(value){
        return Object.prototype.toString.call(value) == "[object Array]"
    }
```
检测是否是原生函数或正则表达式
```
    function isFunction(value){
        return Object.prototype.toString.call(value) == "[object Function]";
    }
    
    function isRegExp(value){
        return Object.prototype.toString.call(value) == "[obeject RegExp]";
    }
```

#### 2.作用域安全的构造函数
```
    function Person(name,age,job){
        this.name=name;
        this.age=age;
        this.job=job;
    }
    var person=new Person("LzCrazy",123,"software Enginee");
```
当没有使用new操作符调用该构造函数，由于this对象是在运行时绑定的，所以直接调用Person（），this会映射到全局对象window上，导致错误对象属性的以外增加
```
    var person=Person("LzCrazy",123,"software Enginee");
    console.log(window.name);//"LzCrayz"
    console.log(window.age);//123
    console.log(window.job);//software enginee
```
原本针对Person实例的三个属性被加到window对象上，因为构造函数是作为普通函数调用的，忽略了new操作符。这个问题是由this对象的晚绑定造成的，在这里的this被
解析成window对象。由于window的name属性是用于识别连接目标和框架的，所以这里对该属性的偶然覆盖可能会导致该页面上出现其他的错误。这个问题的解决方法
就是创建一个作用域安全的构造函数。
```
    function Person(name,age,job){
        if(this instanceof Person){
            this.name=name;
            this.age=age;
            this.job=job;
        }else{
            return new Person(name,age,job);
        }
    }
```

如果使用构造函数窃取模式的继承不使用原型链，那么该继承将被破坏
```
    function Polygon(side){
        if(this instanceof Polygon){
            this.side=side;
            this.getArea=function(){
                return 0;
            }
        }else{
            return new Pllygon(side);
        }
    }
    
    function Rectangle(width,height){
        Polygon.call(this,2);
        this.width=width;
        this.height=hegiht;
        this.getArea=function(){
            return this.width * this.height;
        };
    }
    var rect=new Rectangle(1,2);
    console.log(rect.side);//undefined
```
Polygon构造函数是作用域安全的，但是Rectangle构造不是。新创建一个Rectangle实例之后，这个实例应该通过Polygon.call（）来
继承side属性。this对象并非Polygon实例，所以会创建一个新的Polygon对象，所以Rectangle实例中就不会有side属性，解决：
```
    //添加一个属性继承链
    Rectangle.prototype =  new Polygon();
```
#### 3.惰性载入函数
```
    function createXHR(){
        if(typeof XMLHttpRequest != "undefined"){
            return new XMLHttpRequest();
        }else if(typeof ActiveXObject != "undefined"){
            if(type argumetns.callee.activeString != "string"){
                var versions=["MSXML2.XMLHttp.6.0","MSXML2.XMLHttp.3.0","MSXML2.XMLHttp"],len,i;
                for(i=0,len=versions.length;i<len;i++){
                    try{
                        new ActiveXObject(versions[i]);
                        arguments.callee.activeXString = versions[i];
                        breakk;
                    }catch(ex){
                    
                    }
                }
            }
            return new ActiveXObject(arguments.callee.activeXString);
            
        }else{
            throw new Error("没有xhr对象");
        }
    }
```
每次调用createXHR（）的时候，它都要对浏览器所支持的功能检查一遍；如果浏览器支持内置XHR，那么它就一直支持，所以该测试就变得多余了，
所以，我们使用惰性载入的技巧来加速运行；

惰性载入表示执行的分支仅会发生一遍。有两种方式实现，1，就是在函数被调用时再处理函数；
```
    fuction createXHR(){
        if(typeof XMLHttpRequest != "undefined"){
            ceateXHR = function(){
                return new XMLHttpRequest();
            };
            
        }else if(typeof ActiveXObject != "undefined"){
            createXHR = function(){
                if(typeof arguments.callee.activeXString != "string"){
                   var versions=["MSXML2.XMLHttp.6.0","MSXML2.XMLHttp.3.0","MSXML2.XMLHttp"],len,i;
                    for(i=0,len=versions.length;i<len;i++){  
                        try{
                             new ActiveXObject(versions[i]);
                              arguments.callee.activeXString = versions[i];
                               breakk;
                         }catch(ex){
                                            
                        }
                }
            }
            return new ActiveXObject(arguments.callee.activeXString);
        };
    }else{
        createXHR = function(){
            throw new Error("没有该对象");
        }
    }
    return createXHR();
    }
```
2.是再声明函数时就指定适当的函数。这样，再第一次调用函数时就不会损失性能，而再代码首次加载时会损失一点性能
```
    function createXHR(){
        if(typeof XMLHttpRequest != "undefined"){
            return function(){
                return new XMLHttpRequest();
            }
        }else if(typeof ActiveXObject != "undefined"){
            return function(){
                if(type argumetns.callee.activeString != "string"){
                var versions=["MSXML2.XMLHttp.6.0","MSXML2.XMLHttp.3.0","MSXML2.XMLHttp"],len,i;
                 for(i=0,len=versions.length;i<len;i++){
                      try{
                           new ActiveXObject(versions[i]);
                           arguments.callee.activeXString = versions[i];
                           breakk;
                        }catch(ex){
                                    
                        }
                  }
             }
                return new ActiveXObject(arguments.callee.activeXString);
            }
            
        }else{
            return function(){
                throw new Error("没有xhr对象");
            }
        }
    }
```
创建一个匿名，自调的函数，用于确定应该使用那一个函数实行
 
####  4.函数函数
需要创建一个函数，可以在特定的this环境中指定参数调用另一个函数。该技巧常常和回调函数与事件处理程序一起使用，以便将函数作为
变量传递的同时保留代码执行环境。
```
    var handler={
        message:"this is handler",
        handler:function(event){
            alert(this.message);
        }
    }
    var btn=documetn.getElementById("btn);
    EventUtil.addHandler(btn,"click",handler.handlerClick);
```
当我们点击该事件，就调用该函数，显示一个弹框"this is handler"，但出现的是undefined。问题在于没有保存handler.handlerClick()环境
所以this对象指向的是DOM按钮并非是handler。修正
```
    var handler={
        message:"this is handler",
        handler:function(event){
            alert(this.message);
        }
    }
    var btn=documetn.getElementById("btn);
    EventUtil.addHandler(btn,"click",function(event){
        handler.handlerClick(event);
    });
```
但是，如果创建多个闭包可能会另代码难以理解和调试。可以使用bind()实现将函数绑定到指定的函数。
一个简单的bind()函数接受一个函数和一个环境，并放回一个在给定环境中调用给定函数的函数，并且将所有参数原封不懂传递过去
```
    function bind(fn,context){
        return function(){
            return fn.apply(context,arguments);
        }
    }
```
在bind中创建一个闭包，闭包使用apply调用传入的函数，并给apply()传递context对象和参数。注意这里使用argument对象是
内部函数的，并非bind的，当调用返回的函数时，它会在给定环境中执行被传入的函数并给出所有的参数
```
    var handler={
        message:"this is handler",
        handler:function(event){
            alert(this.message);
        }
    }
    var btn=documetn.getElementById("btn);
    EventUtil.addHandler(btn,"click",bind(handler.handlerClick,handler));
    });
```