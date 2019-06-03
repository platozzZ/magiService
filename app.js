//app.js
const api = require('./utils/request.js')
App({
  onLaunch: function () {
    var that = this
    wx.onNetworkStatusChange(res =>{
      console.log(res.isConnected)
      console.log(res.networkType)
    })
    wx.getNetworkType({
      success(res) {
        const networkType = res.networkType
      }
    })
    wx.showLoading({
      title: '加载中',
      mask: true
    })
    console.log('app onLaunch')
    // 登录
    wx.login({
      success: res => {
        if (res.code) {
          let data = { code: res.code }
          api.wxLogin('/weixin/exchange', 'POST', data).then(res => {
            wx.hideLoading()
            // pageState.finish()    // 切换为finish状态
            console.log('app-success:', res.data);
            if (res.data.rlt_code == 'S_0000') {
              that.globalData.token = res.data.data.access_token;
              that.globalData.open_id = res.data.data.open_id
              wx.setStorageSync('token', res.data.data.access_token)
            } else {
            }
          }).catch(res => {
            wx.hideLoading()
            wx.showToast({
              title: res,
              icon: 'none'
            })
            // pageState.error()    // 切换为error状态
            console.log('app-fail:', res);
          }).finally(() => {
            // console.log('app-finally:', "结束");
          })
        } else {
          console.log('获取用户登录态失败！' + res)
        }
      }
    })
    // 获取小程序更新机制兼容
    if (wx.canIUse('getUpdateManager')) {
      const updateManager = wx.getUpdateManager()
      updateManager.onCheckForUpdate(function (res) {
        console.log(res)
        // 请求完新版本信息的回调
        if (res.hasUpdate) {
          updateManager.onUpdateReady(function () {
            wx.showModal({
              title: '更新提示',
              content: '新版本已经准备好，是否重启应用？',
              success: function (res) {
                if (res.confirm) {
                  // 新的版本已经下载好，调用 applyUpdate 应用新版本并重启
                  updateManager.applyUpdate()
                }
              }
            })
          })
          updateManager.onUpdateFailed(function () {
            // 新的版本下载失败
            wx.showModal({
              title: '已经有新版本了哟~',
              content: '新版本已经上线啦~，请您删除当前小程序，重新搜索打开哟~',
            })
          })
        }
      })
    } else {
      // 如果希望用户在最新版本的客户端上体验您的小程序，可以这样子提示
      wx.showModal({
        title: '提示',
        content: '当前微信版本过低，无法使用该功能，请升级到最新微信版本后重试。'
      })
    }

  },
  onShow(){
    console.log('APP onShow')
    wx.checkSession({
      success(res) {
        console.log(res)
        //session_key 未过期，并且在本生命周期一直有效
      },
      fail(err) {
        console.log(err)
        // session_key 已经失效，需要重新执行登录流程
        this.onLaunch()
      }
    })
  },
  globalData: {
    token: null,
    open_id: null,
    userInfo: null,
  }
})