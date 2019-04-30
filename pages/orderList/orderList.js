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
    total_page: ''
  },
  onLoad: function (options) {
    let that = this
    setTimeout(function () {
      that.getOrderList()
    }, 1000)
  },
  getOrderList(){
    wx.showLoading({
      title: '',
    })
    let that = this
    let data = that.data.pages
    console.log(data)
    api.request('/fuwu/order/list.do', 'POST', app.globalData.token, data).then(res => {
      wx.hideLoading()
      let data = res.data.data.rows
      console.log('getOrderList:', res.data);
      let art = that.data.art.concat(data)
      art.map(function (item) {
        item.service_time = util.formatAllTime(new Date(item.service_time))
        if (item.order_status == 0 && item.pay_status == 0){
          item.status = '已完成'
        } else if (item.order_status == 1 && item.pay_status == 0){
          item.status = '已预约'
        } else if (item.order_status == 1 && item.pay_status == 1){
          item.status = '未支付'
        }
        return item
      });
      if (res.data.rlt_code == 'S_0000') {
        that.setData({
          art: art,
          total_page: res.data.data.total_page
        })
      } else {
        wx.showToast({
          title: '暂无更多数据',
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
      that.getOrderList()
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
    setTimeout(function () {
      that.getOrderList()
    }, 1000)
  },
})