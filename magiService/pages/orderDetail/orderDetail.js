const app = getApp()
const util = require('../../utils/util.js');
const api = require('../../utils/request.js')
Page({
  data: {
    art: '',
    // art: {
    //   address:"朝阳区芳草地西街那边一居室",
    //   clean_favorable_amount:39,
    //   clean_retail_amount:50,
    //   contact_mobile:"18911262211",
    //   contact_name:"王鹏",
    //   deposit_favorable_amount:780,
    //   deposit_retail_amount:780,
    //   hl_favorable_amount:36,
    //   hl_retail_amount:40,
    //   hl_specs15:1,
    //   hl_specs18:1,
    //   houseType:"一居室",
    //   house_id:"111336996403740877",
    //   house_type_code:"0",
    //   open_door_remark:"123456",
    //   orderStatus:"已取消",
    //   order_favorable_amount:855,
    //   order_retail_amount:870,
    //   order_status:4,
    //   payStatus:undefined,
    //   pay_status:0,
    //   remark:"",
    //   serviceType:"甩手掌柜",
    //   service_date:"2019-06-09",
    //   service_time:"16:00",
    //   service_type_code:"1",
    //   status:3,
    // },

    showContainer: false
    
  },
  onLoad: function (options) {
    let that = this
    console.log(options)
    that.getOrderDetail(options.order_id)
    let pages = getCurrentPages();
    let prevPage = pages[pages.length - 2]; //上一个页面
    prevPage.setData({
      refresh: false
    })
  },
  getOrderDetail(e){
    console.log('start:',Date.parse(new Date()))
    let that = this
    let data = {
      order_id: e
    }
    api.request('/fuwu/order/info.do', 'POST', data).then(res => {
      console.log('getOrderDetail:', res.data);
      let data = res.data.data
      data.serviceType = that.switchServiceType(data.service_type_code)
      data.houseType = that.switchHouseType(data.house_type_code)
      // data.cleanType = that.switchCleanType(data.hl_clean_type_code) //布草清洗方式
      let obj = {
        ['0_0']: {
          status: 0,
          orderStatus: '待支付'
        }, ['1_1']: {
          status: 7,
          orderStatus: '待接单'
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
          art: data,
          showContainer: true
        })
        console.log('end:', Date.parse(new Date()))
      } else {
        wx.showToast({
          title: res.data.rlt_msg,
          icon: 'none',
        })
      }
    }).catch(res => {
      console.log('getAmount-fail:', res);
      wx.showToast({
        title: res,
        icon: 'none',
      })
    }).finally(() => {
    })
  },
  toAgain(e) {
    let that = this
    // let art = that.data.art
    let data = JSON.stringify(that.data.art)
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