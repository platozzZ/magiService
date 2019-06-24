const baseUrl = require('./baseUrl.js')
console.log(baseUrl)
Promise.prototype.finally = function (callback) {
  var Promise = this.constructor;
  return this.then(
    function (value) {
      Promise.resolve(callback()).then(
        function () {
          return value;
        }
      );
    },
    function (reason) {
      Promise.resolve(callback()).then(
        function () {
          throw reason;
        }
      );
    }
  );
}
const wxLogin = (types) => {
  // wx.showLoading({
  //   title: '加载中',
  //   mask: true
  // })
  return new Promise((resolve, reject) => {
    wx.login({
      success: res => {
        if (res.code) {
          let data = { code: res.code }
          wx.request({
            url: baseUrl + '/weixin/exchange',
            data: data,
            method: 'POST',
            header: {
              'content-type': 'application/json',
            },
            success: function (res) {
              // wx.hideLoading()
              // console.log(res)
              if (res.statusCode == 200) {
                if (res.data.rlt_code == "S_0000") {
                  let time = Date.parse(new Date())
                  time = time / 1000 + 3600
                  wx.setStorageSync('token', res.data.data.access_token)
                  wx.setStorageSync('token_time', time)
                } else {
                  wx.setStorageSync('token', '')
                }
                resolve(res); //返回成功提示信息
              } else {
                reject(res.data.rlt_msg); //返回错误提示信息
                wx.showToast({
                  title: res.data.rlt_msg,
                  icon: 'none'
                })
              }
            },
            fail: function (res) {
              // wx.hideLoading()
              console.log('fail：', res)
              reject("网络连接错误"); //返回错误提示信息
              if (res.errMsg.indexOf('timeout') > -1) {
                wx.showToast({
                  title: '网络连接超时，请检查网络后刷新重试',
                  icon: 'none',
                  duration: 2000
                })
                return
              }
              wx.showToast({
                title: '网络连接错误，请检查网络后刷新重试',
                icon: 'none',
                duration: 2000
              })
            },
            complete: function (res) {
              // wx.hideLoading()
              // console.log('complete:', res)
            }
          })
        }
      }

    })

  });
}
module.exports = {
  wxLogin: wxLogin
}
