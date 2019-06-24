const app = getApp()
const util = require('../../utils/util.js');
const api = require('../../utils/request.js')
import WxValidate from '../../utils/WxValidate'
Page({
  data: {
    housetypeArr: [
      { text: '一居', value: '0' },
      { text: '二居', value: '1' },
      { text: '三居', value: '2' }
    ],
    checkedHouseType: '',
    addstatus: ''
  },
  onLoad: function (options) {
    console.log(options)
    console.log(0 == '0')
    let that = this
    that.initValidate()
    that.setData({
      addstatus: options.addstatus
    })
  },
  houseTypeChange(e){
    let that = this
      console.log(e.detail.value)
    that.setData({
      checkedHouseType: e.detail.value,
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
      api.request('/fuwu/house/add.do', 'POST', data).then(res => {
        console.log('addAddress:', res.data);
        // wx.hideLoading()
        let data = res.data
        if (data.rlt_code == 'S_0000'){
          let pages = getCurrentPages();
          let currPage = pages[pages.length - 1]; //当前页面
          let prevPage = pages[pages.length - 2]; //上一个页面
          let prevsPage = pages[pages.length - 3]; //上上一个页面
          if (that.data.addstatus == '1') {
            prevPage.setData({
              refresh: true
            })
            wx.navigateBack()
          } else {
            prevsPage.setData({
              formData: data.data
            })
            wx.navigateBack({
              delta: 2
            })
          }
        }
      }).catch(res => {
        // wx.hideLoading()
        that.showToast(res.data.rlt_msg)
        console.log('getAddress-fail:', res);
      }).finally(() => {
        // console.log('getAddress-finally:', "结束");
      })
    }
    
  },

  initValidate() {
    // 验证字段的规则
    const rules = {
      contact_name: {
        required: true,
      },
      contact_mobile: {
        required: true,
        tel: true,    
      },
      address: {
        required: true,
      },
      house_type_code: {
        required: true,
      }
    }
    const messages = {
      // house_name
      contact_name: {
        required: '请输入联系人姓名',
      },
      contact_mobile: {
        required: '手机号不能为空',
        tel: '请输入正确的手机号',
      },
      address: {
        required: '请输入详细地址',
      },
      house_type_code: {
        required: '请选择房源类型',
      }
    }
    // 创建实例对象
    this.WxValidate = new WxValidate(rules, messages)

  },
  onShow: function () {

  },

})