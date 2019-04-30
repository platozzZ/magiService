const date = new Date();
const hours = [];
const minutes = ['00','30'];

//获取小时
for (let i = 8; i < 21; i++) {
  if (i < 10) {
    i = "0" + i;
  }
  hours.push("" + i);
}
Page({
  data: {
    time: '',
    multiArray: [hours, minutes],
    multiIndex: [0, 0],
    choose_year: '',
  },
  onLoad: function () {
    //设置默认的年份
    this.setData({
      choose_year: this.data.multiArray[0][0]
    })
  },
  scrollLoading(){
    wx.showModal({
      title: '提示',
      content: '加载了',
    })
  },
  //获取时间日期
  bindMultiPickerChange: function (e) {
    // console.log('picker发送选择改变，携带值为', e.detail.value)
    this.setData({
      multiIndex: e.detail.value
    })
    const index = this.data.multiIndex;
    const hour = this.data.multiArray[0][index[0]];
    const minute = this.data.multiArray[1][index[1]];
    // console.log(`${year}-${month}-${day}-${hour}-${minute}`);
    this.setData({
      time: hour + ':' + minute
    })
    // console.log(this.data.time);
  },
  //监听picker的滚动事件
  bindMultiPickerColumnChange: function (e) {
    var data = {
      multiArray: this.data.multiArray,
      multiIndex: this.data.multiIndex
    };
    data.multiIndex[e.detail.column] = e.detail.value;
    this.setData(data);
  },
})