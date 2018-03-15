//index.js
//获取应用实例
const app = getApp()

Page({
  data: {
    userInfo: { nickName: '姓名' },//用户信息
    active:['active',''],
    //游戏相关
    type:1,  //当前榜单的种类
    rank:[],//朋友榜单
    nowpage:1,//当前的页面数
    TotalCount:1,//总记录

    num:1,//当前的页面
  },
  onLoad() {
    this.getRank();
  },
  onShow() {
    
  },  
  //功能函数
  //清空榜单
  rankInit(){
    this.setData({
      rank:[],
      nowpage:1,
      TotalCount:1
    });
  },
  getRank(e){
    var num = e&&e.target.dataset.state||this.data.num;
    num&&this.setData({num:num});
    num==1?this.setData({ active: ['active', ''] }):this.setData({ active: ['', 'active'] });
    this.data.type != num &&this.setData({type:num});
    e&&this.rankInit();
    //console.log(num)
    app.req.userRank(num,this.data.nowpage,10).then(res=>{
      if(res.f==1){
        this.setData({ 
          rank: this['data']['rank'].concat(res.d.Results),
          nowpage:++res.d.Page,
          TotalCount: res.d.TotalCount
        })
      }
    })
  },
  addMore(){
    console.log(this.data.nowpage * 10 , this.data.TotalCount)
    if ((this.data.nowpage-1) * 10 > this.data.TotalCount){
      return false; 
    }else{
      this.getRank();
    }
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
      path: 'pages/index/index',
      success: function (res) {

      },
      fail: function (res) {
        // 转发失败
      }
    }
  },
})
