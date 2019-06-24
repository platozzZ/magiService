const app = getApp()
const util = require('../../utils/util.js');
const api = require('../../utils/request.js')
// import pagestate from '../../components/pagestate/index.js'
Page({
  data: {
    art: [],
    house_id: '',
    showContainer: false,
    showBtn: false,
  },
  onLoad: function (options) {
    console.log(options)
    let that = this
    that.getDeposit()
  },
  getDeposit() {
    let that = this
    let data = {
      current_page: "1", 
      page_size: "100"
    }
    api.request('/fuwu/house/deposit_list.do', 'POST', data).then(res => {
      console.log('deposit_list:', res.data);
      if (res.data.rlt_code == 'S_0000' && !!res.data.data.rows) {
        let data = res.data.data.rows
        data.map(item => {
          item.checked = false
        })
        that.setData({
          art: data,
          showContainer: true,
          showBtn: false
        })
      } else {
        that.setData({
          art: [],
          showContainer: false,
          showBtn: true
        })
      }
    }).catch(res => {
      console.log('deposit_list-fail:', res);
    }).finally(() => {})
  },
  onRetry() {
    this.onLoad()
  },
  changeRadio(e){
    this.setData({
      house_id: e.detail.value
    })
  },
  chooseAddress(e) {
    console.log(e)
    let that = this
    let list = that.data.art
    for (let i = 0; i < list.length; i++) {
      if (list[i].id == that.data.house_id) {
        for (let j = 0; j < list.length; j++) {
          if (list[j].checked && j != i) {
            list[j].checked = false;
          }
        }
        list[i].checked = !(list[i].checked);
        console.log("-----:", list);
        // this.setData(this.data.items[i]);
      }
    }
    that.setData({
      art: list
    })
  },
  showModal(e) {
    let that = this
    console.log(e)
    wx.showModal({
      title: '提示',
      content: '确定以后不再需要甩手掌柜服务？系统会自动提交退还租赁保证金申请，提交后15个工作日内到账',
      success: function (res) {
        if (res.confirm) {
          console.log('用户点击确定')
          that.reFund(that.data.house_id)
        } else if (res.cancel) {
          console.log('用户点击取消')
        }
      },
      fail: function (res) { },
      complete: function (res) { },
    })
  },
  reFund(e) {
    let that = this
    let data = {
      house_id: e
    }
    console.log(data)
    api.request('/fuwu/house/deposit_refund.do', 'POST', data).then(res => {
      // wx.hideLoading()
      console.log('deposit_refund:', res.data);
      if (res.data.rlt_code == 'S_0000') {
        wx.showModal({
          title: '提示',
          content: '已提交退款申请，请点击查看详情查看退款状态',
          showCancel: false,
        })
      } else {
        wx.showToast({
          title: res.data.rlt_msg,
        })
      }
    }).catch(res => {
      // wx.hideLoading()
      wx.showModal({
        title: '提示',
        content: '退款申请失败，请重新请求',
        showCancel: false,
      })
      console.log('deposit_refund-fail:', res);
    }).finally(() => {})
  },
  toDetail(e){
    let house_id = e.currentTarget.dataset.id
    wx.navigateTo({
      url: '../depositDetail/depositDetail?house_id=' + house_id,
    })
  },
  
  onShow: function () { },
  onShareAppMessage: function () { }
})