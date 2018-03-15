//app.js
import req from 'lib/request.js'
import {delay} from 'lib/util.js'

App({
    onLaunch: function (options) {
        if (options.shareTicket) {
            this.globalData.login_with_share = options.shareTicket
        }
    },
    onShow: function (options) {
        if (options.shareTicket) {
            this.globalData.login_with_share = options.shareTicket
        }
    },
    req: req,
    delay: delay,
    socketConnect: null,
    globalData: {
        userInfo: null,
        hasUserinfo: false,
        login_with_share: '',
        userGameInfo:{},
    }
})