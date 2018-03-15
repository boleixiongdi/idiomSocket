//index.js
//获取应用实例
const app = getApp()

Page({
  data: {
    userInfo: { nickName: '姓名',level:1},//用户信息
    //游戏相关
    step: 1,//当前游戏进度 1加载信息  2游戏loading  3 游戏界面
    levellist:[],//等级列表
    nextlevellist:[],//下一个等级的列表
    levelnum: ['Ⅰ','Ⅱ','Ⅲ','Ⅳ','Ⅴ','Ⅵ','Ⅶ','Ⅷ','Ⅸ','Ⅹ','Ⅺ','Ⅻ'],
    starnum:[],//星星数量
    nowstar:[],//当前段位的星星数量
  },
  onLoad() {
    this.setData({ userInfo: app.globalData.userGameInfo});//加载个人信息
    this.getLevels();
  },
  onShow() {
    if (app.req.socketConnect) {
      app.req.socketConnect.close({
        success: function (res) {
          console.log(res)
        }
      })
    }
  },
  goGame() {
    wx.navigateTo({
      url: '../game/game?step=1'
    })
  },
  //功能函数
  goToplay(e){
    var coin = e.currentTarget.dataset.coin || 30;
    var grade = e.currentTarget.dataset.grade;
    var levelName = e.currentTarget.dataset.levelname;
    //console.log(app.globalData.userGameInfo);
    // let levelName = app.globalData.userGameInfo.LevelName;
    wx.navigateTo({
      url: `../game/game?step=1&levelName=${levelName}&level=${grade}&coin=${coin}`
    })
  },
  getLevels(){
    var mylevel = parseInt(this.data.userInfo.Level)+1;//我的等级
    app.req.levels().then(res=>{
      if(res.f == 1){
        var star = [];
        var str = 'abcdrfghijklmnopqrstuvwxyz';
        var nowStar = [];
        for (var key in res.d) {
          if (key < mylevel) {
            let num = res.d[key].Stars;
            star.push(str.slice(0, num));
          }
          if (key == (mylevel - 2)) {
            nowStar.push(str.slice(0, this.data.userInfo.Stars));
            nowStar.push(str.slice(0, res.d[key].Stars - this.data.userInfo.Stars));
          }
        }
        console.log(this.data.levellist)
        this.setData({ 
          levellist: res.d.slice(0, mylevel-1),
          nextlevellist: res.d.slice(mylevel - 1, mylevel),
          starnum:star,
          nowstar: nowStar
        });
      }
    })
  },

  /**
   * 分享相关
   *
   * */
  onShareAppMessage: function (res) {
    if (res.from === 'button') {
      // 来自页面内转发按钮
      //console.log(res.target)
    }
    return {
      title: '成语猜猜乐-邀你对战',
      path: 'pages/index/index?share=1',
      success: function (res) {

      },
      fail: function (res) {
        // 转发失败
      }
    }
  },
})
