import {config} from 'config.js'
import {Promisify} from 'Promisify.js'

const type = {
  "MATCHSUCCESS": "MATCHSUCCESS", //匹配成功，返回匹配人信息 (客户端接收)
  "MATCHFAIL": "MATCHFAIL", // 匹配失败，返回失败信息 (客户端接收)
  "USERANSWER": "USERANSWER" // 答题信息 (客户端发送)
}

let url = `${config.socketHost}`
let connectSocketPromisify = Promisify(wx.connectSocket)
let SocketTask = null

function connectSocket(Token, UserID, cb, shareid = '') {
  SocketTask = wx.connectSocket({
    url: url,
    data:{
      Type: "login",
      AppKey: config.appid,
      Data: {
        Token: Token,
        UserID: UserID,
        shareid: shareid
      }
    },
    header:{ 
      'content-type': 'application/json'
    },
    method:"GET",
    success: function (res) {
      cb(res)
    },
    fail: function (err) {
      console.log(err)
    }
  })
}

module.exports = {
  connectSocket: connectSocket
}