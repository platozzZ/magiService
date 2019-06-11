const app = getApp()
// const api = require('../../utils/request.js')
// var startPoint;
Page({
  data: {
    art: [],
    pages: {
      current_page: 1,
      page_size: 20
    },
    total_page: '',
    screenHeight: '',
    screenWidth: '',
    top: '',
    swiperList:[
      { 
        url: '../../images/banner-01.jpg', 
      },
      {
        url: '../../images/banner-02.jpg', 
      },
      { 
        url: '../../images/banner-03.jpg', 
      },
    ],
    processList: [
      { title: '民宿主下单' },
      { title: '确认订单' },
      { title: '麦极管家上门' },
      { title: '打扫前拍照' },
      { title: '开窗通风' },
      { title: '开始保洁' },
      { title: '保洁完成' },
      { title: '关闭门窗、电源' },
      { title: '拍照反馈' },
    ],
    standardData: [
      {
        title: "布草标准",
        list: [
          { text: '• 统一换布草、床上用品' },
          { text: '• 床单被套平整无皱褶，无毛发无破损' },
          { text: '• 枕头四角饱满，无皱褶' },
          { text: '• 清洗晾晒房东自有布草' }
        ]
      },
      {
        title: '地面标准',
        list: [
          { text: '• 表面干净，无污渍' },
          { text: '• 物品参照房源档案摆放整齐' },
          { text: '• 手办归类' }
        ]
      },
      {
        title: '桌柜标准',
        list: [
          { text: '• 地毯无杂物，无污渍，无沙土' },
          { text: '• 大理石地面无杂物、无污渍，手摸无沙感，无脚印' },
          { text: '• 木地板，无杂物，无垃圾，无灰尘' }
        ]
      },
    ],
    grids: [
      { name: '卧室', imaurl: '../../images/bedroom.png' },
      { name: '客厅', imaurl: '../../images/livingroom.png' },
      { name: '厨房', imaurl: '../../images/kitchen.png' },
      { name: '卫生间', imaurl: '../../images/toilet.png' },
    ],
  },
  onLoad: function () {
    let that = this
    that.getSystemInfo()
    that.getProcess()
    // console.log('that.data.refresh:', that.data.refresh)
    // setTimeout(function () {
    //   that.getAddress()
    // }, 1000)
  },
  getProcess(){
    let that = this
    let data = that.data.processList
    data.map((item,index,arr) =>{
      if (that.paRity(index)){
        item.left = true
      }
    })
    that.setData({
      processList: data
    })
  },
  paRity(value){
    if (value%2 == 0) return true
  },
  toOrder(e) {
    let that = this
    let art = that.data.art
    let index = e.currentTarget.dataset.index
    let data = JSON.stringify(that.data.art[index])
    console.log(e)
    console.log(data)
    wx.navigateTo({
      url: '../order/order?data=' + data,
    })
  },
  onekeyOrder(){
    // wx.switchTab({
    //   url: '../orderList/orderList',
    //   success: function (e) {
    //     var page = getCurrentPages().pop();
    //     console.log(page)
    //     if (page == undefined || page == null) return;
    //     page.onLoad();
    //   }
    // })
    wx.navigateTo({
      // url: '../order/order' 
      url: '../toorder/toorder'
    })
  },
  getSystemInfo(){
    let that = this
    wx.getSystemInfo({
      success: function (res) {
        console.log('getSystemInfo:',res);
        // 屏幕宽度、高度
        // console.log('height=' + res.windowHeight);
        // console.log('width=' + res.windowWidth);
        // 高度,宽度 单位为px
        that.setData({
          screenHeight: res.windowHeight,
          screenWidth: res.windowWidth,
          top: res.windowHeight * 0.6,
          imgHeight: res.windowWidth/(640/360)
        })
      }
    })
  },
  
  onShow(){
    let that = this
    // if (that.data.refresh) {
    //   // console.log('that.data.refresh:', that.data.refresh)
    //   // setTimeout(function () {
    //   that.getAddress()
    //   // }, 1000)
    // } else {
    //   // console.log('that.data.refresh:', that.data.refresh)
    //   that.setData({
    //     refresh: true
    //   })
    // }
  },
  onShareAppMessage: function (options) {
    console.log(options)
    return {
      title: '麦极服务',
      path: "/pages/index/index",
      success: function (res) {
        console.log('onShareAppMessage  success:',res)
      },
      fail: function (res) {
        console.log('onShareAppMessage  fail:', res)
      }
    }
  }
})
