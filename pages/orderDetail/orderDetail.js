const app = getApp()
const util = require('../../utils/util.js');
const api = require('../../utils/request.js')
Page({
  data: {
    art: [],
    containerTop: app.globalData.navigationBarHeight,
    containerHeight: app.globalData.containerHeight
  },
  onLoad: function (options) {
    let that = this
    console.log(options)
    wx.showLoading({
      title: '',
    })
    console.log(that.switchHouseType('0'))
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
      
      data.serviceType = that.switchServiceType(data.service_type)
      data.houseType = that.switchHouseType(data.house_type)
      data.cleanType = that.switchCleanType(data.hl_clean_type) //布草清洗方式
      data.doorType = that.switchDoorType(data.open_door_type) //保洁开门方式
      // data.cleanType = that.switchCleanType(data.hl_clean_type) //布草清洗方式
      // 钥匙位置   智能锁密码
      // if (data.open_door_type == '0'){
      //   data.doorTitle = '智能锁密码'
      // } else {
      //   data.doorTitle = '钥匙位置'
      // }
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
  switchHouseType(e){
    switch (e) {
      case '0':
        return '一居室'
      case '1':
        return '二居室'
      case '2':
        return '三居室'
    }
  },
  switchServiceType(e) {
    switch (e) {
      case '0':
        return '田螺姑娘（保洁）'
      case '1':
        return '甩手掌柜（保洁+布草）'
    }
  },
  switchCleanType(e) {
    switch (e) {
      case '0':
        return '房间内洗晾'
      case '1':
        return '固定地点领取'
    }
  },
  switchDoorType(e) {
    switch (e) {
      case '0':
        return '智能锁'
      case '1':
        return '机械锁'
    }
  },
  onShow: function () {

  },

})