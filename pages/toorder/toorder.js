const app = getApp()
const util = require('../../utils/util.js');
const api = require('../../utils/request.js')
import WxValidate from '../../utils/WxValidate'

Page({
  data: {
    showDialog: false,
    curDate: '',
    curTime: '',
    times: [],
    serviceTypeArr: [
      { text: '田螺姑娘', value: '0' },
      { text: '甩手掌柜', value: '1' }
    ],
    checkedServiceType: '',
    checkboxChecked: false,
    cleanValue: '',
    minusStatus: '',
    setpList: [
      { steplength: '1.5m', steppernum: '0', name: 'hl_specs15', disabled: 'disabled' },
      { steplength: '1.8m', steppernum: '0', name: 'hl_specs18', disabled: 'disabled' },
    ],
    formData: '',
    amount: '',
    price: '',
    showPrice: false,
    showDialogData: false,
    showDialogLoading: true,
    dialogData: [],
    textCount: 0,
    areatext: '还有特别要求？', 
    multiShow: true,
    textareaHeight: 68,
    change: false,
    showArrow: false,
    showAmountDialog: false,
    hasAddress: false,
    houseInfo: '',
    form: {
      house_id: '',
      house_type_code: '',//  房型0: 1室 1: 两室 2: 三室
      service_type_code: '',//服务类型0保洁 1保洁+布草
      service_date: '',// 服务日期（明天开始的7天内，例：2019-05 - 09）
      service_time: '',// 服务时间点
      contact_mobile: '',// 手机号
      contact_name: '',//用户名
      address: '',// 地址
      hl_specs15: '',
      hl_specs18: '',
      hl_clean_type_code: '',// 布草清洗方式0: 房间内洗晾   1: 固定地点领取
      hl_location: '',//  布草领取地点
      open_door_remark: '',//开门方式备注(密码或者钥匙地址)
      consumables_location: '',// 消耗品位置
      remark: ''
    },
  },
  onLoad(options) {
    console.log(options)
    let that = this
    that.initValidate()
    if (!!options.data){
      let againData = JSON.parse(options.data);
      that.setData({
        form: againData,
        checkedServiceType: againData.service_type_code,
        'form.service_date': '',
        'form.service_time': '',
      })
      if (againData.remark){
        that.setData({
          areatext: againData.remark,
        })
      }
      if (againData.hl_clean_type_code == '0'){
        that.setData({
          cleanValue: againData.hl_clean_type_code,
        })
      } else {
        that.setData({
          'setpList[0].steppernum': againData.hl_specs15,
          'setpList[1].steppernum': againData.hl_specs18,
        })
      }
      that.getHouseInfo(againData.house_id)
    }
    console.log(that.data.form)
    console.log(that.data.formData)
  },
  toggleArrow(e){
    let that = this
    that.setData({
      showArrow: !that.data.showArrow,
      showAmountDialog: !that.data.showAmountDialog
    })
  },
  toggleDialog(e) {
    console.log(e)
    let that = this
    let date = that.data.curDate
    let formData = that.data.formData
    let dialogData = that.data.dialogData
    let curTime = e.currentTarget.dataset.time
    console.log(curTime)
    if (!formData){
      that.showToast('请选择房源地址')
    } else {
      that.setData({
        showDialog: !that.data.showDialog,
      })

    }
  },
  serviceTypeChange(e) {
    let that = this
    let formData = that.data.formData
    let setpList = that.data.setpList
    that.setData({
      checkedServiceType: e.detail.value,
      'form.service_type_code': e.detail.value,
    })
    that.getAmount(formData.id, e.detail.value, setpList[0].steppernum, setpList[1].steppernum)
  },
  cleanChange(e){
    let that = this
    // let checkboxChecked = that.data.checkboxChecked
    console.log(e)
    that.setData({
      cleanValue: e.detail.value,
      'form.hl_clean_type_code': e.detail.value,
    })
  },
  checkboxChange(e) {
    let that = this
    let checkboxChecked = that.data.checkboxChecked
    console.log(checkboxChecked)
    console.log(e)
    that.setData({
      checkboxChecked: !checkboxChecked
    })
  },
  showToast(e) {
    wx.showToast({
      title: e,
      icon: 'none',
      mask: true
    })
  },
  formSubmit(e){
    let that = this
    let data = e.detail.value
    console.log(data)
    if (!that.WxValidate.checkForm(data)) {
      const error = that.WxValidate.errorList[0]
      that.showToast(error.msg)
      return false
    } else {
      if (data.service_type_code == 0) {
        if (!data.hl_clean_type_code) {
          that.showToast('请选择布草清洗方式')
        } else {
          if (data.hl_clean_type_code == '1' && !data.hl_location) {
            that.showToast('请填写布草领取地址')
          } else if (!that.data.checkboxChecked) {
            that.showToast('请阅读并同意《麦极服务协议》')
          } else {
            console.log('111')
            that.pay(data)
          }
        }
      } else if (data.service_type_code == 1) {
        if (data.hl_specs15 == '0' && data.hl_specs18 == '0') {
          that.showToast('请至少选择一套布草')
        } else if (!that.data.checkboxChecked){
          that.showToast('请阅读并同意《麦极服务协议》')
        } else {
          console.log('222')
          that.pay(data)
        }
      }
    }
  },
  getAmount(e, v, s, l) { // e house_id  v service_type_code  s hl_specs15   l hl_specs18
    let that = this
    let data
    if ( v == 0 ) {
      data = {
        house_id: e,
        service_type_code: v
      }
    } else {
      data = {
        house_id: e,
        service_type_code: v,
        hl_specs15: s,
        hl_specs18: l
      }
    }
    console.log(data)
    api.request('/fuwu/order/amount.do', 'POST', app.globalData.token, data).then(res => {
      console.log('getAmount:', res.data);
      let art = res.data
      if (art.rlt_code == "S_0000"){
        // if (art.data.orderFavorableAmount == art.data.orderRetailAmount){
          
        // }
        that.setData({
          showPrice: true,
          amount: art.data,
          // price: art.data.orderRetailAmount
        })
      }
    }).catch(res => {
      console.log('pay-fail:', res);
    }).finally(() => {
    })
  },
  pay(data) {
    console.log(data) 
    let that = this
    wx.showLoading({
      title: '加载中',
      mask: true
    })
    api.request('/fuwu/order/add.do', 'POST', app.globalData.token, data).then(res => {
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
            wx.switchTab({
              url: '../orderList/orderList'
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
            wx.switchTab({
              url: '../orderList/orderList',
              success: function (e) {
                var page = getCurrentPages().pop();
                if (page == undefined || page == null) return;
                page.onLoad();
              }
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
        wx.switchTab({
          url: '../orderList/orderList',
          success: function (e) {
            var page = getCurrentPages().pop();
            if (page == undefined || page == null) return;
            page.onLoad();
          }
        })
      }
    }).catch(res => {
      console.log('pay-fail:', res);
    }).finally(() => { })
  },
  dateChange(event) {
    console.log(event);
    let that = this
    let id = event.currentTarget.dataset.id;
    let data = that.data.dialogData
    for (let i = 0; i < data.length; i++) {
      if (id == data[i].date) {
        data[i].isSelect = true;
      } else {
        data[i].isSelect = false;
      }
    }
    that.setData({
      dialogData: data,
      curDate: id
    });
  },
  timeChoose(e){
    console.log(e)
    let that = this
    let dialogData = that.data.dialogData
    let date = e.currentTarget.dataset.date
    let time = e.currentTarget.dataset.time
    dialogData.map((item,index,arr) => {
      if(item.date == date){
        item.alive_time.map((item,index,arr) => {
          if (time == item.time) {
            item.isSelect = true
          } else {
            item.isSelect = false
          }
        })
      } else {
        item.alive_time.map((item, index, arr) => {
          item.isSelect = false
        })
      }
    })
    that.setData({
      dialogData: dialogData,
      curTime: time
    })

  },
  confirmChoose(e){
    console.log(e)
    let that = this
    let date = e.currentTarget.dataset.date
    let time = e.currentTarget.dataset.time
    if (!!date && !!time){
      that.setData({
        'form.service_date': date,
        'form.service_time': time,
        showDialog: false,
        curDate: date,
        curTime: time
      })
    } else {
      wx.showToast({
        title: '请选择服务时间',
        icon: 'none'
      })
    }
  },
  textareaChange(e) {
    // console.log(e)
    let that = this
    let length = e.detail.value.length
    console.log(length)
    that.setData({
      textCount: length,
      areatext: e.detail.value,
      'form.remark': e.detail.value
    })
  },
  ifshowArea(e) {
    console.log(e)
    let query = wx.createSelectorQuery();
    query.select('.weui-textarea').boundingClientRect(rect => {
      let height = rect.height;
      console.log(height);
      this.setData({ textareaHeight: height })
    }).exec();

    let t_show = e.currentTarget.dataset.show == "yes" ? true : false;
    if (t_show) {//不显示textarea 
      this.setData({
        areatext: this.data.form.remark ? this.data.form.remark : "还有特别要求？",
        multiShow: t_show
      });
    } else {//显示textarea 
      this.setData({
        multiShow: t_show
      });
    }
  },
  onMinus(e) {
    console.log(e)
    let that = this
    let index = e.currentTarget.dataset.index
    let list = that.data.setpList
    let formData = that.data.formData
    let checkedServiceType = that.data.checkedServiceType
    let num = list[index].steppernum
    if (num == 0) {
      return false;
    }
    num--;
    list[index].disabled = num == 0 ? 'disabled' : '';
    list[index].steppernum = num;
    that.setData({
      setpList: list
    });
    that.getAmount(formData.id, checkedServiceType, list[0].steppernum, list[1].steppernum)
  },
  onPlus(e) {
    console.log(e)
    let that = this
    let index = e.currentTarget.dataset.index;
    let list = that.data.setpList;
    let formData = that.data.formData
    let checkedServiceType = that.data.checkedServiceType
    let num = list[index].steppernum;
    num++;
    list[index].steppernum = num;
    list[index].disabled = num == 0 ? 'disabled' : '';
    that.setData({
      setpList: list,
    });
    that.getAmount(formData.id, checkedServiceType, list[0].steppernum, list[1].steppernum)
  },
  onShow() {
    let that = this
    let formData = that.data.formData
    let checkedServiceType = that.data.checkedServiceType
    let setpList = that.data.setpList
    console.log(formData)
    let change = that.data.change
    if (!!formData) {
      that.getTimeOrder(formData.house_type_code)
      // that.getTimeOrder()
      that.getAmount(formData.id, checkedServiceType, setpList[0].steppernum, setpList[1].steppernum)
    }
    if (!!formData && change) {
      that.setData({
        'form.address': formData.address,
        // form: formData
      })
    }
  },
  initValidate() {
    // 验证字段的规则
    const rules = {
      house_id: {
        required: true,
      },
      service_time: {
        required: true,
      },
      service_type_code: {
        required: true,
      },
      mobile: {
        required: true,
        tel: true,
      },
      open_door_remark: {
        required: true,
      }
    }
    const messages = {
      house_id: {
        required: '请选择房源地址',
      },
      service_time: {
        required: '请选择服务时间',
      },
      service_type_code: {
        required: '请选择服务类型',
      },
      mobile: {
        required: '手机号不能为空',
        tel: '请输入正确的手机号',
      },
      open_door_remark: {
        required: '请输入开门密码或者钥匙存放位置',
      }
    }
    // 创建实例对象
    this.WxValidate = new WxValidate(rules, messages)

  },
  getTimeOrder(e,v) {
    let that = this
    // console.log(e)
    let data = { house_type_code: e }
    console.log(data)
    api.request('/fuwu/service/can_order_time.do', 'POST', app.globalData.token, data).then(res => {
      console.log('getTimeOrder:', res.data);
      if (res.data.rlt_code == "S_0000"){
        let dialogData = res.data.data
        dialogData.map((item, index, arr) => {
          item.isSelect = false
          item.date_id = util.formatWords(new Date(item.date))
          item.date_week = util.formatWeeks(new Date(item.date))
          if (index == 0) {
            item.isSelect = true
            item.date_week = '明天'
          }
          item.alive_time.map((item,index,arr) => {
            item.isSelect = false
          })
        })
        console.log(dialogData)
        that.setData({
          dialogData: dialogData,
          curDate: dialogData[0].date,
        })
        setTimeout(function () {
          that.setData({
            showDialogData: true
          })
        }, 1000); 
      } else {
        that.setData({
          showDialogData: false
        })
        setTimeout(function () {
          that.setData({
            showDialogLoading: false
          })
        }, 1000); 
      }
    }).catch(res => {
      console.log('pay-fail:', res); 
      that.setData({
        showDialogData: false,
      })
      setTimeout(function () {
        that.setData({
          showDialogLoading: false
        })
      }, 1000);
    }).finally(() => {
    })
  },
  getHouseInfo(e) {
    let that = this
    wx.showLoading({
      title: '加载中',
      mask: true
    })
    let data = { house_id: e }
    api.request('/fuwu/house/info.do', 'POST', app.globalData.token, data).then(res => {
      console.log('getHouseInfo:', res.data);
      if (res.data.rlt_code == 'S_0000') {
        let houseInfo = res.data.data
        that.setData({
          formData: houseInfo,
          hasAddress: true,
          // houseInfo: res.data.data
        })
        that.getAmount(houseInfo.id, that.data.form.service_type_code, that.data.form.hl_specs15, that.data.form.hl_specs18)
      } else {
        that.setData({
          hasAddress: false,
          // houseInfo: '',
          formData: ''
        })
      }
      wx.hideLoading()
    }).catch(res => {
      console.log('pay-fail:', res);
    }).finally(() => { })
  },
  refreshDialog() {
    let that = this
    let formData = that.data.formData
    that.setData({
      showDialogLoading: true
    })
    that.getTimeOrder(formData.house_type_code)
  },
  onShareAppMessage: function () {

  }
})