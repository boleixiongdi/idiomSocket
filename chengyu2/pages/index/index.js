//index.js
import Player from '../../lib/player.js'
var player = new Player()
//获取应用实例
const app = getApp()
var interval= null
Page({
    data: {
      userInfo:{nickName:'姓名'},//用户信息
      share:1,//区分分享
      //游戏相关
      step: 1,//当前游戏进度 1加载信息 无用
      indexUserinfo:{},
      //限时领金币相关
      preTime:'',//上一次领取的时间
      width:'',  //进度条
      coin:'',   //可以领取的金币数

      truePreTime:'',//上一次金币 的时间

      time:'00:00',   //倒计时
      onlinePerson:'',  //在线人数

    },
    onLoad(){
      this.getClientUserInfo();
      player.list.create([
        { dataUrl: 'https://xcx-album-img.duomai.com/ccl_1.mp3' }, // 进入游戏
        { dataUrl: 'https://xcx-album-img.duomai.com/ccl_2.mp3' }, // 答题正确
        { dataUrl: 'https://xcx-album-img.duomai.com/ccl_3.mp3' }, // 答题错误
        { dataUrl: 'https://xcx-album-img.duomai.com/ccl_4.mp3' }, // 对战胜利
        { dataUrl: 'https://xcx-album-img.duomai.com/ccl_5.mp3' }, // 对战失败
        { dataUrl: 'https://xcx-album-img.duomai.com/ccl_6.mp3' }, // 平局
        { dataUrl: 'https://xcx-album-img.duomai.com/ccl_7.mp3' }, // 领取金币
      { dataUrl: 'https://xcx-album-img.duomai.com/ccl_8.mp3' } // 段位升级
      ])
      // player.start()
      // player.invoke(6)
    },
    getClientUserInfo(){
      var _this=this;
      app.req.getUserInfo().then(res => {
        //console.log(res)
        this.setData({ userInfo: res.userInfo });
        app.req.updateUserInfo(res.userInfo)
      }).catch(err => {
        console.log(err)
        let userInfo = {
          nickName: '未知',
          avatarUrl: '../../img/normal.png',
          city: '未知'
        }
        this.setData({ userInfo: userInfo});
        app.globalData.userInfo = userInfo;
        var success=function(){
          wx.openSetting({
            success: (res) => {
              app.req.getUserInfo().then(res => {
                _this.setData({ userInfo: res.userInfo });
                app.globalData.userGameInfo = res.userInfo;
                app.req.updateUserInfo(res.userInfo)
                console.log(res.userInfo,1111)
              })
            }
          })
        }
        this.showInfo('请先授权',success);
      })
    },
    onShow() {
      if (app.req.socketConnect) {
        app.req.socketConnect.close({
          success: function (res) {
            console.log(res)
          }
        })
      }
      this.loadInit();
    },
    loadInit(plus){
      app.req.login().then(res => {
        app.req.userInfo().then(res => {
          if (res.f == 1) {
            let data = res.d;
            this.setData({ indexUserinfo: data });
            
            app.globalData.userGameInfo = data;
            this.setData({ truePreTime: res.d.LastCoinTime});
          }
        })
        app.req.challenge().then(res => {
          console.log(res)
          if (res.f == 1) {
            this.setData({ onlinePerson: res.d.num })
          }
        })
        this.timeInit();
      })
    },
    timeInit(){
      app.req.coinLogs(1).then(res => {
        //console.log(res, 123);
        if (res.f == 1) {//成功拿到数据
          clearInterval(interval);
          if (!res.d.Results.length) {
            this.setData({
              width: 'width:107rpx;border-top-right-radius:12.15rpx;border-bottom-right-radius:12.15rpx;',
              coin: 60
            })
            return 0
          }
          let oldTime = this.data.truePreTime;
          // let arr1 = oldTime.split(/-| |:/);
          // let str = arr1[0]+'/'+arr1[1]+'/'+arr1[2]+' '+arr1[3]+'/'+arr1[4]+'/'+arr1[5]
          let str = oldTime.replace(/-/g, "/");
          var time = new Date(str).valueOf();
          var now = new Date().valueOf();
          this.setData({ preTime: time });
          if (now - time >= 4 * 60 * 60 * 1000) {
            //console.log('可以领取了');
            this.setData({
              width: 'width:107rpx;border-top-right-radius:12.15rpx;border-bottom-right-radius:12.15rpx;',
              coin: 60
            })
          } else {
            this.intervalF();
            //console.log('不可领取');
          }
        }
      })
    },
    intervalF(){
      if (new Date().valueOf() - this.data.preTime >= 4 * 60 * 60 * 1000) {
        clearInterval(interval);
        this.setData({
          width: 'width:107rpx;border-top-right-radius:12.15rpx;border-bottom-right-radius:12.15rpx;',
          coin: 60,
          time: '00:00'
        })
      } else {
        //计算长度 
        let now = new Date().valueOf();
        let num = (now - this.data.preTime) / (4 * 60 * 60 * 1000);
        let width = parseInt(107 * num);
        let coin = parseInt(60 * num);

        let futureTime = this.data.preTime + 4 * 60 * 60 * 1000;
        let dao = futureTime - now;

        let shi = '' + 0 + parseInt(dao / (1 * 60 * 60 * 1000));
        let count = parseInt(dao / (60 * 1000) % 60);
        let fen =count<10?''+0+count:count;
        this.setData({
          width: `width:${width}rpx`,
          coin: coin,
          time: shi + ':' + fen
        })
      }
    },
    gogogo(){
      this.jump('../game/game?step=1&userid=' + this.data.indexUserinfo.UserID);
    },
    //功能函数
    getCoin(){
      //console.log(12344);
      player.invoke(6);
      app.req.coinGet(1).then(res => {
        //console.log(res)
        if (res.f === 1) {
          //indexUserinfo.Coin
          let info = this.data.indexUserinfo;
          info.Coin = parseInt(info.Coin) + parseInt(res.d.Coin);
          this.setData({ indexUserinfo: info })
          this.loadInit();
        }
        this.showInfo(res.m);
      }).then(()=>{
        //初始化 函数
      })
    },
    //信息提示 
    /**
     * param1: dom事件e 或者传入的参数
     * param2: 回调函数
    */
    showInfo(e,success = function(){console.log(123)}){
      try{
        var info = e.target.dataset.info || '信息加载错误';
      }catch(err){
        var info = e || '信息加载错误';
      }
      wx.showModal({
        title: '温馨提示',
        content: info,
        showCancel:false,
        success: success
      })
    },
    //游戏操作函数
    play(e){
      var id = e.target.dataset.state;
      //console.log(id)
      switch (id){
        case '1':
          // player.invoke(0);
          this.jump('../mygrade/mygrade');
          //../game/game?step=1
          break
        case '2':
          
          break
        case '3':
          this.jump('../rank/rank');
          break
        case '4':
          this.jump('../personal/personal');
          break 
        case '5':
          this.jump('../question/question');
          break        
        default:
          console.log(id);    
      }
    },
    //跳转函数
    jump(url){
      let webUrl =url;
      wx.navigateTo({
        url: webUrl
      })
    },
    //授权登录
    /**
     * 分享相关
     *
     * */
    onShareAppMessage: function (res) {
        let userid = this.data.indexUserinfo.UserID
        let success = (res) => {console.log(res)}
        console.log(app.globalData.userGameInfo)
        if (res.from === 'button') {
          success = (res) => {
            let levelName = app.globalData.userGameInfo.LevelName;
            let level = app.globalData.userGameInfo.Level;
            let id = app.globalData.userGameInfo.UserID
            wx.navigateTo({
              url: `../game/game?step=2&userid=self&levelName=${levelName}&level=${level}`
            })
          }
        }
        return {
            title: '成语猜猜乐-邀你对战',
            path: 'pages/game/game?step=2&userid=' + userid,
            success: success,
            fail: function (res) {
                // 转发失败
            }
        }
    },
})
