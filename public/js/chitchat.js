$(document).ready(function() {
  //与服务器建立连接
  var socket = io.connect();
  //监听服务器的connect事件
  socket.on('connect', function(){
     $('#info').text('pick a nickname for yourself ^_^');
     $('#nickWrap').css('display','block');
     $('#nickname').focus();
     //设置个人绰号,确定按钮的点击事件
     $('#loginBtn').click(function(){
     	var nickName = $('#nickname').val();
     	console.log("test");
        //判断输入框是否为空
        if($('#nickname').val() !== "" || $.trim($('#nickname').val()).length !== 0){
        	//若不为空则发送login事件和个人绰号给服务器
        	socket.emit('login', nickName);
        } else {
        	$('#nickname').focus();
        }
     });
  });
  //提示绰号已存在
  socket.on('nameExisted', function(){
      $('#info').text('The nickname already exists,pick choose another one!');
  });
  //登陆成功
  socket.on('loginSuccess', function(){
  	  $('#loginWrap').css('display','none');
      $('#msgInput').focus();
  });
  //系统通知用户登入或离开
  socket.on('system',function(nickName,number,state){
  	//显示用户人数
  	var numb = number + (number > 1 ? ' users' : ' user') + ' online';
  	$('.wrap .header #state').text(numb);
  	var stateText = nickName + (state == 'login' ? '  join' : '  leave');
  	/*var inform = $('<p></p>');
  	inform.text(stateText);
  	$('.wrap #chatCont').append(inform);
  	console.log(stateText);*/
  	//调用函数显示系统信息
  	displayMsg('system', stateText, '#fff');
    //$('#chatCont p').addClass('system');
  });
  //获取当前日期和时间
  function getnowtime() {
            var nowtime = new Date();
            var year = nowtime.getFullYear();
            var month = padleft0(nowtime.getMonth() + 1);
            var day = padleft0(nowtime.getDate());
            var hour = padleft0(nowtime.getHours());
            var minute = padleft0(nowtime.getMinutes());
            var second = padleft0(nowtime.getSeconds());
            var millisecond = nowtime.getMilliseconds(); millisecond = millisecond.toString().length == 1 ? "00" + millisecond : millisecond.toString().length == 2 ? "0" + millisecond : millisecond;
            return year + "-" + month + "-" + day + " " + hour + ":" + minute ;
  }
  //补齐两位数
  function padleft0(obj) {
            return obj.toString().replace(/^[0-9]{1}$/, "0" + obj);
  }
  //发送信息并显示到页面中
  function displayMsg(user,msg,color){
     var date = getnowtime();
     //var date = new Date().toLocaleDateString();
     var userChat = $('<p></p>');
     var msg = getEmoji(msg);
     var chatText = '<span class="userName">' + user + '</span>' + '<span class="date">(' + date + ') </span>' + '<span class="chatCont">' + msg + '</span>';
     //var meChatText = '<span class="chatCont">' + msg + '</span>'+'<span class="userName">' + user + '</span>' + '<span class="date">(' + date + '): </span>';
     // userChat.style.color = color || '#000';
     userChat.css('color', color || '#000');
     userChat.html(chatText);
     $('.wrap #chatCont').append(userChat);
     //console.log(user);
     //给系统、个人和其他用户添加不同的类以设置不同样式
     $('#chatCont').find('p').each(function(){
        while(typeof($(this).attr('class')) == 'undefined'){
          if(user == 'system'){
            $(this).addClass('system');
          } else if(user == 'me') {
            $(this).addClass('me');
          } else  {$(this).addClass('user');}
        }
     });
     $('#chatCont p .chatCont img').parent('span').removeClass('chatCont');
     /*$('#chatCont').find('p').each(function(){
          if($(this).hasClass('me')){
             console.log('hi');
             $(this).html(meChatText);
          }
     });*/
  }
  //实现用户聊天功能
  $('.wrap .sendCont #sendBtn').click(function(){
      console.log('test1');
      var msg = $('.wrap .sendCont #msgInput').val();
      //获取用户选择的颜色
      var color = $('#color').val();
      //若输入框内容不为空
      if(msg !== ''){
        //向服务器发送输入框的信息
        socket.emit('sendMsg',msg,color);
        //显示自己输入的信息
        displayMsg('me', msg,color);
        //$('#chatCont p').addClass('me');
        console.log('test2');
      } 
      $('.wrap .sendCont #msgInput').val('');
      $('.wrap .sendCont #msgInput').focus();
  });
  //向服务器传送自己发布的信息并广播出去
  socket.on('myMsg', function(user,msg,color){
       //var color = $('#color').val();
       displayMsg(user, msg, color);
       //$('#chatCont p').addClass('user');
  });
  /*$(function(){
          var $a = $('#chatCont p.me .userName');
          var aclass = $a.attr('class');
          var atext = $a.text();
          $a.remove();
          var $b = $('<span></span>');
          $b.attr('class',aclass);
          $b.text(atext);
          $('#chatCont p.me').append($b);
  });*/
  //实现发送图片功能
  $('.wrap .sendCont .controls #sendImage').on('change',function(e){
       var file = e.target.files[0]; //获取图片资源
       //只选择图片文件
       if (!file.type.match('image.*')) {
          return false;
       }

       var reader = new FileReader();
       reader.readAsDataURL(file); // 读取文件
       reader.onload = function(arg) {
           $('.wrap .sendCont #msgInput').val('');
           socket.emit('img',arg.target.result);
           displayImg('me',arg.target.result)
       };
  });
  //向服务器发送并显示图片
  socket.on('sendImg',function(user,img,color){
        displayImg(user,img,color);
  });
 
  function displayImg(user,imgShow,color){
        var date = new Date().toTimeString().substr(0,8);
        var imgChat = $('<p></p>');
        var chatCont = '<span class="userName">' + user + '</span>' + '<span class="date">(' + date + '): </span>' + '<span class="chatCont"><img class="uploadImg" src="' + imgShow + '"/></span>';
        imgChat.css('color', color || '#000');
        imgChat.html(chatCont);
        $('.wrap #chatCont').append(imgChat);
     //给个人和其他用户添加不同的类以设置不同样式
     $('#chatCont').find('p').each(function(){
        while(typeof($(this).attr('class')) == 'undefined'){
          if(user == 'me') {
            $(this).addClass('me');
          } else {$(this).addClass('user');}
        }
     });
     $('#chatCont p .chatCont img').parent('span').removeClass('chatCont');
     //var src = $('#chatCont p img.uploadImg').attr('src');
     //用户点击收到的图片后查看大图，点击页面其他部位后隐藏
     /*$('#chatCont p img.uploadImg').click(function(){
          console.log('uploadimg');
          
          var bigImg = $('<div id="outerdiv"><div id="innerdiv"><img id="bigimg" src="'+ imgShow +'"></div></div>');
         // $('.bigImg img').attr('src','1.jpg');
          $('body').append(bigImg);
          $('#outerdiv').fadeIn("fast");
          $('#outerdiv').click(function(){//再次点击淡出消失弹出层  
            $(this).fadeOut("fast");  
            console.log('fadeOut');
          });
     });*/
  }
  
  //实现发送表情包功能
  //用for循环批量添加表情包
  function displayEmoji(){
        var tag = $('<div></div>');
        for(var i = 50; i > 0; i--){
          tag.append('<img src="../images/emoji/1 (' + i +').gif" title="' + i + '"/>');
        }
        $('.wrap .sendCont #emojiCont').append(tag);
  }
  displayEmoji();
  //点击emoji按钮后出现表情包，点击页面其他部位后隐藏
  $('.wrap .sendCont #emoji').click(function(e){
         console.log('test');
         $('.wrap .sendCont #emojiCont').css('display','block');
         e.stopPropagation();
  });
  $(document).click(function(e){
         // if(e.target != emojiCont){
              $('.wrap .sendCont #emojiCont').css('display','none');
         // }
  });
  //点击表情包后获取对应表情并转化为对应代码插入输入框
  $('.wrap .sendCont #emojiCont').click(function(e){
         if (e.target.nodeName.toLowerCase() == 'img') {
               $('.wrap .sendCont #msgInput').focus();
               var inputValue = $('.wrap .sendCont #msgInput').val();
               $('.wrap .sendCont #msgInput').val(inputValue + ' {emoji:' + e.target.title + '} ');
               console.log(e.target.title);
         }
  });
  //将输入框中的表情代码转换为图片
  function getEmoji(msg){
          var match, result = msg;
          var reg = /\{emoji:\d+\}/g;
          var emojiIndex;
          var totalEmojiNum = $('#emojiCont div').children().length;
          //若匹配为表情包，则将表情代码转换为图片
          while (match = reg.exec(msg)) {
             emojiIndex = match[0].slice(7, -1);
             if (emojiIndex > totalEmojiNum) {
                 result = result.replace(match[0], '[X]');
             } else {
                 result = result.replace(match[0], '<img class="emoji" src="../images/emoji/1 (' + emojiIndex + ').gif" />');
             }
          }
          return result;
  }
  //通过“回车键”提交用户名
  $('#nickname').keydown(function(e){
          if (e.keyCode === 13) {
             var nickname = $('#nickname').val();
             if(nickname !== ''){
                 socket.emit('login',nickname);
             }
          }
  });
  //通过“回车键”提交聊天内容
  $('#msgInput').keydown(function(e){
          if (e.keyCode === 13) {
             var msg = $('#msgInput').val();
             var color = $('#color').val();
             if(nickname !== ''){
                 $('#msgInput').val('');
                 socket.emit('sendMsg',msg,color);
                 displayMsg('me', msg,color);
             }
          }
  });
  //实现清空历史消息功能
  $('#clear').click(function(){
          $('#chatCont').empty();
  });
});