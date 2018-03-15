// 常用请求封装
import {
  loginPromisify,
  requestPromisify,
  getUserInfoPromisify,
  setClipboardDataPromisify,
  getStoragePromisify,
  getSettingPromisify
} from "Promisify.js";

import { config } from "config.js";

let url = {
  common: {
    login: `${config.commonHost}/xcx/login`,
    submitFormId: `${config.commonHost}/xcx/saveformid`,
    config: `${config.commonHost}/xcx/get-config`,
    pay: `${config.commonHost}/xcxpay/pay`,
    upUserinfo: `${config.commonHost}/xcx/update-user`
  },
  yewu: {
    coinGet: `${config.newhost}/coin/get`,
    coinLogs: `${config.newhost}/coin/logs`,
    guessGet: `${config.newhost}/guess/get`,
    guessComplete: `${config.newhost}/guess/complete`,
    userInfo: `${config.newhost}/user/info`,
    userRank: `${config.newhost}/user/rank`,
    userLife: `${config.newhost}/user/life`,
    makeFriends: `${config.newhost}/user/makefriends`,
    levels: `${config.newhost}/system/levels`,
    announces: `${config.newhost}/system/announces`,
    challenge: `${config.newhost}/system/onlineuser`,

    list: `${config.host}/gatherimg/listimglist`,
    banner: `${config.host}/gatherimg/bannerimg`,
    pic: `${config.host}/guess/index`,
    testAnswer: `${config.host}/guess/answer`,
    rank: `${config.host}/guess/ranking`,
    next_word: `${config.host}/guess/next`,
    share: `${config.host}/guess/share`
  },
  test: "https://api.github.com/search/repositories"
};

module.exports = {
  /**
   * 登录方法，先取出本地 Token 检查是否过期，过期的情况下才进行 login
   * 约定：  登陆后获取到用户信息 均存储在 storage 中： {'userClient': data}
   *        data 为 object： {Expire: 1, Token: '', UserID: ''}
   * 返回： 该方法返回 登录接口返回的信息 即含有 Token、UserID 等
   */
  login: function() {
    return getStoragePromisify({ key: "userClient" })
      .then(res => {
        if (
          res.data.Token &&
          res.data.Expire &&
          new Date().getTime() < res.data.Expire * 1000
        ) {
          throw {
            code: 1,
            msg: "Token 存在且未过期,无需 login",
            data: res.data
          };
        }
      })
      .then(loginPromisify)
      .then(res => {
        if (res.code) {
          return requestPromisify({
            url: url.common.login,
            method: "POST",
            data: {
              code: res.code
            },
            header: {
              cookie: `AppKey=${config.appid}`
            }
          });
        } else {
          console.log("用户 login 失败！");
          throw res.errMsg;
        }
      })
      .then(res => {
        // console.log(res)
        if (res.f === 1) {
          // res.d: {Token: '', UserID: ''}
          wx.setStorage({
            key: "userClient",
            data: res.d
          });
          return res.d;
        } else {
          console.log("登录失败");
        }
      })
      .catch(err => {
        if (err.code) {
          return err.data;
        } else {
          console.log(err);
        }
      });
  },
  /**
   * 登录方法增加 userInfo 参数(授权登录)
   * return: 1 已授权且登陆成功， 0 未授权， 2 已授权登录失败
   */
  loginWithUserinfo: function() {
    //  console.log(1)
    return this.getSetting('scope.userInfo').then(res => {
      if (!res) {
        // 未授权拿不到信息 返回false
        return 0;
      } else {
        // console.log(2)
        let promises = [
          loginPromisify().catch(err => {
            console.log(err);
          }),
          getUserInfoPromisify().catch(err => {
            console.log(err);
          })
        ];
        return Promise.all(promises)
          .then(res => {
            // console.log(3)
            let loginRes = res[0];
            let userInfoRes = res[1];
            // console.log(res[0].code)
            // console.log(res[1])
            if (
              loginRes &&
              loginRes.code &&
              userInfoRes &&
              userInfoRes.userInfo
            ) {
              return requestPromisify({
                url: url.common.login,
                method: "POST",
                data: {
                  code: loginRes.code,
                  nickName: userInfoRes.userInfo.nickName || "",
                  avatarUrl: userInfoRes.userInfo.avatarUrl || ""
                },
                header: {
                  cookie: `AppKey=${config.appid}`
                }
              });
            }
          })
          .then(res => {
            // console.log(res)
            if (res.f === 1) {
              // console.log(4)
              // res.d: {Expire: 1, Token: '', UserID: ''}
              wx.setStorage({
                key: "userClient",
                data: res.d
              });
              return 1;
            } else {
              console.log("登录失败");
              return 2;
            }
          })
          .catch(err => {
            console.log(err);
          });
      }
    });
  },
  /**
   * 上传 formId
   * @param {* formId} formId
   * @param {* 1: 普通, 2: 支付} type
   */
  submitFormId: function(formId, type = 1) {
    this.login()
      .then(res => {
        let Token = res.Token;
        return requestPromisify({
          url: url.common.submitFormId,
          method: "POST",
          data: {
            formid: formId,
            type: type
          },
          header: {
            cookie: `AppKey=${config.appid};Token=${Token}`
          }
        });
      })
      .catch(err => {
        console.log(err);
      });
  },
  /**
   * 微信支付(需登录)
   * @param {* 支付金额} fee
   * @param {* 支付来源 对应某条数据 id，如灯 id} from 非必填
   */
  pay: function (fee, from = '') {
    return this.login().then(res => {
      let Token = res.Token
      return requestPromisify({
        url: url.common.pay,
        data: {
          name: '打赏',
          fee: fee,
          from: from
        },
        header: {
          cookie: `AppKey=${config.appid};Token=${Token}`
        }
      })
    }).then(res => {
      let prepay_id = res.package.split('prepay_id=')
      if (prepay_id.length >= 2) {
        prepay_id = prepay_id[1]
        this.submitFormId(prepay_id, 2)
      }
      return requestPaymentPromisify({
        timeStamp: res.timeStamp,
        nonceStr: res.nonceStr,
        package: res.package,
        signType: res.signType,
        paySign: res.paySign
      })
    })
  },
  /**
   * 请求 当前小程序 配置文件
   */
  getConfig: function() {
    return requestPromisify({
      url: url.common.config,
      header: {
        cookie: `AppKey=${config.appid}`
      }
    });
  },
  /**
   * 获取用户 是否授权 某项功能 如：获取用户信息授权情况--getSetting('scope.userInfo').then(res => {console.log(res)})
   * @param {* 某项功能对应代码} auth  具体对应代码参考 scope列表： https://mp.weixin.qq.com/debug/wxadoc/dev/api/authorize-index.html
   * return: true 已授权， false 未授权
   */
  getSetting: function (auth) {
    return getSettingPromisify().then(res => {
      // console.log(res)
      if (res.authSetting[auth]) {
        return true
      } else {
        return false
      }
    })
  },
  /**
   * 获取用户 头像 昵称 等信息（wx.getUserInfo 的 promise 封装）
   */
  getUserInfo: getUserInfoPromisify,
  /**
   * 更新 头像 昵称 等信息（wx.getUserInfo 的 promise 封装）
   */
  updateUserInfo: function (user) {
    return this.login().then(res => {
      let Token = res.Token;
      return requestPromisify({
        url: url.common.upUserinfo,
        data: {
          nickName: user.nickName,
          gender: user.gender,
          avatarUrl: user.avatarUrl,
          city: user.city,
          province: user.province,
          country: user.country,
        },
        header: {
          cookie: `AppKey=${config.appid};Token=${Token}`
        }
      });
    });
  },
  // --------------------------------------------------------
  // 以下写业务 API 调用，调用后需要自己按照 Promise 用法写 catch
  // 新版业务
  /**
   * 领取金币
   * @param {* 1: 每4小时领取60, 2: 领取复活金币100, 3: 初始用户领取200,} type
   */
  coinGet: function(type) {
    return this.login().then(res => {
      let Token = res.Token;
      return requestPromisify({
        url: url.yewu.coinGet,
        data: {
          type: type,
        },
        header: {
          cookie: `AppKey=${config.appid};Token=${Token}`
        }
      });
    });
  },
  /**
   * 金币记录列表
   * @param {* 1: 所有, 2: 充值} type
   * @param {* 页码} page
   * @param {* 每页数量} pagesize
   */
  coinLogs: function(type, Page = 1, Pagesize = config.pagesize) {
    return this.login().then(res => {
      let Token = res.Token;
      return requestPromisify({
        url: url.yewu.coinLogs,
        data: {
          type: type,
          Page: Page,
          Pagesize: Pagesize
        },
        header: {
          cookie: `AppKey=${config.appid};Token=${Token}`
        }
      });
    });
  },
  /**
   * 获取题目列表
   * @param {* 段位 } level
   */
  guessGet: function(level) {
    this.login().then(res => {
      let Token = res.Token;
      return requestPromisify({
        url: url.yewu.guessGet,
        data: {
          level: level
        },
        header: {
          cookie: `AppKey=${config.appid};Token=${Token}`
        }
      });
    });
  },
  /**
   * 提交比赛结束信息
   * @param {* 具体参数看接口文档 } data
   */
  guessComplete: function(data) {
    this.login().then(res => {
      let Token = res.Token;
      return requestPromisify({
        url: url.yewu.guessComplete,
        method: "POST",
        data: data,
        header: {
          cookie: `AppKey=${config.appid};Token=${Token}`
        }
      });
    });
  },
  /**
   * 获取用户信息
   */
  userInfo: function() {
    return this.login().then(res => {
      let Token = res.Token;
      return requestPromisify({
        url: url.yewu.userInfo,
        header: {
          cookie: `AppKey=${config.appid};Token=${Token}`
        }
      });
    });
  },
  /**
   * 获取用户个人生涯
   */
  userLife: function() {
    return this.login().then(res => {
      let Token = res.Token;
      return requestPromisify({
        url: url.yewu.userLife,
        header: {
          cookie: `AppKey=${config.appid};Token=${Token}`
        }
      });
    });
  },
  /**
   * 排行榜列表
   * @param {* 1: 好友榜, 2: 总榜} type
   * @param {* 页码} page
   * @param {* 每页数量} pagesize
   */
  userRank: function(type, Page = 1, Pagesize = config.pagesize) {
    return this.login().then(res => {
      let Token = res.Token;
      return requestPromisify({
        url: url.yewu.userRank,
        data: {
          type: type,
          Page: Page,
          Pagesize: Pagesize
        },
        header: {
          cookie: `AppKey=${config.appid};Token=${Token}`
        }
      });
    });
  },
  /**
   * 两个人建立好友关系
   * @param {* 1: 好友榜, 2: 总榜} type
   * @param {* 页码} page
   * @param {* 每页数量} pagesize
   */
  makeFriends: function(userID, user2ID) {
    this.login().then(res => {
      let Token = res.Token;
      return requestPromisify({
        url: url.yewu.makeFriends,
        method: "POST",
        data: {
          userID: userID,
          user2ID: user2ID
        },
        header: {
          cookie: `AppKey=${config.appid};Token=${Token}`
        }
      });
    });
  },
  /**
   * 获取所有段位信息列表
   */
  levels: function() {
    return this.login().then(res => {
      let Token = res.Token;
      return requestPromisify({
        url: url.yewu.levels,
        header: {
          cookie: `AppKey=${config.appid};Token=${Token}`
        }
      });
    });
  },
  /**
   * 获取系统公告列表
   */
  announces: function() {
    return this.login().then(res => {
      let Token = res.Token;
      return requestPromisify({
        url: url.yewu.announces,
        header: {
          cookie: `AppKey=${config.appid};Token=${Token}`
        }
      });
    });
  },
  /**
   * 挑战赛 
  */
  challenge: function () {
    return this.login().then(res => {
      let Token = res.Token;
      return requestPromisify({
        url: url.yewu.challenge,
        header: {
          cookie: `AppKey=${config.appid};Token=${Token}`
        }
      });
    });
  },

  // 旧版业务
  /**
   * 请求成语图片与答案
   * */
  getPicture(Token) {
    return requestPromisify({
      url: url.yewu.pic,
      header: {
        cookie: `AppKey=${config.appid};Token=${Token}`
      }
    });
  },
  /**
   * 验证答案
   * */
  testAnswer(Token, cid, answer) {
    return requestPromisify({
      url: url.yewu.testAnswer,
      header: {
        cookie: `AppKey=${config.appid};Token=${Token}`
      },
      data: {
        CID: cid,
        Answers: answer
      }
    });
  },
  /**
   * 获得排行榜
   *
   * */
  my_get_rank(person_key) {
    // console.log('请求   开始   发起');
    var key = person_key || "";
    return this.login().then(res => {
      let Token = res.Token;
      if (!key) {
        return requestPromisify({
          url: url.yewu.rank,
          header: {
            cookie: `AppKey=${config.appid};Token=${Token}`
          }
        });
      } else {
        return requestPromisify({
          url: url.yewu.rank,
          header: {
            cookie: `AppKey=${config.appid};Token=${Token}`
          },
          data: {
            encryptedData: key.encryptedData,
            iv: key.iv
          }
        });
      }
    });
  },

  myShare() {
    return this.login().then(res => {
      let Token = res.Token;
      return requestPromisify({
        url: url.yewu.share,
        header: {
          cookie: `AppKey=${config.appid};Token=${Token}`
        }
      });
    });
  },

  nextWord() {
    return this.login().then(res => {
      let Token = res.Token;
      return requestPromisify({
        url: url.yewu.next_word,
        header: {
          cookie: `AppKey=${config.appid};Token=${Token}`
        }
      });
    });
  },
  /**
   * 得到玩家  当前  排行榜排名
   */
  getRank: function() {
    return getStoragePromisify({ key: "userClient" }).then(res => {
      let UserID = res.data.UserID;
      return requestPromisify({
        url: url.yewu.collect,
        data: {
          UserID: UserID
        }
      }).then(res => {
        console.log("得到排名");
      });
    });
  }
};
