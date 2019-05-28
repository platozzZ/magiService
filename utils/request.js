// const baseUrl = "https://fuwu.magi.link"
// const baseUrl = "http://192.168.1.30:8080"
const baseUrl = "https://test01fuwu.magi.link"
//添加事件结束
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
const request = (url, method, token, data) => {
  // console.log(token)
  return new Promise((resolve, reject) => {
    wx.request({
      url: baseUrl + url,
      data: data,
      method: method,
      header: {
        'content-type': 'application/json',
        'access_token': token
      },
      success: function (res) {
        // console.log(res)
        if (res.statusCode == 200) {
          resolve(res); //返回成功提示信息
        } else {
          reject(res.data.message); //返回错误提示信息
        }
      },
      fail: function (res) {
        console.log(res)
        reject("网络连接错误"); //返回错误提示信息
      },
      complete: function (res) {

      }
    })
  });
}
const wxLogin = (url, method, data) => {
  return new Promise((resolve, reject) => {
    wx.request({
      url: baseUrl + url,
      data: data,
      method: method,
      header: {
        'content-type': 'application/json',
      },
      success: function (res) {
        // console.log(res)
        if (res.statusCode == 200) {
          resolve(res); //返回成功提示信息
        } else {
          reject(res.data.message); //返回错误提示信息
        }
      },
      fail: function (res) {
        console.log(res)
        reject("网络连接错误"); //返回错误提示信息
      },
      complete: function (res) {

      }
    })
  });
}
module.exports = {
  request: request,
  wxLogin: wxLogin
}
