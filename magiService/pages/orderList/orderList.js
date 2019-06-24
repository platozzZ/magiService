const app = getApp()
const api = require('../../utils/request.js')
const util = require('../../utils/util.js')
Page({
  data: {
    art: [],
    pages: {
      current_page: 1,
      page_size: 20
    },
    total_page: '',
    kf_mobile: '',
    kf_wechat: '',
    loadMore: false,
    refresh: false,
    toPayFirst: true,
    showList: false,
    showListNone: false
  },
  onLoad: function (options) {
    console.log('options:', options)
    let that = this
    that.getOrderList(1)
    // that.setData({
    //   refresh: false
    // })
  },
  getOrderList(i, v) {
    let that = this
    let datas = {
      current_page: i,
      page_size: 20
    }
    api.request('/fuwu/order/list.do', 'POST', datas).then(res => {
      console.log('getOrderList:',res.data)
      if (res.data.rlt_code == 'S_0000') {
        let data = res.data.data.rows
        if(!!data){
          let art
          if (i == 1) {
            art = data
          } else {
            art = that.data.art.concat(data)
          }
          art.map((item,index,arr) => {
            item.serviceType = item.service_type_code == 0 ? '田螺姑娘':'甩手掌柜'
            item.expireTime = util.formatTimes(new Date(item.order_expire_time))
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
            let actions = obj[item.order_status + '_' + item.pay_status]
            item.status = actions.status
            item.orderStatus = actions.orderStatus
            item.payStatus = actions.payStatus
            return item
          });
          that.setData({
            art: art,
            total_page: res.data.data.total_page,
            'pages.current_page': res.data.data.current_page,
            showList: true,
            showListNone: false
          })
          
        } else {
          that.setData({
            art: [],
            showList: false,
            showListNone: true
          })
        }
      } else {
        that.setData({
          showList: false,
          showListNone: true
        })
        wx.showToast({
          title: res.data.rlt_msg,
          icon: 'none'
        })
      }
      wx.stopPullDownRefresh()
    }).catch(res => {
      // wx.showModal({
      //   title: '提示',
      //   content: res,
      //   success(e){
      //     if(e.confirm){
      //       that.onPullDownRefresh()
      //     }
      //   }
      // })
      console.log('getOrderList-fail:', res);
      wx.stopPullDownRefresh()
    }).finally(() => {})
  },
  toDetail(e){
    let id = e.currentTarget.dataset.id
    wx.navigateTo({
      url: '../orderDetail/orderDetail?order_id=' + id ,
    })
  },
  showToast(e) {
    wx.showToast({
      title: e,
      icon: 'none',
      mask: true
    })
  },
  toPay(e){
    let that = this
    if (that.data.toPayFirst) {
      that.setData({
        toPayFirst: false
      })
      let data = e.currentTarget.dataset.id
      that.pay(data)
    }
  },
  pay(e) {
    setTimeout(function () {
      that.setData({
        toPayFirst: true
      })
    }, 1500); 
    console.log(e)
    let that = this
    let data = { order_id: e}
    api.request('/fuwu/order/repay.do', 'POST', data).then(res => {
      console.log('pay:', res.data);
      // wx.hideLoading()
      let payData = res.data
      if (payData.rlt_code == 'S_0000') {
        wx.requestPayment({
          timeStamp: payData.data.timeStamp,
          nonceStr: payData.data.nonceStr,
          package: payData.data.package,
          signType: payData.data.signType,
          paySign: payData.data.paySign,
          success(res) {
            wx.hideLoading()
            console.log(res)
            that.getOrderList(1)
          },
          fail(res) {
            wx.hideLoading()
            console.log(res)
            wx.showModal({
              title: '提示',
              showCancel: false,
              content: '支付失败',
            })
          },
          complete: function (res) {
            console.log(res)
          }
        })
      } else {
        console.log('payData:', payData)
        // wx.hideLoading()
        that.showToast(payData.rlt_msg)
      }
    }).catch(res => {
      console.log('pay-fail:', res);
    }).finally(() => { })
  },
  toCancel(e) {
    let that = this
    let status = e.currentTarget.dataset.status
    let orderId = e.currentTarget.dataset.id
    if (status == 0){
      wx.showModal({
        title: '提示',
        content: '确定取消订单吗？',
        success(res) {
          if (res.confirm) {
            that.orderCancel(orderId)
          } else if (res.cancel) {
            console.log('用户点击取消')
          }
        }
      })
    } else {
      let date = e.currentTarget.dataset.date
      let time = e.currentTarget.dataset.time
      let timeNow = Date.parse(new Date()) + 24 * 60 * 60 * 1000
      let serviceTime = Date.parse(new Date(date.replace(/-/g, '/') + ' ' + time))
      if (serviceTime > timeNow) {
        wx.showModal({
          title: '提示',
          content: '确定取消订单？取消后款项原路退回',
          success(res) {
            if (res.confirm) {
              that.orderCancel(orderId)
            } else if (res.cancel) {
              console.log('用户点击取消')
            }
          }
        })

      } else {
        wx.showToast({
          title: '服务人员已准备就绪，无法取消',
          icon: 'none',
          mask: true
        })
      }
    }
    
    
  },
  orderCancel(e){
    let that = this
    let data = { order_id: e }
    api.request('/fuwu/order/cancel.do', 'POST', data).then(res => {
      console.log('cancel:', res.data);
      // wx.hideLoading()
      if (res.data.rlt_code == 'S_0000') {
        that.getOrderList(1)
      } else {
        wx.showToast({
          title: res.rlt_msg,
          icon: 'none',
          mask: true
        })
      }
    }).catch(res => {
      console.log('pay-fail:', res);
    }).finally(() => {})
  },
  toAgain(e) {
    console.log(e)
    let that = this
    let art = that.data.art
    let index = e.currentTarget.dataset.index
    let data = JSON.stringify(art[index])
    wx.navigateTo({
      url: '../toorder/toorder?data=' + data,
    })
  },
  onShow() {
    let that = this
    console.log(that.data.refresh)
    that.setData({
      toPayFirst: true
    })
    if (that.data.refresh) {
      that.getOrderList(1)
    } else {
      that.setData({
        refresh: true
      })
    }
  },
  contactUs(e) {
    let that = this
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
  getMobile(e) {
    // wx.showLoading({
    //   title: '加载中',
    //   mask: true
    // })
    let that = this
    // const pageState = pagestate(that)
    // pageState.loading()// 切换为loading状态
    api.request('/fuwu/service/kf_contact', 'POST').then(res => {
      console.log('mobile:', res.data);
      // wx.hideLoading()
      // pageState.finish()// 切换为finish状态
      if (res.data.rlt_code == 'S_0000') {
        that.setData({
          kf_mobile: res.data.data.kf_mobile,
          kf_wechat: res.data.data.kf_wechat
        })
      }
    }).catch(res => {
      // wx.hideLoading()
      // pageState.error()// 切换为error状态
      console.log('mobile-fail:', res);
    }).finally(() => {
      // console.log('getAddress-finally:', "结束");
    })
  },
  copyWechartCode(e) {
    wx.setClipboardData({
      data: this.data.kf_wechat,
      success(res) {
        wx.showToast({
          title: '微信号已复制',
        })
        console.log(res)
      }
    })
  },
  openActionSheet() {
    let that = this
    if (!that.data.kf_mobile || !that.data.kf_wechat) {
      that.getData()
      return
    }
    wx.showActionSheet({
      itemList: ['拨打客服电话', '添加客服微信'],
      success: function (res) {
        if (res.tapIndex == 0) {
          let phone = that.data.kf_mobile
          that.contactUs(phone)
        } else if (res.tapIndex == 1) {
          that.copyWechartCode()
        }
      }
    });
  },
  onPullDownRefresh() {
    this.getOrderList(1)
  },
  onReachBottom() {
    let that = this
    let i = that.data.pages.current_page
    if (that.data.total_page > i) {
      that.getOrderList(i + 1)
    } else {
      that.setData({
        loadMore: true
      })
    }
  },
  // onShareAppMessage: function (options) {
  //   console.log(options)
  //   return {
  //     title: '麦极服务',
  //     path: "/pages/orderList/orderList",
  //     success: function (res) {
  //       console.log('onShareAppMessage  success:', res)
  //     },
  //     fail: function (res) {
  //       console.log('onShareAppMessage  fail:', res)
  //     }
  //   }
  // }
})