const loading = (that) => {
  return () => {
    that.setData({
      pageState: {
        state: 'loading',
        message: '加载中'
      }
    })
  }
}

const error = (that, message) => {
  return (message = '请求失败') => {
    that.setData({
      pageState: {
        state: 'error',
        message
      }
    })
  }
}

const empty = (that, message) => {
  return (message = '暂无更多数据') => {
    that.setData({
      pageState: {
        state: 'empty',
        message
      }
    })
  }
}

const finish = (that) => {
  return () => {
    that.setData({
      pageState: {
        state: 'finish',
        message: ''
      }
    })
  }
}

export default (that) => {
  return {
    loading: loading(that),
    error: error(that),
    empty: empty(that),
    finish: finish(that)
  }
}