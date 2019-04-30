const app = getApp()
const util = require('../../utils/util.js');
const api = require('../../utils/request.js')
Page({
  data: {
    art: []
  },
  onLoad: function (options) {
    let that = this
    console.log(options)
    wx.showLoading({
      title: '',
    })
    that.getOrderDetail(options.order_id)
  },
  getOrderDetail(e){
    let that = this
    let data = {
      order_id: e
    }
    console.log(data)
    api.request('/fuwu/order/info.do', 'POST', app.globalData.token, data).then(res => {
      console.log('getOrderDetail:', res.data);
      wx.hideLoading()
      let data = res.data.data
      let time = new Date(data.service_time)
      data.service_time = util.formatAllTime(time)
      if (data.order_status == 0 && data.pay_status == 0) {
        data.status = '已完成'
      } else if (data.order_status == 1 && data.pay_status == 0) {
        data.status = '已预约'
      } else if (data.order_status == 1 && data.pay_status == 1) {
        data.status = '未支付'
      }
      if (res.data.rlt_code == 'S_0000') {
        that.setData({
          art: data
        })
      } else {

      }
    })
  },
  contactUs(e) {
    let that = this
    let phone = e.currentTarget.dataset.phone
    wx.showModal({
      title: '联系客服',
      content: '是否确认联系客服？',
      success(res) {
        if (res.confirm) {
          console.log('用户点击确定')
          that.makePhone(phone)
        } else if (res.cancel) {
          console.log('用户点击取消')
        }
      }
    })
    
  },
  makePhone(e){
    wx.makePhoneCall({
      phoneNumber: e,
      success: function (res) {
        console.log(res)
      }
    })
  },
  onShow: function () {

  },

})