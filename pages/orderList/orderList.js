const app = getApp()
const api = require('../../utils/request.js')
const util = require('../../utils/util.js')
// import pagestate from '../../components/pagestate/index.js'
Page({
  data: {
    art: [],
    pages: {
      current_page: 1,
      page_size: 20
    },
    kf_mobile: '',
    kf_wechat: '',
    total_page: '',
    loadMore: false,
    refresh: true,
    toPayFirst: true,
  },
  onLoad: function (options) {
    let that = this
    that.getMobile()
    // that.getOrderList(1)
    console.log(options)
  },
  getOrderList(i, v) {
    let that = this
    // const pageState = pagestate(that)
    // pageState.loading()// 切换为loading状态
    wx.showLoading({
      title: '加载中',
      mask: true
    })
    let datas = {
      current_page: i,
      page_size: 20
    }
    console.log(datas)
    api.request('/fuwu/order/list.do', 'POST', app.globalData.token, datas).then(res => {
      console.log(res.data)
      wx.hideLoading()
      // pageState.finish()// 切换为finish状态
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
          console.log(art)
          that.setData({
            art: art,
            total_page: res.data.data.total_page,
            'pages.current_page': res.data.data.current_page
          })
          
        }
        console.log(that.data.art)
        //  else {
        //   // pageState.empty()// empty
        //   // that.setData({
        //   //   art: [],
        //   // })
        // }
      } else {
        wx.showToast({
          title: res.rlt_msg,
          icon: 'none'
        })
      }
    }).catch(res => {
      wx.hideLoading()
      // pageState.error()// 切换为error状态
      console.log('getOrderList-fail:', res);
    }).finally(() => {
      // console.log('getAddress-finally:', "结束");
    })
  },
  toDetail(e){
    let id = e.currentTarget.dataset.id
    wx.navigateTo({
      url: '../orderDetail/orderDetail?order_id=' + id + '&detail=1',
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
    if (that.data.toPayFirst){
      let data = e.currentTarget.dataset.id
      that.pay(data)
      that.setData({
        toPayFirst: false
      })
    }
  },
  pay(e) {
    setTimeout(function () {
      that.setData({
        toPayFirst: true
      })
    }, 1500); 
    console.log(e)
    wx.showLoading({
      title: '加载中',
      mask: true
    })
    let that = this
    let data = { order_id: e}
    api.request('/fuwu/order/repay.do', 'POST', app.globalData.token, data).then(res => {
      console.log('pay:', res.data);
      wx.hideLoading()
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
        wx.hideLoading()
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
    wx.showLoading({
      title: '加载中',
      mask: true
    })
    api.request('/fuwu/order/cancel.do', 'POST', app.globalData.token, data).then(res => {
      console.log('cancel:', res.data);
      wx.hideLoading()
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
    console.log('onShow')
    let that = this
    that.setData({
      toPayFirst: true
    })
    console.log(that.data.refresh)
    if (that.data.refresh){
      that.getOrderList(1)
    } else {
      that.setData({
        refresh: true
      })
    }
  },
  onHide(){
    console.log('onHide')
  },
  onUnload() {
    console.log('onUnload')
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
    wx.showLoading({
      title: '加载中',
      mask: true
    })
    let that = this
    // const pageState = pagestate(that)
    // pageState.loading()// 切换为loading状态
    api.request('/fuwu/service/kf_contact', 'POST').then(res => {
      console.log('mobile:', res.data);
      wx.hideLoading()
      // pageState.finish()// 切换为finish状态
      if (res.data.rlt_code == 'S_0000') {
        that.setData({
          kf_mobile: res.data.data.kf_mobile,
          kf_wechat: res.data.data.kf_wechat
        })
      }
    }).catch(res => {
      wx.hideLoading()
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
    wx.stopPullDownRefresh()
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
  onRetry(){
    this.onLoad()
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