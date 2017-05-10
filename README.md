# 高阶函数
###### 1.安全的类型检测
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

###### 2.作用域安全的构造函数
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
继承side属性。this对象并非Polygon实例，所以会创建一个新的Polygon对象，所以Rectangle实例中就不会有side属性

 