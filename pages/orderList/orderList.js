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
    refresh: false,
    showHome: false,
    containerTop: app.globalData.navigationBarHeight,
    containerHeight: app.globalData.containerHeight
  },
  onLoad: function (options) {
    let that = this
    console.log(options)
    if (options.showHome == 'false'){
      that.setData({
        showHome: false
      })
    } else {
      that.setData({
        showHome: true
      })
    }
    setTimeout(function () {
      that.getOrderList()
    }, 1000)
  },
  getOrderList(e){
    wx.showLoading({
      title: '',
    })
    let that = this
    let data = that.data.pages
    console.log(data)
    api.request('/fuwu/order/list.do', 'POST', app.globalData.token, data).then(res => {
      wx.hideLoading()
      if (res.data.rlt_code == 'S_0000') {
        let data = res.data.data.rows
        console.log(data)
        if(!!data){
          // console.log(data)
          // console.log('getOrderList:', res.data);
          let art
          if (e == 'loadMore') {
            art = that.data.art.concat(data)
          } else {
            art = data
          }
          art.map(function (item) {
            // item.service_time = util.formatAllTime(new Date(item.service_time))
            if (item.order_status == 0 && item.pay_status == 0) {
              item.status = '已完成'
            } else if (item.order_status == 1 && item.pay_status == 0) {
              item.status = '已预约'
            } else if (item.order_status == 1 && item.pay_status == 1) {
              item.status = '未支付'
            }
            return item
          });
          that.setData({
            art: art,
            total_page: res.data.data.total_page
          })
        } else {
          wx.showToast({
            title: '暂无更多数据',
            icon: 'none'
          })
        }
      } else {
        wx.showToast({
          title: res.rlt_msg,
          icon: 'none'
        })
      }
    }).catch(res => {
      console.log('getOrderList-fail:', res);
    }).finally(() => {
      // console.log('getAddress-finally:', "结束");
    })
  },
  scrollLoading(e) {
    let that = this
    let page = 'pages.current_page'
    let i = that.data.pages.current_page
    if (that.data.total_page > i) {
      that.setData({
        [page]: i + 1
      })
      that.getOrderList('loadMore')
    } else {
      wx.showToast({
        title: '没有更多数据了',
        icon: 'none'
      })
    }
  },
  toDetail(e){
    let id = e.currentTarget.dataset.id
    wx.navigateTo({
      url: '../orderDetail/orderDetail?order_id=' + id,
    })
  },
  onShow: function () {
    let that = this
    if (that.data.refresh) {
      // console.log('that.data.refresh:', that.data.refresh)
      // setTimeout(function () {
      that.getOrderList()
      // }, 1000)
    } else {
      // console.log('that.data.refresh:', that.data.refresh)
      that.setData({
        refresh: true
      })
    }
  },
})