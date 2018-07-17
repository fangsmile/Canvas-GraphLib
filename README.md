# Canvas-GraphLib
Using language of typescript, I package the shape-drawing of the underlying.<br>  
该项目使用typescript语言，将在canvas上绘制图形的底层库进行了封装。<br>  
You can download sourcecode to use directly.<br>  
你可以直接下载源码使用到项目中。<br>  
整个绘制层的结构如下图所示：<br>  
stage是一个绘制舞台，项目中可以有多个舞台，指定绘制一个进行绘制。stage包含一个或者多个绘制层。<br>  
layer是舞台中的一个绘制层，绘制具体的图形shape或者group。<br>  
group是一个组，可以包含多个图形shape或者group。<br>  
以上三个类都继承自container。<br>  
 ![image](https://github.com/fangsmile/Canvas-GraphLib/blob/master/raw/master/images-folder/struct.png?raw=true)
