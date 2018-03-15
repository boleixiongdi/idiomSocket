// pages/game/game.js
import { connectSocket } from "../../lib/ws.js";
import { config } from "../../lib/config.js";
import Player from '../../lib/player.js'
var player = new Player()
const app = getApp();
var animationTimeout = null; // 定时器
var animationInTimeout = null; // 定时器
var waitTimeout = null; // 定时器
var heartTimeout = null; // 定时器
//创建并返回绘图上下文context对象。
var ctx = wx.createCanvasContext("canvasArcCir");
var cxt_arc = wx.createCanvasContext("canvasCircle");

Page({
  /**
   * 页面的初始数据
   */
  data: {
    UserID: "",
    Token: "",
    RoomID: "",
    RoomType: "1", //friends 1 ranked02
    winType: 1, // 游戏结果 1胜利 2失败
    friendID: "",
    userInfo: "",
    myCoin: "+50",
    myScore: 0,
    loadFromPre:{},
    upgradeLevel: "百里秀才",
    otherCoin: "+0",
    otherScore: 0,
    otherUserInfo: {
      nickName: "未知",
      avatarUrl: "../../img/normal.png",
      city: "未知"
    },
    leave: "", // 头像上滑
    pkAnimationDisplay: false, // pk 开屏动画
    step: 0, // 加载动画
    time: 10, // 倒计时
    progress: 0, // 游戏进度
    progressStr: ["一", "二", "三", "四", "五"], // 游戏进度中文字符串
    typeStr: {
      "1": "看图猜成语",
      "2": "看释义选成语",
      "3": "看成语选释义",
      "4": "成语找茬（错别字）"
    }, // 游戏类型中文字符串
    answerIndex: {
      D1: "0",
      D2: "1",
      D3: "2",
      D4: "3"
    }, // 游戏类型中文字符串
    currentIndex: "", // 当前题选项
    currentResult: "", // 当前题结果
    currentIsWrong: "", // 当前题对错
    otherIndex: "", // 对方当前题选项
    otherResult: "", // 对方当前题结果
    otherIsWrong: "", // 对方当前题对错
    tmpScore: 0, // 临时分数
    currentOptionsStatus: {
      // 当前题状态
      0: {
        color: "",
        position: ""
      },
      1: {
        color: "",
        position: ""
      },
      2: {
        color: "",
        position: ""
      },
      3: {
        color: "",
        position: ""
      }
    },
    imgWords: ["", "", "", ""],
    imgQuestions: {},
    resultDisplay: false, // 游戏结果
    maskDisplay: true, // 弹出框
    animation: {}, // 弹出框
    questionsList: [
      {
        Type: "1",
        Guess: {
          Question:
            "http://xcx-album-img.duomai.com/ec0aa5928bdfcba768f55f1e69a78097",
          Answers: {
            Answers: {
              D1: "料事如神",
              D2: "绘声绘色",
              D3: "字正腔圆",
              D4: "五音不全"
            },
            CorrectAnswer: "D4"
          }
        }
      },
      {
        Type: "2",
        Guess: {
          Question:
            "【不同的曲调演得同样好。比喻话的说法不一而用意相同，或一件事情的做法不同而都巧妙地达到目的】指的是下面哪个成语？ ",
          Answers: {
            Answers: {
              D1: "异曲同工",
              D2: "一天到晚",
              D3: "一心一意",
              D4: "一日三秋"
            },
            CorrectAnswer: "D1"
          }
        }
      },
      {
        Type: "4",
        Guess: {
          Question: "请从下列中选出有错别字的成语",
          Answers: {
            Answers: {
              D1: "动人心弦",
              D2: "欣喜若狂",
              D3: "万马奔腾",
              D4: "欢胜雷动"
            },
            CorrectAnswer: "D4"
          }
        }
      },
      {
        Type: "4",
        Guess: {
          Question: "请从下列中选出有错别字的成语",
          Answers: {
            Answers: {
              D1: "动人心弦",
              D2: "欣喜若狂",
              D3: "万马奔腾",
              D4: "欢胜雷动"
            },
            CorrectAnswer: "D4"
          }
        }
      },
      {
        Type: "3",
        Guess: {
          Question: "欢声雷动",
          Answers: {
            Answers: {
              D1: "拨动,激动人心,比作,形容,事物",
              D2:
                "示例,全班同学,极点,欣喜,第一名,庆祝,形容,快乐,同学,好象,失去,高兴,取得,控制",
              D3: "声势浩大,形容,热烈,气氛,进展,迅速",
              D4: "欢笑的声音象雷一样响着。形容热烈欢呼的动人场面。  "
            },
            CorrectAnswer: "D4"
          }
        }
      },
      {
        Type: "4",
        Guess: {
          Question: "请从下列中选出有错别字的成语",
          Answers: {
            Answers: {
              D1: "动人心弦",
              D2: "欣喜若狂",
              D3: "万马奔腾",
              D4: "欢胜雷动"
            },
            CorrectAnswer: "D4"
          }
        }
      },
      {
        Type: "1",
        Guess: {
          Question:
            "http://xcx-album-img.duomai.com/ec0aa5928bdfcba768f55f1e69a78097",
          Answers: {
            Answers: {
              D1: "料事如神",
              D2: "绘声绘色",
              D3: "字正腔圆",
              D4: "五音不全"
            },
            CorrectAnswer: "D4"
          }
        }
      },
      {
        Type: "1",
        Guess: {
          Question:
            "http://xcx-album-img.duomai.com/ec0aa5928bdfcba768f55f1e69a78097",
          Answers: {
            Answers: {
              D1: "料事如神",
              D2: "绘声绘色",
              D3: "字正腔圆",
              D4: "五音不全"
            },
            CorrectAnswer: "D4"
          }
        }
      }
    ]
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    // console.log(options);
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
    let loadFromPre ={
      coin: options.coin,
      levelName: options.levelName
    };
    this.setData({loadFromPre:loadFromPre});
    app.req
      .getUserInfo()
      .then(res => {
        console.log(res);
        this.setData({ userInfo: res.userInfo });
        this.start(options);
      })
      .catch(err => {
        console.log(err);
        let userInfo = {
          nickName: "未知",
          avatarUrl: "../../img/normal.png",
          city: "未知"
        };
        this.setData({ userInfo: userInfo });
        this.start(options);
      });
    // console.log(app.globalData.userInfo)
    console.log(options);
    // 注册 socket 钩子
    this.socketRegister();

    // this.solveList(this.data.questionsList)
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function(options) {
    this.drawTimeBg();
  },
  // 开始运行逻辑
  start: function(options) {
    if (options.step == 1) {
      this.setData({
        step: 1,
        RoomType: options.level ? "ranked" + options.level : "ranked1"
      });
      this.connect();
      // app
      //   .delay(1000)
      //   .then(res => {
      //     this.setData({
      //       otherUserInfo: this.data.userInfo,
      //       RoomID: "1",
      //       leave: "leave",
      //       pkAnimationDisplay: true
      //     });
      //     wx.vibrateLong();
      //     return app.delay(1700);
      //   })
      //   .then(res => {
      //     this.setData({
      //       pkAnimationDisplay: false,
      //       step: 3
      //     });
      //     this.drawTimeAnimation();
      //   });
    } else if (options.step == 2) {
      this.setData({
        step: 2,
        RoomType: "friends",
        friendID: options.userid
      });
      if (options.userid && options.userid !== "self"){
        app.req.login().then(res => {
          let UserID = res.UserID
          return app.req.makeFriends(UserID, options.userid)
        })
      }
      this.connect();
    }
  },
  // 注册 socket 钩子
  socketRegister: function() {
    wx.onSocketOpen(res => {
      console.log("open");
      console.log(res);
      this.send({
        Type: "login",
        AppKey: config.appid,
        Data: {
          Token: this.data.Token,
          UserID: this.data.UserID,
          city: this.data.userInfo.city,
          avatarUrl: this.data.userInfo.avatarUrl,
          nickName: this.data.userInfo.nickName
        }
      });
      this.heart()
    });

    wx.onSocketError(res => {
      console.log("error");
      console.log(res);
    });

    wx.onSocketMessage(res => {
      console.log("接收数据");
      console.log(res);
      this.solveMsg(JSON.parse(res.data));
    });

    wx.onSocketClose(function (res) {
      console.log('WebSocket 已关闭！')
    });
  },
  // socket 心跳包
  heart: function() {
    clearTimeout(heartTimeout);
    heartTimeout = setTimeout(res => {
      this.send({
        Type: "ping",
        AppKey: config.appid,
        Data: {
          UserID: this.data.UserID
        }
      });
    }, 10000);
  },
  // socket 连接
  connect: function(e) {
    console.log('RoomType')
    console.log(this.data.RoomType)
    app.req.login().then(res => {
      this.setData({
        UserID: res.UserID,
        Token: res.Token
      });
      this.connectSocket(res.Token, res.UserID, function(res) {
        console.log(res);
      });
    });
  },
  // connect socket
  connectSocket: function (Token, UserID, cb, shareid = '') {
    app.req.socketConnect = wx.connectSocket({
      url: `${config.socketHost}`,
      data: {
        Type: "login",
        AppKey: config.appid,
        Data: {
          Token: Token,
          UserID: UserID,
          shareid: shareid
        }
      },
      header: {
        'content-type': 'application/json'
      },
      method: "GET",
      success: function (res) {
        cb(res)
      },
      fail: function (err) {
        console.log(err)
      }
    })
  },
  // 向服务端发送 socket 消息
  send: function(data) {
    console.log("发送数据");
    console.log(data);
    wx.sendSocketMessage({ data: JSON.stringify(data) });
  },
  // 关闭 socket 连接
  close: function() {
    wx.closeSocket(function(res) {
      console.log("close");
      console.log(res);
    });
  },
  // 处理 socket 服务端消息
  solveMsg: function(msg) {
    console.log(msg);
    switch (msg.Type) {
      case "loginSuccess":
        this.solveLoginSuccess(msg);
        break;
      case "loginError":
        this.solveLoginError(msg);
        break;
      case "matchSuccess":
        this.solveMatchSuccess(msg);
        break;
      case "question":
        this.solveQuestion(msg);
        break;
      case "matchAnswer":
        this.solveMatchAnswer(msg);
        break;
      case "nextAnswer":
        this.solveNextAnswer(msg);
        break;
      case "matchExit":
        this.solveMatchExit(msg);
        break;
      case "matchFail":
        this.solveMatchFail(msg);
        break;
      case "resultAnswer":
        this.solveResultAnswer(msg);
        break;
      case "friendNotOnline":
        this.solveFriendNotOnline(msg);
        break;
      case "getPlayUserSetKey":
        this.solveGetPlayUserSetKey(msg);
        break;
      case "pong":
        this.solvePong(msg);
        break;
      default:
        console.log("Sorry, we are out of " + msg + ".");
    }
  },
  solveLoginSuccess: function(msg) {
    if (this.data.RoomType !== "friends") {
      waitTimeout = setTimeout(res => {
        this.send({
          Type: "waitMatchTimeout",
          AppKey: config.appid,
          Data: {
            RoomType: this.data.RoomType
          }
        });
      }, 2000);
    }
    let CreateUserID = this.data.UserID;
    if (this.data.friendID && this.data.friendID !== "self") {
      CreateUserID = this.data.friendID;
    }
    this.send({
      Type: "intoHall",
      AppKey: config.appid,
      Data: {
        CreateUserID: CreateUserID,
        RoomType: this.data.RoomType
      }
    });
  },
  solveLoginError: function(msg) {
    console.log("登录失败");
    console.log(msg);
    wx.showModal({
      title: "提示",
      content: "连接失败，请返回重试",
      showCancel: false,
      confirmColor: "#FC5341",
      success: function(res) {
        if (res.confirm) {
          wx.navigateBack();
        }
      }
    });
  },
  solveMatchSuccess: function(msg) {
    if (waitTimeout) clearTimeout(waitTimeout);
    this.setData({
      otherUserInfo: msg.Data,
      RoomID: msg.Data.RoomID,
      leave: "leave",
      pkAnimationDisplay: true
    });
    player.invoke(0);
    wx.vibrateLong();
    app.delay(1700).then(res => {
      this.setData({
        pkAnimationDisplay: false,
        step: 3
      });
      this.drawTimeAnimation();
    });
  },
  solveQuestion: function(msg) {
    this.setData({
      questionsList: msg.Data.Question
    })
  },
  solveMatchAnswer: function(msg) {
    this.answer({
      info: "other",
      data: msg.Data
    });
  },
  solveNextAnswer: function(msg) {
    if (!this.data.currentIsWrong && !this.data.otherIsWrong && this.data.progress < 5 && this.data.progress > -1) {
      this.answer({ info: "right" });
    }
    app.delay(1000).then(res => {
      this.next();
    });
  },
  solveMatchExit: function(msg) {
    console.log("对方 退出");
    wx.showModal({
      title: "提示",
      content: "对方已放弃战斗",
      showCancel: false,
      confirmColor: "#FC5341",
      success: function(res) {
        if (res.confirm) {
          console.log("用户点击确定");
        }
      }
    });
    this.setData({
      time: 0,
      progress: -1
    });
  },
  solveMatchFail: function(msg) {
    console.log("匹配失败");
    console.log(msg);
    wx.showModal({
      title: "提示",
      content: "匹配失败，请返回重试",
      showCancel: false,
      confirmColor: "#FC5341",
      success: function(res) {
        if (res.confirm) {
          wx.navigateBack();
        }
      }
    });
  },
  solveResultAnswer: function(msg) {
    wx.hideLoading();
    console.log("得到结果");
    console.log(msg);
    let winType = msg.Data.IsWin;
    if (winType == 1) {
      player.invoke(3)
    } else {
      player.invoke(4)
    }
    if (this.data.RoomType !== "friends") {
      let myCoin = winType == 1 ? '+' : '-' ;
      myCoin += msg.Data.Coin;
      let otherCoin = winType == 1 ? '-' : '+';
      otherCoin += msg.Data.OtherCoin;
      let upgradeLevel = "";
      if (msg.Data.LevelUp == 1) {
        upgradeLevel = msg.Data.LevelName;
        this.open();
        player.invoke(7)
      }
      this.setData({
        resultDisplay: true,
        winType: winType,
        upgradeLevel: upgradeLevel,
        myCoin: myCoin,
        otherCoin: otherCoin
      });
    } else {
      this.setData({
        resultDisplay: true,
        winType: winType,
        myCoin: "+0",
        otherCoin: "+0"
      });
    }
  },
  solveFriendNotOnline: function (msg) {
    wx.showModal({
      title: "提示",
      content: msg.Data,
      showCancel: false,
      confirmColor: "#FC5341",
      success: function (res) {
        if (res.confirm) {
          console.log("用户点击确定");
          this.backGame();
        }
      }
    });
    this.setData({
      time: 0,
      progress: -1
    });
  },
  solveGetPlayUserSetKey: function (msg) {
    wx.showModal({
      title: "提示",
      content: msg.Data,
      showCancel: false,
      confirmColor: "#FC5341",
      success: function (res) {
        if (res.confirm) {
          console.log("用户点击确定");
          this.backGame();
        }
      }
    });
    this.setData({
      time: 0,
      progress: -1
    });
  },
  solvePong: function(msg) {
    this.heart();
  },
  // 画对战倒计时 底部圆环
  drawTimeBg: function() {
    cxt_arc.setLineWidth(4);
    cxt_arc.setStrokeStyle("#eaeaea");
    cxt_arc.setLineCap("round");
    cxt_arc.beginPath();
    cxt_arc.arc(20, 20, 18, 0, 2 * Math.PI, false); //画圆
    cxt_arc.stroke();
    cxt_arc.draw();
  },
  // 画某个角度
  drawArc: function(s, e) {
    ctx.setFillStyle("white");
    ctx.clearRect(0, 0, 200, 200);
    // ctx.draw();
    let x = 20;
    let y = 20;
    let radius = 18;
    ctx.setLineWidth(5);
    ctx.setStrokeStyle("#d81e06");
    ctx.setLineCap("round");
    ctx.beginPath();
    ctx.arc(x, y, radius, s, e, false);
    ctx.stroke();
    ctx.draw();
  },
  // 画对战倒计时 圆环动画 (控制游戏进度)
  drawTimeAnimation: function() {
    if (animationTimeout) {
      clearTimeout(animationTimeout);
    }
    let step = 1;
    let startAngle = 1.5 * Math.PI;
    let endAngle = 0;
    let animation_interval = 1000;
    let n = 11000 / 16;
    let animation = () => {
      if (step <= n && this.data.time > -1) {
        if (step % 63 == 0) {
          let time = --this.data.time;
          if (this.data.time > -1) {
            this.setData({ time: time });
          }
        }
        endAngle = step * 2 * Math.PI / n + 1.5 * Math.PI;
        this.drawArc(startAngle, endAngle);
        if (animationInTimeout) {
          clearTimeout(animationInTimeout);
        }
        animationInTimeout = this.requestAnimFrame(animation);
        // requestAnimationFrame(animation);
        step++;
      } else {
        console.log(step);
        // clearTimeout(animationTimeout);
        this.answer({ info: "right" });
        if (!this.data.currentResult || this.data.currentResult === "") {
          this.timeOut();
        }
        // app.delay(1000).then(res => {
        //   this.next();
        // });
      }
    };
    animationTimeout = this.requestAnimFrame(animation);
    // animationTimeout = requestAnimationFrame(animation);
  },
  // requestAnimFrame polyfill
  requestAnimFrame: function(callback) {
    return setTimeout(callback, 1000 / 60);
  },
  // 下一局开始
  next: function() {
    if (animationTimeout) {
      clearTimeout(animationTimeout);
    }
    if (this.data.progress < 4) {
      this.setData({
        time: 10,
        progress: this.data.progress + 1,
        currentIndex: "",
        currentResult: "",
        currentIsWrong: "",
        otherIndex: "",
        otherResult: "",
        otherIsWrong: "",
        tmpScore: 0,
        currentOptionsStatus: {
          0: {
            color: "",
            position: ""
          },
          1: {
            color: "",
            position: ""
          },
          2: {
            color: "",
            position: ""
          },
          3: {
            color: "",
            position: ""
          }
        }
      });
      this.drawTimeAnimation();
    } else {
      // this.setData({progress: 0});
      // 等待结果通知
      wx.showLoading();
      this.send({
        Type: "endAnswer",
        AppKey: config.appid,
        Data: {
          RoomID: this.data.RoomID
        }
      });
      this.setData({
        time: 0,
        progress: -1
      });
      // app.delay(1000).then(res => {
      //   wx.hideLoading();
      //   this.open();
      //   this.setData({
      //     resultDisplay: true,
      //     time: 0,
      //     progress: -1
      //   });
      // });
    }
  },
  // 再来一局
  againGame: function() {
    wx.redirectTo({
      url: "game?step=1"
    });
  },
  // 超时 处理
  timeOut: function() {
    let TopicID = this.data.questionsList[this.data.progress].TopicID
    this.send({
      Type: "userAnswer",
      AppKey: config.appid,
      Data: {
        Timeout: 1,
        UserID: this.data.UserID,
        RoomID: this.data.RoomID,
        TopicID: TopicID,
        Answer: "",
        Index: "",
        Type: this.data.questionsList[this.data.progress].Type,
        CostTime: 10,
        Score: 0,
        IsCorrect: 0
      }
    });
  },
  // 回答题目
  answer: function(e) {
    // 对方答题传 'other'
    console.log(e)
    let rightAnswer = this.data.questionsList[this.data.progress].Guess.Answers.CorrectAnswer;
    let TopicID = this.data.questionsList[this.data.progress].TopicID
    if (e.info && e.info === "other") {
      let answer = e.data.Answer;
      let index = e.data.Index;
      let time = e.data.CostTime;
      let multiple = this.data.progress === 4 ? 2 : 1;
      let isWrong = answer !== rightAnswer;
      let score = isWrong ? 0 : this.computeScore(this.data.time, multiple);
      let currentOptionsStatus = this.data.currentOptionsStatus;
      currentOptionsStatus[index].color = isWrong ? "wrong" : "right";
      currentOptionsStatus[index].position = "r";
      if (this.data.currentIndex && this.data.currentIndex !== "") {
        this.setData({
          otherIndex: index,
          otherResult: answer,
          otherIsWrong: isWrong,
          currentOptionsStatus: currentOptionsStatus,
          otherScore: this.data.otherScore + score
        });
      } else {
        this.setData({
          otherIndex: index,
          otherResult: answer,
          otherIsWrong: isWrong,
          tmpScore: score
        });
      }
    } else if (e.info && e.info === "right") {
      console.log(new Date())
      console.log(this.data.progress)
      let rightAnswer = this.data.questionsList[this.data.progress].Guess.Answers.CorrectAnswer;
      let index = this.data.answerIndex[rightAnswer];
      let currentOptionsStatus = this.data.currentOptionsStatus;
      currentOptionsStatus[index].color = "right";
      currentOptionsStatus[index].position = "l";
      this.setData({
        currentOptionsStatus: currentOptionsStatus
      });
    } else {
      if (this.data.currentResult && this.data.currentResult !== "") {
        return;
      }
      let answer = e.target.dataset.answer;
      let index = e.target.dataset.index;
      let isWrong = (answer !== rightAnswer);
      if (!isWrong) {
        player.invoke(1)
      } else {
        player.invoke(2)
      }
      let currentOptionsStatus = this.data.currentOptionsStatus;
      let multiple = this.data.progress === 4 ? 2 : 1;
      let score = isWrong ? 0 : this.computeScore(this.data.time, multiple);
      currentOptionsStatus[index].color = isWrong ? "wrong" : "right";
      currentOptionsStatus[index].position = "l";
      if (this.data.otherIndex && this.data.otherIndex !== "") {
        let i = this.data.otherIndex;
        currentOptionsStatus[i].color = this.data.otherIsWrong
          ? "wrong"
          : "right";
        currentOptionsStatus[i].position = "r";
      }
      this.setData({
        currentIndex: index,
        currentResult: answer,
        currentIsWrong: isWrong,
        currentOptionsStatus: currentOptionsStatus,
        myScore: this.data.myScore + score,
        otherScore: this.data.otherScore + this.data.tmpScore
      });
      this.send({
        Type: "userAnswer",
        AppKey: config.appid,
        Data: {
          Timeout: 0,
          UserID: this.data.UserID,
          RoomID: this.data.RoomID,
          TopicID: TopicID,
          Answer: answer,
          Index: index,
          Type: this.data.questionsList[this.data.progress].Type,
          CostTime: (10 - this.data.time),
          Score: score,
          IsCorrect: isWrong ? 0 : 1
        }
      });
    }
  },
  // 计算分数
  computeScore: function(time, multiple) {
    let score = 200 - (10 - time) * 20;
    return score * multiple;
  },
  // 弹出框开启
  close: function(e) {
    this.animation = wx.createAnimation({
      duration: 100,
      timingFunction: "ease-in-out"
    });
    this.animation
      .scale3d(0.9, 0.9, 0.9)
      .step()
      .opacity(1)
      .scale3d(1.3, 1.3, 1.3)
      .step()
      .opacity(0)
      .scale3d(0.3, 0.3, 0.3)
      .step();
    this.setData({ animation: this.animation.export() });
    setTimeout(() => {
      this.animation = "";
      this.setData({
        maskDisplay: true,
        animation: {}
      });
    }, 400);
  },
  // 弹出框关闭
  open: function() {
    this.setData({
      maskDisplay: false
    });
  },
  // 回到首页
  backGame: function() {
    wx.redirectTo({
      url: "../index/index"
    });
  },
  // 处理 type = 1 的题数据
  solveList: function(data) {
    let imgQuestions = {};
    data.map(function(item, index) {
      if (item.Type == "1") {
        let tmp = item.Guess.Answers;
        let num = 0;
        let str = "";
        let arry = [];
        if (tmp.CorrectAnswer == "D4") {
          str += tmp.Answers.D1 + tmp.Answers.D2 + tmp.Answers.D4;
        } else {
          str += tmp.Answers.D1 + tmp.Answers.D2 + tmp.Answers.D3;
        }
        arry = str.split("").sort(function() {
          return 0.5 - Math.random();
        });
        imgQuestions[index] = arry;
      }
      return item;
    });
    this.setData({ imgQuestions: imgQuestions });
  },
  // 看图填空  选字
  choose: function(e) {
    if (this.data.imgWords.indexOf("") === -1) {
      return;
    }
    let arrayTmp = this.data.imgWords;
    let imgQuestions = this.data.imgQuestions;
    let index = e.target.dataset.index;
    let question = imgQuestions[this.data.progress];
    let word = question[index];
    if (word === "") {
      return;
    }
    question.splice(index, 1, "");
    imgQuestions[this.data.progress] = question;
    arrayTmp[arrayTmp.indexOf("")] = { index: index, word: word };
    this.setData({
      imgWords: arrayTmp,
      imgQuestions: imgQuestions
    });
  },
  // 看图填空 还原字
  back: function(e) {
    let arrayTmp = this.data.imgWords;
    let imgQuestions = this.data.imgQuestions;
    let index = e.target.dataset.index;
    let wordIndex = e.target.dataset.wordindex;
    let question = imgQuestions[this.data.progress];
    let word = arrayTmp[index].word;
    arrayTmp.splice(index, 1, "");
    question.splice(wordIndex, 1, word);
    imgQuestions[this.data.progress] = question;
    this.setData({
      imgWords: arrayTmp,
      imgQuestions: imgQuestions
    });
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function(res) {
    if (res.from === "button") {
      console.log(res);
    }
    return {
      title: "我已经取得胜利，邀你来战。成语猜猜乐-对战版",
      path: "pages/index/index",
      success: function(res) {},
      fail: function(res) {
        // 转发失败
      }
    };
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
    this.close();
    this.setData({ leave: "" });
    clearTimeout(animationTimeout);
    clearTimeout(animationInTimeout);
    clearTimeout(waitTimeout);
    clearTimeout(heartTimeout);
  },
  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function() {
    this.close();
    clearTimeout(animationTimeout);
    clearTimeout(animationInTimeout);
    clearTimeout(waitTimeout);
    clearTimeout(heartTimeout);
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {},

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function() {},

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {}
});
