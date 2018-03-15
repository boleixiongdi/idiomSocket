// pages/personal/personal.js
var app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    userInfo: { nickName: '姓名', level: 1 },//用户信息
    switch:1,
    active:['active',''],
    userHistory:{}, //玩家信息

    barShow:1,//显示的bar
    coinShow:1,//金币展示

    userBar:'',
    historyBar:[],
    coinHistory:[],
    barHeight: "height:120rpx;",
    coinheight: "height:120rpx;",
    idclick:0,

    nowpage:1, //当前的页面
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.loadUserHistory();
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
  
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
  
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
  
  },

  loadUserHistory(){
    app.req.userLife().then(res=>{
      if(res.f==1){
        this.setData({userHistory:res.d});
      }
    })
    
  },
  loadCoinHistory(){
    app.req.coinLogs(1, this.data.nowpage).then(res => {
      console.log(res, 123);
      if (res.f == 1) {//成功拿到数据
        this.setData({
          coinHistory: this['data']['coinHistory'].concat(res.d.Results),
          nowpage: ++res.d.Page,
        })
        //console.log(this.data.nowpage)
      }
    })
  },
  heightInit(){
    this.setData({
      barHeight: "height:120rpx;",
      coinheight: "height:120rpx;"
    })
  },
  //事件函数
  changeActive(e){
    var id = e.target.dataset.state;
    this.heightInit();
    id==1?this.setData({active:['active',''],switch:id}):this.setData({active:['','active'],switch:id});
    if (id == 2 && !this.data.userBar) {
      app.req.announces().then(res => {
        if(res.f==1){
          this.setData({ historyBar:res.d});
        }
      })
      this.loadCoinHistory();
    }
  },
  watchDetail(e){
    var id = e.target.dataset.state;
    console.log(id==this.data.idclick)
    // if (id == this.data.idclick){
    //   this.heightInit();
    //   return 0;
    // }
    this.setData({
      idclick:id,
    })
    //console.log(id);
    if(id == 1){
      this.setData({
        //barShow: !this.data.barShow,
        //coinShow: 0,
        barHeight:"height:398rpx;",
        coinheight: "height:120rpx;"
      })
    }else{
      this.setData({
        //barShow: 0,
        //coinShow: !this.data.coinShow,
        barHeight: "height:120rpx;",
        coinheight: "height:398rpx;",
      })
    }
  },
  relive(){
    app.req.coinGet(2).then(res => {
      if(res.f==1){
        let userInfo = this.data.userInfo;
        let userHistory = this.data.userHistory;
        userInfo['Coin'] = userHistory.Coin = parseInt(this.data.userHistory.Coin)+60;
        this.setData({ userInfo: userInfo, userHistory: userHistory});
      }
      this.showInfo(res.m);
    })
  },
  showInfo(info) {
    wx.showToast({
      title: info,
      icon: 'none',
      duration: 2000
    })
  },
  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
  
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
  
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
  
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
  
  }
})