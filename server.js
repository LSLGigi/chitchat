var express = require('express'), //引入express模块
    app = express(),
    server = require('http').createServer(app),
    io = require('socket.io').listen(server);  //引入socket.io模块并将socket.io 绑定到服务器上
    users = [];  //保存所有人的绰号
//本地测试
//server.listen(8080);
server.listen(process.env.PORT || 8080);

app.use('/', express.static(__dirname + '/public'));//指明静态文件html位置

//服务器监听所有客户端，并返回该新连接对象
io.sockets.on('connection', function (socket) {
   socket.on('login',function(nickname){
      if(users.indexOf(nickname) > -1){
      	socket.emit('nameExisted'); //绰号已存在
      } else {
      	    socket.userLength = users.length;
            socket.nickname = nickname;
            users.push(nickname);
            socket.emit('loginSuccess');  //成功登陆
            io.sockets.emit('system', nickname, users.length, 'login');
      }
   });
   socket.on('sendMsg',function(msgInput,color){
       //把自己输入的信息发布给其他用户
       socket.broadcast.emit('myMsg', socket.nickname, msgInput,color);
   });
   //用户断开连接触发disconnect事件
    socket.on('disconnect',function(){
       users.splice(socket.userLength,1);
       socket.broadcast.emit('system', socket.nickname, users.length, 'leave');
   });
   //接受用户的图片
   socket.on('img',function(imgShow){
       socket.broadcast.emit('sendImg',socket.nickname,imgShow);
   });
});
