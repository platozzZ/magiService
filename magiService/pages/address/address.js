const app = getApp()
const api = require('../../utils/request.js')
// import pagestate from '../../components/pagestate/index.js'
Page({
  data: {
    addressList: [],
    addressStatus: '',
    curId: '',
    art: [],
    pages: {
      current_page: 1,
      page_size: 100
    },
    total_page: '',
    isFirst: true,
    refresh: false,
    showContainer: false,
    showBtn: false,
  },
  onLoad(options) {
    console.log(options)
    let that = this
    that.getAddress(options.status)
    that.setData({
      addressStatus: options.status,
    })
    if (options.status == '1'){
      wx.setNavigationBarTitle({
        title: '房源管理',
      })
    } else {
      wx.setNavigationBarTitle({
        title: '选择房源',
      })
      that.setData({
        curId: options.house_id
      })
    }
  },
  chooseAddress(e){
    console.log(e)
    let that = this 
    let list = that.data.addressList
    let index = e.currentTarget.dataset.index
    let house_id = e.currentTarget.dataset.id
    let curId = that.data.curId
    let pages = getCurrentPages();
    let currPage = pages[pages.length - 1]; //当前页面
    let prevPage = pages[pages.length - 2]; //上一个页面
    if (house_id == curId) {
      prevPage.setData({
        change: false,
        'form.house_id': house_id
      })
    } else {
      list.map((item, i, arr) => {
        item.checked = false
        arr[index].checked = true
        return item
      })
      that.setData({
        addressList: list
      })
      prevPage.setData({
        formData: list[index],
        change: true,
        'form.service_date': '',
        'form.service_time': '',
        'form.house_id': house_id
      })
    }
    if (that.data.isFirst) {
      wx.navigateBack({
        delta: 1,
        success(res){
          that.setData({
            isFirst: false
          })
        }
      })
    }
  },
  deleteAddress(e) {
    console.log(e)
    let that = this
    wx.showModal({
      title: '提示',
      content: '是否确认删除房源？',
      success: function (res) {
        if (res.confirm) {
          let house_id = e.currentTarget.dataset.id
          that.getDelete(house_id)
        }
      }
    })
  },
  showModal(e){
    wx.showModal({
      title: '提示',
      content: e,
      showCancel: false,
      success: function(res) {},
      fail: function(res) {},
      complete: function(res) {},
    })
  },
  getDelete(e){
    let that = this
    let data = {house_id: e}
    api.request('/fuwu/house/delete.do', 'POST', data).then(res => {
      console.log(res.data)
      if (res.data.rlt_code != 'S_0000'){
        that.showModal(res.data.rlt_msg)
      } else {
        that.getAddress()
      }
    }).catch(res => {
      console.log('pay-fail:', res);
    }).finally(() => {
    })
  },
  getAddress(e) {
    let that = this
    let data = that.data.pages
    console.log(data)
    api.request('/fuwu/house/list.do', 'POST', data).then(res => {
      console.log('getAddress:', res.data);
      if (res.data.rlt_code == "S_0000" && !!res.data.data.rows) {
        let art = res.data.data.rows
        // let addressStatus = that.data.addressStatus
        if (e == 0) {
          art.map(item => {
            item.checked = false
            if (item.id == that.data.curId) {
              item.checked = true
            }
            return item
          })
        }
        console.log(art)
        that.setData({
          addressList: art,
          showContainer: true,
          showBtn: false
        })
        // setTimeout(function(){
        //   that.setData({
        //     showContainer: true,
        //     showBtn: false
        //   })
        // }, 200)
      } else {
        that.setData({
          addressList: [],
          showContainer: false,
          showBtn: true,
        })
        // setTimeout(function () {
        //   that.setData({
        //     showContainer: false,
        //     showBtn: true,
        //   })
        // }, 200)
      }
    }).catch(res => {
      // wx.hideLoading()
      // pageState.error()// 切换为error状态
      console.log('getAddress-fail:', res);
      }).finally(() => {
        wx.stopPullDownRefresh()
      // console.log('getAddress-finally:', "结束");
    })
  },
  onShow: function () {
    let that = this
    that.setData({
      isFirst: true
    })
    console.log(that.data.refresh)
    if (that.data.refresh) {
      that.getAddress()
    }
  },
  onPullDownRefresh() {
    this.getAddress()
  },
  onShareAppMessage: function () {}
})