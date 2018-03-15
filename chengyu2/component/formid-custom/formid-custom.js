const app = getApp()

Component({
  properties: {
    formIdType: {
      type: String,
      value: null,
    }
  },
  data: {
  },
  methods: {
    formSubmit: function (e) {
      // console.log(123);
      //console.log("formIdType" + this.properties.formIdType)
      // console.log('form发生了submit事件，携带数据为：', e)
      var myEventDetail = {fromId: e.detail.formId} // detail对象，提供给事件监听函数
      var myEventOption = {} // 触发事件的选项
      this.triggerEvent('taphandle', myEventDetail, myEventOption)
      app.req.submitFormId(e.detail.formId);
    }
  }
})