const app = getApp()
const api = require('../../utils/request.js')
Page({
  data: {
    kf_mobile: '',
    kf_wechat: ''
  },
  onLoad: function (options) {
    this.getData()
  },
  onShow: function () {
    console.log(this.data)
  },
  contactUs(e) {
    let that = this
    // let phone = e.currentTarget.dataset.phone
    wx.showModal({
      title: '联系客服',
      content: '是否确认联系客服？',
      success(res) {
        if (res.confirm) {
          console.log('用户点击确定')
          that.makePhone(e)
        } else if (res.cancel) {
          console.log('用户点击取消')
        }
      }
    })

  },
  makePhone(e) {
    wx.makePhoneCall({
      phoneNumber: e,
      success: function (res) {
        console.log(res)
      }
    })
  },
  getData(e) {
    wx.showLoading({
      title: '加载中',
      mask: true
    })
    let that = this
    api.request('/fuwu/service/kf_contact', 'POST').then(res => {
      console.log('kf_contact:', res.data);
      wx.hideLoading()
      if (res.data.rlt_code == 'S_0000'){
        that.setData({
          kf_mobile: res.data.data.kf_mobile,
          kf_wechat: res.data.data.kf_wechat
        })
      } else {
        wx.showToast({
          title: '获取客服信息失败，请重新获取',
        })
      }
    }).catch(res => {
      console.log('kf_contact-fail:', res);
    }).finally(() => {
      // console.log('getAddress-finally:', "结束");
    })
  },
  copyWechartCode(e){
    wx.setClipboardData({
      data: this.data.kf_wechat,
      success(res) {
        console.log(res)
      }
    })
  },
  openActionSheet: function () {
    let that = this
    if (!that.data.kf_mobile || !that.data.kf_wechat) {
      that.getData()
      return
    } 
    wx.showActionSheet({
      itemList: ['拨打客服电话', '添加客服微信'],
      success: function (res) {
        if (res.tapIndex == 0){
          let phone = that.data.kf_mobile
          that.contactUs(phone)
        } else if (res.tapIndex == 1){
          that.copyWechartCode()
        }
      }
    });
  },
  onShareAppMessage: function () {

  }
})