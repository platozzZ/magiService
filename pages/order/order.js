const app = getApp()
const util = require('../../utils/util.js');
const api = require('../../utils/request.js')
import WxValidate from '../../utils/WxValidate'
const hours = [];
const minutes = ['00'];//, '30'
//获取小时
for (let i = 8; i < 21; i++) {
  if (i < 10) {
    i = "0" + i;
  }
  hours.push("" + i);
}
Page({
  data: {
    layoutArr: ['一居室', '二居室', '三居室'],
    layoutIndex: 0,
    serveArr: [
      { name: '田螺姑娘(保洁)', id: '1' },
      // { name: '甩手掌柜(保洁+布草)', id: '2' }
      ],
    serveIndex: 0,
    date: '',
    time: '',
    multiArray: [hours, minutes],
    multiIndex: [0, 0],
    dateArr: [],
    dateIndex: 0,
    timeArr: [],
    timeIndex: 0,
    price: '',
    originalPrice: '',
    showPrice: false,
    originalPriceShow: true,
    showText: true,
    textCount: 0,
    containerTop: app.globalData.navigationBarHeight,
    containerHeight: app.globalData.containerHeight,
    clearArr: [
      '房间内洗晾','固定地点领取'
      ],
    clearIndex: null,
    passwordArr: [
      '智能锁','机械锁'
      ],
    passwordIndex: null,
    showLock: false,
    showKey: false,
    showLocation: false,
    form: {
      house_type: '',//  房型0: 1室 1: 两室 2: 三室
      service_type: '0',//服务类型0保洁 1保洁+布草
      service_date: '',// 服务日期（明天开始的7天内，例：2019-05 - 09）
      service_time: '',// 服务时间点
      mobile: '',// 手机号
      address: '',// 地址
      hl_clean_type: '',// 布草清洗方式0: 房间内洗晾   1: 固定地点领取
      hl_location: '',//  布草领取地点
      open_door_type: '',// 保洁开门方式0: 钥匙   1: 智能锁
      open_door_remark: '',//开门方式备注(密码或者钥匙地址)
      consumables_location: '',// 消耗品位置
    },
    // showTips: false,
  },
  onLoad (options) {
    let that = this
    let dateData = []
    let tomorrowDate = util.getDateNext(1)
    for(let i = 1; i< 8; i++ ){
      dateData.push(util.getDateNext(i));
    }
    let orderTimeData = {
      service_date: tomorrowDate, 
      house_type: that.data.layoutIndex + ''
    }
    that.getTimeOrder(orderTimeData)
    that.initValidate()
    that.getRule(0)
    that.setData({
      dateArr: dateData,
      time: '08:00',
      'form.service_date': tomorrowDate,
    })
  },
  getTimeOrder(e){
    let that = this
    // console.log(e)
    let data = e
    // console.log(data)
    api.request('/fuwu/service/can_order_time.do', 'POST', app.globalData.token, data).then(res => {
      console.log('can_order_time:', res.data);
      let data = res.data.data
      let fullFalse = []
      console.log(!!data)
      // if(!!data){
        data.map((item, index, arr) => {
          item.code = item.time
          if(item.full){
            item.time = item.time + '（约满）'
            item.code = ''
            return item
          }
        })
      data.unshift({ time: '请选择', code: ''})
      console.log(data)
      that.setData({
        timeArr: data
      })
    }).catch(res => {
      console.log('pay-fail:', res);
    }).finally(() => {
      // console.log('getAddress-finally:', "结束");
    })
  },
  formSubmit(e) {
    let that = this
    let data = e.detail.value
    // console.log(e)
    console.log(data)
    if (!that.WxValidate.checkForm(data)) {
      const error = this.WxValidate.errorList[0]
      this.showModal(error)
      return false
    } else {
      if (data.hl_clean_type == 1 && !data.hl_location){
        let error = {msg: '请输入领用地点'}
        that.showModal(error)
      } else {
        that.pay(data)
        // wx.showModal({
        //   title: '提示',
        //   content: '请确保订单信息填写正确',
        //   success(res) {
        //     if (res.confirm) {
        //     } else if (res.cancel) {
        //       console.log('用户点击取消')
        //     }
        //   }
        // })
      }
    }
  },
  showModal(error) {
    wx.showToast({
      title: error.msg,
      icon: 'none',
      duration: 2000,
      mask: true
    })
  },
  showToast(e){
    wx.showToast({
      title: e,
      icon: 'none',
      duration: 2000,
      mask: true
    })
  },
  addressBlur(e){
    let that = this
    console.log(e.detail)
    let data = e.detail.value.replace(/\s+/g, '')
    that.setData({
      'form.address': e.detail.value
    })
    // that.getRule()
  },
  bindClear(e){
    let that = this
    let data = e.detail.value
    let clear_type = 'form.clear_type'
    that.setData({
      clearIndex: data,
      [clear_type]: data
    })
    if(data == '1'){
      that.setData({
        showLocation: true
      })
    } else {
      that.setData({
        showLocation: false
      })
    }
  },
  bindPassword(e){
    let that = this
    let data = e.detail.value
    let password_type = 'form.password_type'
    console.log(e)
    that.setData({
      passwordIndex: data,
    })
    that.setData({
      [password_type]: data
    })
    if (data == 0) {
      that.setData({
        showLock: true,
        showKey: false
      })
    } else if (data == 1) {
      that.setData({
        showLock: false,
        showKey: true
      })
    }
    
  },
  bindLayout(e){
    console.log(e.detail)
    let that = this
    let value = e.detail.value
    let dateArr = that.data.dateArr
    let dateIndex = that.data.dateIndex
    let data = {
      service_date: dateArr[dateIndex],
      house_type: value + ''
    }
    that.getTimeOrder(data)
    that.setData({
      layoutIndex: e.detail.value,
      timeIndex: 0
    });
    that.getRule(value)
    // if (value == '0'){
    //   console.log(value)
    //   that.setData({
    //     showPrice: false,
    //     [house_type]: null
    //   })
    // } else {
    //   let house_type = 'form.house_type'
    //   that.setData({
    //     [house_type]: e.detail.value
    //   })
    //   that.getRule()
    // } 
  },
  bindServe(e) {
    console.log(e.detail)
    let that = this
    let value = e.detail.value
    let service_type = 'form.service_type'
    this.setData({
      serveIndex: e.detail.value
    });
    if (value == '0') {
      that.setData({
        showPrice: false,
        [service_type]: null
      })
    } else if (value == '2'){
      wx.showToast({
        title: '甩手掌柜待开放',
        icon: 'none'
      })
      that.setData({
        showPrice: true,
        [service_type]: '1',
        serveIndex: 1
      })
      return false
    } else {
      let service_type = 'form.service_type'
      that.setData({
        [service_type]: e.detail.value
      })
      // that.getRule()
    }
  },
  bindDateChange(e) {
    let that = this
    let dateArr = that.data.dateArr
    let house_type = that.data.layoutIndex + ''
    let data = {
      service_date: dateArr[e.detail.value], 
      house_type: house_type
    }
    that.getTimeOrder(data)
    that.setData({
      dateIndex: e.detail.value,
      timeIndex: 0
    })
  },
  bindTimeChange(e) {
    let that = this
    let timeArr = that.data.timeArr
    if (timeArr[e.detail.value].full){
      wx.showToast({
        title: '当前时间点已经约满了哟，请选择其他时间吧',
        icon: 'none'
      })
      that.setData({
        timeIndex: 0,
      })
    } else {
      that.setData({
        timeIndex: e.detail.value,
      })
    }
    console.log(timeArr)
  },
  bindLocation(e){
    let that = this
    console.log(e)
    that.setData({
      'form.hl_location': e.detail.value
    })
  },
  pay(data) {
    // console.log(data) 
    let that = this
    wx.showLoading({
      title: '加载中',
      mask: true
    })
    api.request('/fuwu/order/add.do', 'POST', app.globalData.token, data).then(res => {
      console.log('pay:', res.data);
      let payData = res.data
      if (payData.rlt_code == 'S_0000'){
        wx.requestPayment({
          timeStamp: payData.data.timeStamp,
          nonceStr: payData.data.nonceStr,
          package: payData.data.package,
          signType: payData.data.signType,
          paySign: payData.data.paySign,
          success(res) {
            wx.hideLoading()
            console.log(res)
            wx.navigateTo({
              url: '../orderList/orderList',
            })
          },
          fail(res) {
            wx.hideLoading()
            console.log(res)
            wx.showModal({
              title: '提示',
              showCancel: false,
              content: '支付失败',
            })
            wx.navigateTo({
              url: '../orderList/orderList',
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
    }).finally(() => {
      // console.log('getAddress-finally:', "结束");
    })
  },
  onShow(){
    // console.log('onShow:',this.data.form)
  },
  bindMultiPickerColumnChange (e) {
    let that = this
    console.log(e.detail)
    const data = {
      multiArray: this.data.multiArray,
      multiIndex: this.data.multiIndex
    };
    // if (e.detail.column == 0 && e.detail.value == 12) {
      data.multiArray[1].length = 0;
      data.multiArray[1].push('00')
    // } else {
    //   data.multiArray[1].length = 0;
    //   data.multiArray[1].push('00','30')
    // }
    data.multiIndex[e.detail.column] = e.detail.value;
    that.setData(data);
    console.log(data)
  },
  phoneRule(phone){
    let that = this
    // let phone = e.detail.value
    const myReg = /^([1][3,5,6,7,8,9])\d{9}$/
    // const reg = /^1([38][0-9]|4[579]|5[0-3,5-9]|6[6]|7[0135678]|9[89])\d{8}$/
    // const myreg = /^(((13[0-9]{1})|(15[0-9]{1})|(18[0-9]{1})|(17[0-9]{1}))+\d{8})$/;
    if (phone.length == 0) {
      that.showToast('手机号码不能为空')
      return false;
    } else if (!myReg.test(phone)) {
      that.showToast('手机号输入有误')
      return false;
    } else {
      return true
    }
  },
  textareaChange(e){
    // console.log(e)
    let that = this
    let length = e.detail.value.length
    console.log(length)
    that.setData({
      textCount: length
    })
  },
  contains(arr, obj) {
    var i = arr.length;
    while(i--) {
      if (arr[i] == obj) {
        return true;
      }
    }
    return false;  
  },
  initValidate() {
    // 验证字段的规则
    const rules = {
      address: {
        required: true,
      },
      house_type: {
        required: true,
      },
      service_date: {
        required: true,
      },
      service_time: {
        required: true,
      },
      mobile: {
        required: true,
        tel: true,
      },
      hl_clean_type: {
        required: true,
      },
      // hl_location: {
      //   required: true,
      // },
      open_door_type: {
        required: true,
      },
      open_door_remark: {
        required: true,
      }
    }
    const messages = {
      address: {
        required: '请正确填写房源地址',
      },
      house_type: {
        required: '请选择房源类型',
      },
      service_time: {
        required: '请选择服务时间',
      },
      mobile: {
        required: '手机号不能为空',
        tel: '请输入正确的手机号',
      },
      hl_clean_type: {
        required: '请选择布草清洗方式',
      },
      // hl_location: {
      //   required: '请输入布草领取地点',
      // },
      open_door_type: {
        required: '请设置保洁临时密码',
      },
      open_door_remark: {
        required: '请输入密码或者钥匙地址',
      }
    }
    // 创建实例对象
    this.WxValidate = new WxValidate(rules, messages)

    // 自定义验证规则
    // this.WxValidate.addMethod('assistance', (value, param) => {
    //   return this.WxValidate.optional(value) || (value.length >= 1 && value.length <= 2)
    // }, '请勾选1-2个敲码助手')
  },
  getRule(data) {
    let that = this
    if (data == 0){
      that.setData({
        price: 39
      })
    } else if (data == 1){
      that.setData({
        price: 59
      })
    } else {
      that.setData({
        price: 79
      })
    }
  },
  // onShareAppMessage: function (options) {
  //   console.log(options)
  //   return {
  //     title: '麦极服务',
  //     path: "/pages/order/order",
  //     success: function (res) {
  //       console.log('onShareAppMessage  success:', res)
  //     },
  //     fail: function (res) {
  //       console.log('onShareAppMessage  fail:', res)
  //     }
  //   }
  // }
  // getRule() {
  //   let that = this
  //   let formValue = that.data.form //获取地址参数
  //   let address = formValue.address//获取地址
  //   let house_type = formValue.house_type //获取房源类型
  //   let service_type = formValue.service_type //获取服务类型
  //   let mobile = formValue.mobile //获取手机号
  //   let dateActive = that.data.date //当前订单日期
  //   let timeActive = that.data.time //当前订单开始时间
  //   let clear_type = that.data.clear_type // 布草清洗方式
  //   let password_type = that.data.password_type //保洁开门方式
  //   let lock_psd = that.data.lock_psd
  //   let key_address = that.data.key_address
  //   console.log(timeActive)
  //   let tampDateActive = Date.parse(dateActive + ' ' + timeActive)//当前可下订单开始日期时间戳
  //   let tampPeakBegin = Date.parse(dateActive + ' ' + '12:00') //高峰期开始时间
  //   let tampPeakEnd = Date.parse(dateActive + ' ' + '14:00')//高峰期结束时间
  //   console.log(!!address, !!house_type, !!service_type, !!dateActive, !!timeActive, !!mobile)
  //   console.log(address, house_type, service_type, dateActive, timeActive, mobile)
  //   // service_type 服务类型
  //   if (!!address && !!house_type && !!dateActive && !!timeActive) {
  //     switch (house_type) {
  //       case '1':
  //         // if (service_type == '1') {//保洁
  //           that.setData({
  //             originalPriceShow: true,
  //             showPrice: true
  //           })
  //           if (tampDateActive < tampPeakEnd && tampDateActive >= tampPeakBegin) {
  //             that.setData({
  //               price: 39,
  //               originalPrice: '',
  //             })
  //           } else {
  //             that.setData({
  //               price: 39,
  //               originalPrice: '',
  //             })
  //           }
  //         // }
  //         break;
  //       case '2':
  //         // if (service_type == '1') {//保洁
  //           that.setData({
  //             originalPriceShow: true,
  //             showPrice: true
  //           })
  //           if (tampDateActive < tampPeakEnd && tampDateActive >= tampPeakBegin) {
  //             that.setData({
  //               price: 59,
  //               originalPrice: '',
  //             })
  //           } else {
  //             that.setData({
  //               price: 59,
  //               originalPrice: '',
  //             })
  //           }
  //         // }
  //         break;
  //       case '3':
  //         // if (service_type == '1') {//保洁
  //           that.setData({
  //             originalPriceShow: true,
  //             showPrice: true
  //           })
  //           if (tampDateActive < tampPeakEnd && tampDateActive >= tampPeakBegin) {
  //             that.setData({
  //               price: 79,
  //               originalPrice: '',
  //             })
  //           } else {
  //             that.setData({
  //               price: 79,
  //               originalPrice: '',
  //             })
  //           }
  //         // }
  //         break;
  //       default:
  //         that.setData({
  //           originalPriceShow: true,
  //           showPrice: true
  //         })
  //         break;
  //     }
  //     return true
  //   } else {
  //     return false
  //   }
  // },
})