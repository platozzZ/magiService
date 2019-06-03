const app = getApp()
const util = require('../../utils/util.js');
const api = require('../../utils/request.js')
Page({
  data: {
    art: [],
    popuTop: '',
    showPopu: true
  },
  onLoad: function (options) {
    let that = this
    console.log(options)
    wx.showLoading({
      title: '加载中',
      mask: true
    })
    console.log(that.switchHouseType('0'))
    that.getOrderDetail(options.order_id)
    if (options.detail == '1'){
      let pages = getCurrentPages();
      let currPage = pages[pages.length - 1]; //当前页面
      let prevPage = pages[pages.length - 2]; //上上一个页面
      console.log(prevPage)
      prevPage.setData({
        refresh: false
      })
    }
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
      
      data.serviceType = that.switchServiceType(data.service_type_code)
      data.houseType = that.switchHouseType(data.house_type_code)
      data.cleanType = that.switchCleanType(data.hl_clean_type_code) //布草清洗方式
      let obj = {
        ['0_0']: {
          status: 0,
          orderStatus: '待支付'
        }, ['2_1']: {
          status: 1,
          orderStatus: '预约成功'
        }, ['3_2']: {
          status: 2,
          orderStatus: '已完成'
        }, ['4_0']: {
          status: 3,
          orderStatus: '已取消'
        }, ['4_2']: {
          status: 4,
          orderStatus: '已取消',
          payStatus: '退款中'
        }, ['4_3']: {
          status: 5,
          orderStatus: '已取消',
          payStatus: '退款成功'
        }, ['4_4']: {
          status: 6,
          orderStatus: '已取消',
          payStatus: '退款失败'
        }
      }
      let actions = obj[data.order_status + '_' + data.pay_status]
      data.status = actions.status
      data.orderStatus = actions.orderStatus
      data.payStatus = actions.payStatus
      if (res.data.rlt_code == 'S_0000') {
        that.setData({
          art: data
        })
      } else {

      }
    })
  },
  toAgain(e) {
    let that = this
    let art = that.data.art
    let data = JSON.stringify(art)
    wx.navigateTo({
      url: '../toorder/toorder?data=' + data,
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
        return '田螺姑娘'
      case '1':
        return '甩手掌柜'
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
  onShow: function () {

  },

})