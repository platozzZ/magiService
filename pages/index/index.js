const app = getApp()
const api = require('../../utils/request.js')
// var startPoint;
Page({
  data: {
    art: [],
    pages: {
      current_page: 1,
      page_size: 20
    },
    total_page: '',
    screenHeight: '',
    screenWidth: '',
    top: '',
  },
  onLoad: function () {
    console.log('这是新版本，测试一键下单')
    let that = this
    that.getSystemInfo()
    setTimeout(function () {
      that.getAddress()
    }, 1000)
  },
  getAddress() {
    wx.showLoading({
      title: '',
    })
    let that = this
    let data = that.data.pages
    console.log(data)
    api.request('/fuwu/house/list.do', 'POST', app.globalData.token, data).then(res => {
      console.log('getAddress:', res.data);
      let art = that.data.art.concat(res.data.data.rows)
      wx.hideLoading()
      if (res.data.rlt_code == 'S_0000') {
        that.setData({
          art: art
        })
      }
    }).catch(res => {
      console.log('getAddress-fail:', res);
    }).finally(() => {
      // console.log('getAddress-finally:', "结束");
    })
  },
  scrollLoading(e){
    let that = this
    let page = 'pages.current_page'
    let i = that.data.pages.current_page
    console.log(i)
    if (that.data.total_page > i) {
      that.setData({
        [page]: i + 1
      })
      that.getAddress()
    }
  },
  toOrder(e) { // url="../order/order"
    let that = this
    let art = that.data.art
    let index = e.currentTarget.dataset.index
    let data = JSON.stringify(that.data.art[index])
    console.log(e)
    console.log(data)
    wx.navigateTo({
      url: '../order/order?data=' + data,
    })
  },
  onekeyOrder(){
    wx.navigateTo({
      url: '../order/order'
    })
  },
  getSystemInfo(){
    let that = this
    wx.getSystemInfo({
      success: function (res) {
        console.log(res);
        // 屏幕宽度、高度
        console.log('height=' + res.windowHeight);
        console.log('width=' + res.windowWidth);
        // 高度,宽度 单位为px
        that.setData({
          screenHeight: res.windowHeight,
          screenWidth: res.windowWidth,
          top: res.windowHeight * 0.6
        })
      }
    })
  },
  // buttonStart: function (e) {
  //   startPoint = e.touches[0]
  // },
  // buttonMove: function (e) {
  //   var endPoint = e.touches[e.touches.length - 1]
  //   var translateX = endPoint.clientX - startPoint.clientX
  //   var translateY = endPoint.clientY - startPoint.clientY
  //   startPoint = endPoint
  //   var buttonTop = this.data.buttonTop + translateY
  //   var buttonLeft = this.data.buttonLeft + translateX
  //   //判断是移动否超出屏幕
  //   if (buttonLeft + 50 >= this.data.windowWidth) {
  //     buttonLeft = this.data.windowWidth - 50;
  //   }
  //   if (buttonLeft <= 0) {
  //     buttonLeft = 0;
  //   }
  //   if (buttonTop <= 0) {
  //     buttonTop = 0
  //   }
  //   if (buttonTop + 50 >= this.data.windowHeight) {
  //     buttonTop = this.data.windowHeight - 50;
  //   }
  //   this.setData({
  //     buttonTop: buttonTop,
  //     buttonLeft: buttonLeft
  //   })
  // },
})
