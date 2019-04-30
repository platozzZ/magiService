const app = getApp()
const util = require('../../utils/util.js');
const api = require('../../utils/request.js')
const hours = [];
const minutes = ['00', '30'];
//获取小时
for (let i = 8; i < 21; i++) {
  if (i < 10) {
    i = "0" + i;
  }
  hours.push("" + i);
}
Page({
  data: {
    layoutArr: [
      { name: '请选择房型', id: ''}, 
      { name: '一居室', id: '1'}, 
      { name: '二居室', id: '2'}, 
      { name: '三居室', id: '3'}
      ],
    layoutIndex: 0,
    serveArr: [
      { name: '请选择服务类型', id: '' },
      { name: '田螺姑娘(保洁)', id: '1' },
      // { name: '甩手掌柜(保洁+布草)', id: '2' }
      ],
    serveIndex: 0,
    date: '',
    time: '',
    multiArray: [hours, minutes],
    multiIndex: [0, 0],
    pickerTime: '',
    startDate: '',
    startTime: '08:00',
    price: '',
    originalPrice: '',
    showPrice: false,
    originalPriceShow: true,
    form: {},
    showText: true
  },
  onLoad (options) {
    console.log(options)
    console.log(!!options.data)
    let that = this
    let date = util.getDateStr(1)
    let startDate = util.getDateNext(1);
    console.log(util.formatDate(new Date()))
    console.log(date)
    console.log(startDate)
    that.setData({
      date: date,
      startDate: startDate,
      time: '08:00'
    })
    // console.log(h,t)
    // console.log(that.getSubmitTime(h,t))
    if (!!options.data) {
      wx.showLoading({
        title: '加载中',
      })
      let formData = JSON.parse(options.data);
      console.log(formData)
      setTimeout(function () {
        if (!!formData) {
          let address = 'form.address'
          let id = 'form.id'
          let mobile = 'form.mobile'
          that.switchHouse(formData.house_type)
          that.switchService(formData.service_type)
          console.log(formData)
          that.setData({
            [address]: formData.address,
            [id]: formData.id,
            [mobile]: formData.mobile
          })
          // that.getSubmitTime(h, t)
          that.getRule()
          wx.hideLoading()
        }
      }, 1000)
    }
  },
  switchHouse (e){
    let that = this
    // let houseList = ['一居室','二居室','三居室']
    let house_type = 'form.house_type'
    console.log(e)
    switch (e){
      case '一居室':
        that.setData({
          layoutIndex: 1,
          [house_type]: '1'
        })
      break;
      case '二居室':
        that.setData({
          layoutIndex: 2,
          [house_type]: '2'
        })
        break;
      case '三居室':
        that.setData({
          layoutIndex: 3,
          [house_type]: '3'
        })
      break;
      default:
        that.setData({
          layoutIndex: 0
        })
      break;
    }
  },
  switchService(e) {
    console.log(e)
    let that = this
    let service_type = 'form.service_type'
    // let houseList = ['保洁', '保洁+布草']
    switch (e) {
      case '田螺姑娘(保洁)':
        that.setData({
          serveIndex: 1,
          [service_type]: '1'
        })
        break;
      case '甩手掌柜(保洁+布草)':
        that.setData({
          serveIndex: 2,
          [service_type]: '2'
        })
        break;
      default:
        that.setData({
          serveIndex: 0
        })
        break;
    }
  },
  formSubmit(e) {
    console.log(e)
    let that = this
    let data = e.detail.value
    let showPrice = that.data.showPrice
    data.service_time = util.formatAllTime(new Date(data.service_time))
    console.log(data)
    console.log(that.phoneRule(data.mobile))
    if (that.phoneRule(data.mobile)){
      if (showPrice) {
        that.pay(data)
      } else {
        that.showToast('请正确填写订单')
      }
    }
  },
  showToast(e){
    wx.showToast({
      title: e,
      icon: 'none'
    })
  },
  addressBlur(e){
    let that = this
    console.log(e.detail)
    let data = e.detail.value.replace(/\s+/g, '')
    console.log(data)
    if (!data){
      that.setData({
        showPrice: false
      })
    } else {
      let address = 'form.address'
      that.setData({
        [address]: e.detail.value
      })
    }
    that.getRule()
  },
  bindLayout(e){
    console.log(e.detail)
    let that = this
    let value = e.detail.value
    let house_type = 'form.house_type'
    that.setData({
      layoutIndex: e.detail.value
    });
    if (value == '0'){
      console.log(value)
      that.setData({
        showPrice: false,
        [house_type]: null
      })
    } else {
      let house_type = 'form.house_type'
      that.setData({
        [house_type]: e.detail.value
      })
      that.getRule()
    } 
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
      that.getRule()
    }
  },
  bindDateChange(e) {
    let that = this
    console.log('bindDateChange:', e.detail.value)
    let newDate = e.detail.value.replace(/-/g, "/")
    console.log(e.detail.value)
    console.log(newDate)
    that.setData({
      date: newDate,
    })
    that.getRule()
  },
  bindTimeChange(e) {
    let that = this
    const data = {
      multiArray: that.data.multiArray,
      multiIndex: that.data.multiIndex
    };
    console.log(e.detail)
    const index = e.detail.value
    const hour = data.multiArray[0][index[0]];
    const minute = data.multiArray[1][index[1]];
    that.setData({
      time: hour + ':' + minute,
      multiIndex: e.detail.value
    })
    that.getRule()
  },
  getRule(){
    let that = this
    let formValue = that.data.form //获取地址参数
    let address = formValue.address//获取地址
    let house_type = formValue.house_type //获取房源类型
    let service_type = formValue.service_type //获取服务类型
    let mobile = formValue.mobile //获取手机号
    let dateActive = that.data.date //当前订单日期
    let timeActive = that.data.time //当前订单开始时间
    console.log(timeActive)
    let tampDateActive = Date.parse(dateActive + ' ' + timeActive)//当前可下订单开始日期时间戳
    let tampPeakBegin = Date.parse(dateActive + ' ' + '12:00') //高峰期开始时间
    let tampPeakEnd = Date.parse(dateActive + ' ' + '14:00')//高峰期结束时间
    console.log(!!address, !!house_type, !!service_type, !!dateActive, !!timeActive, !!mobile)
    console.log(address, house_type, service_type, dateActive, timeActive, mobile)
    if (!!address && !!house_type && !!service_type && !!dateActive && !!timeActive){
      switch (house_type) {
        case '1': 
          if (service_type == '2'){ //保洁+布草
            that.setData({
              originalPriceShow: false,
              showPrice: true
            })
            if (tampDateActive < tampPeakEnd && tampDateActive >= tampPeakBegin){
              that.setData({
                price: 58 * 1.2,
                originalPrice: 70 * 1.2,
              })
            } else {
              that.setData({
                price: 58,
                originalPrice: 70,
              })
            }
          } else if (service_type == '1') {//保洁
            that.setData({
              originalPriceShow: true,
              showPrice: true
            })
            if (tampDateActive < tampPeakEnd && tampDateActive >= tampPeakBegin) {
              that.setData({
                price: 39,
                originalPrice: '',
              })
            } else {
              that.setData({
                price: 39,
                originalPrice: '',
              })
            }
          }
        break;
        case '2':
          if (service_type == '2') { //保洁+布草
            that.setData({
              originalPriceShow: false,
              showPrice: true
            })
            if (tampDateActive < tampPeakEnd && tampDateActive >= tampPeakBegin) {
              that.setData({
                price: 88 * 1.2,
                originalPrice: 105 * 1.2,
              })
            } else {
              that.setData({
                price: 88,
                originalPrice: 105,
              })
            }
          } else if (service_type == '1') {//保洁
            that.setData({
              originalPriceShow: true,
              showPrice: true
            })
            if (tampDateActive < tampPeakEnd && tampDateActive >= tampPeakBegin) {
              that.setData({
                price: 59,
                originalPrice: '',
              })
            } else {
              that.setData({
                price: 59,
                originalPrice: '',
              })
            }
          }
        break;
        case '3':
          if (service_type == '2') { //保洁+布草
            that.setData({
              originalPriceShow: false,
              showPrice: true
            })
            if (tampDateActive < tampPeakEnd && tampDateActive >= tampPeakBegin) {
              that.setData({
                price: 108 * 1.2,
                originalPrice: 135 * 1.2,
              })
            } else {
              that.setData({
                price: 108,
                originalPrice: 135,
              })
            }
          } else if (service_type == '1') {//保洁
            that.setData({
              originalPriceShow: true,
              showPrice: true
            })
            if (tampDateActive < tampPeakEnd && tampDateActive >= tampPeakBegin) {
              that.setData({
                price: 79,
                originalPrice: '',
              })
            } else {
              that.setData({
                price: 79,
                originalPrice: '',
              })
            }
          }
        break;
        default:
          that.setData({
            originalPriceShow: true,
            showPrice: true
          })
          break;
      }
      return true
    } else {
      return false
    }
  },
  pay(data) {
    // console.log(data) 
    api.request('/fuwu/order/add.do', 'POST', app.globalData.token, data).then(res => {
      console.log('pay:', res.data);
      let payData = res.data
      console.log(payData.data.timeStamp)
      if (payData.rlt_code =='S_0000'){
        wx.requestPayment({
          timeStamp: payData.data.timeStamp,
          nonceStr: payData.data.nonceStr,
          package: payData.data.package,
          signType: payData.data.signType,
          paySign: payData.data.paySign,
          success(res) {
            console.log(res)
            wx.switchTab({
              url: '../orderList/orderList',
            })
          },
          fail(res) {
            console.log(res)
            wx.showModal({
              title: '提示',
              showCancel: false,
              content: '支付失败，请重新支付',
            })
          },
          complete: function (res) {
            console.log(res)
           }
        })
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
    if (e.detail.column == 0 && e.detail.value == 12) {
      data.multiArray[1].length = 0;
      data.multiArray[1].push('00')
    } else {
      data.multiArray[1].length = 0;
      data.multiArray[1].push('00','30')
    }
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
  getSubmitTime(h,t){ //获取当前可下订单最近时间点  h:小时，t:分钟
    let that = this
    let thisDate = util.formatDate(new Date())
    let thisHour = util.formatHour(new Date())
    let thisMinute = util.formatMinute(new Date())
    let toMorrow = util.getDateStr(1)
    console.log(thisDate)
    console.log(toMorrow)
    console.log(thisHour)
    const data = {
      multiArray: that.data.multiArray,
      multiIndex: that.data.multiIndex
    };
    console.log(data)
    if (that.contains(data.multiArray[0],h)){
      if (t < 30){
        that.setData({
          time: thisHour + ':' + '30'
        })
        return thisHour + ':' + '30'
      } else {
        that.setData({
          time: thisHour + 1 + ':' + '00'
        })
        return thisHour + 1 + ':' + '00'
      }
    } else if(h < 8 ) {
      that.setData({
        time: '08:00'
      })
      return '08:00'
    } else {
      that.setData({
        date: toMorrow,
        time: '08:00'
      })
      return '08:00'
    }
  },
  contains(arr, obj) {
    var i = arr.length;
    while(i--) {
      if (arr[i] == obj) {
        return true;
      }
    }
    return false;  
  }  
})