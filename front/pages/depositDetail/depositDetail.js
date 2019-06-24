const app = getApp()
const util = require('../../utils/util.js');
const api = require('../../utils/request.js')
Page({
  data: {
    depositDetail: []
  },
  onLoad: function (options) {
    console.log(options)
    let that = this
    that.getDetail(options.house_id)
  },
  onShow: function () {

  },
  getDetail(e) {
    let that = this
    let data = {
      house_id: e
    }
    console.log(data)
    api.request('/fuwu/house/deposit_detail.do', 'POST', data).then(res => {
      console.log('getDetail:', res.data);
      if (res.data.rlt_code == 'S_0000') {
        let data = res.data.data
        data.map(item =>{
          item.payStatus = that.switchPayStatus(item.pay_status)
        })
        that.setData({
          depositDetail: data
        })

      }
    }).catch(res => {
      console.log('getDetail-fail:', res);
    }).finally(() => { })
  },
  switchPayStatus(e){
    switch (e) {
      case 0:
        return '未支付'
      case 1:
        return '已支付'
      case 2:
        return '退款中'
      case 3:
        return '退款成功'
      case 4:
        return '退款失败'
      case 5:
        return '已取消'
    }
  },
  
  onPullDownRefresh: function () {

  },
  onReachBottom: function () {

  },





  sssssssonPullDownRefresh: function () {

  },
  onReachBottom: function () {

  },
  onShareAppMessage: function () {

  }
})