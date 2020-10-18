<template>
  <page-header-wrapper>
    <div class="ant-pro-page-header-search">
      <a-input-search
        size="default"
        style="width: 80%; max-width: 522px;"
        placeholder="输入商品编号查询已上架单品"
        :disabled="searchDisabled"
        v-model="inputValue"
        :loading="loading"
        @search="getSku"
      >
        <template v-slot:enterButton>搜索</template>
      </a-input-search>
      <a-button type="danger" style="margin-left:20px" @click="()=>{this.skuList={};this.inputValue=''}">重置</a-button>
    </div>
    <a-card title="已上架单品">
      <a-button slot="extra" type="primary" icon="plus" @click="openAdding" v-if="searchDisabled">上架</a-button>
      <a-button
        slot="extra"
        type="danger"
        icon="delete"
        style="margin-left : 20px"
        v-if="skuList.length > 0"
        @click="removeAll"
      >全部下架</a-button>
      <a-modal v-model="visible" title="上架单品" closable :footer="null">
        <a-form :form="form" v-bind="formItemLayout" @submit="submitAddSku">
          <a-form-item label="商品编号">
            <span class="ant-form-text">{{inputValue}}</span>
          </a-form-item>
          <a-form-item label="商品标题">
            <span class="ant-form-text">{{title}}</span>
          </a-form-item>
          <a-form-item
            v-for="(item,index) in specList"
            :key="index"
            :label="item.spec.name"
            :required="true"
          >
            <a-radio-group
              buttonStyle="solid"
              v-decorator="['spec:' + item.spec.id,
              {rules:[{required:true,message:'还未选择规格'}]},
                {initialValue:[]}
                ]"
            >
              <a-radio-button
                v-for="(value,index) in item.values"
                :key="index"
                :value="value.id"
              >{{value.specValue}}</a-radio-button>
            </a-radio-group>
          </a-form-item>
          <a-form-item label="上架数量" :required="true">
            <a-input-number
              v-decorator="['stock',
            {rules:[{required: true, message: '必输上架数量'}]} ]"
              :min="1"
            />
          </a-form-item>
          <a-form-item label="预警库存" :required="true">
            <a-input-number
              v-decorator="['stockWarningCount', 
            {rules:[{required: true, message: '必输预警库存'}]} ]"
              :min="1"
            />
          </a-form-item>
          <a-form-item label="单品价格" :required="true">
            <a-input-number
              v-decorator="['price', 
            {rules:[{required: true, message: '必输输入单价'}]} ]"
              :precision="2"
              :formatter="value => `¥ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')"
              :min="0.01"
              style="width:120px"
            />
          </a-form-item>
          <a-form-item label="单品图片" :required="true">
            <a-upload
              class="upload-list-inline"
              list-type="picture"
              :beforeUpload="checkFile"
              :action="uploadUrl"
              :headers="header"
              @change="afterUpload"
              :file-list="fileList"
              v-decorator="['img', {rules:[{validator: validateImg, message: '必须上传一张商品图片'}]}]"
            >
              <a-button v-if="fileList.length<1">
                <a-icon type="upload" />点击上传
              </a-button>
            </a-upload>
          </a-form-item>
          <a-form-item :wrapperCol="{ span: 24 }" style="text-align: center">
            <a-button htmlType="submit" type="primary" :loading="addLoading">提交</a-button>
            <a-button style="margin-left: 8px" type="danger" @click="reset">取消</a-button>
          </a-form-item>
        </a-form>
      </a-modal>
      <a-spin :spinning="loading">
        <a-list size="large">
          <a-list-item :key="index" v-for="(item, index) in skuList">
            <a-list-item-meta :description="item.specString" class="avatar">
              <a-avatar
                slot="avatar"
                :size="64"
                shape="square"
                :src="item.img"
                v-if="!item.editable || !item.imgEdit"
              />
              <a slot="title">{{ item.title }}</a>
            </a-list-item-meta>
            <a-upload
              v-if="item.editable && item.imgEdit"
              :beforeUpload="checkFile"
              :action="uploadUrl"
              :headers="header"
              @change="editImg"
            >
              <a-tag color="#2db7f5">更换图片</a-tag>
            </a-upload>
            <div slot="actions">
              <a v-if="item.editable" @click="confirmEdit(index)">确定</a>
              <a v-else @click="edit(index)">编辑</a>
              <a-divider type="vertical" />
              <a v-if="item.editable" @click="cancel(index)">取消</a>
              <a v-else @click="deleteSku(index)">下架</a>
            </div>

            <div class="list-content">
              <div class="list-content-item">
                <span>价格</span>
                <p v-if="!item.editable">￥{{ item.price }}元</p>
                <p v-else>
                  <a-input-number
                    size="small"
                    v-model="item.price"
                    :precision="2"
                    :formatter="value => `¥ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')"
                    :min="0.01"
                  ></a-input-number>
                </p>
              </div>
            </div>

            <div class="list-content">
              <div class="list-content-item">
                <span>库存</span>
                <p v-if="!item.editable">{{ item.stock }}</p>
                <P v-else>
                  <a-input-number size="small" v-model="item.stock" :min="1"></a-input-number>
                </P>
              </div>
            </div>
            <div class="list-content">
              <div class="list-content-item">
                <span>预警库存</span>
                <p v-if="!item.editable">{{ item.stockWarningCount }}</p>
                <p v-else>
                  <a-input-number size="small" v-model="item.stockWarningCount" :min="1"></a-input-number>
                </p>
              </div>
            </div>
            <div class="list-content">
              <div class="list-content-item">
                <span>已售出</span>
                <p>{{ item.sales }}</p>
              </div>
            </div>
            <div class="list-content">
              <div class="list-content-item">
                <span>销售占比</span>
                <p>
                  <a-progress
                    :percent="totalSales != 0 ? Math.round(item.sales / totalSales * 10000) / 100.00:0"
                    style="width: 180px"
                  />
                </p>
              </div>
            </div>
          </a-list-item>
        </a-list>
      </a-spin>
    </a-card>
  </page-header-wrapper>
</template>

<script>
import { skuList, getSpecsByGoodsSn, addSku, editSku, deleteSku, deleteAllSku } from '@/api/goods'
import { notification } from 'ant-design-vue'
import { ACCESS_TOKEN } from '@/store/mutation-types'

export default {
  name: 'AddSku',
  data() {
    return {
      header: {
        Authorization: window.sessionStorage.getItem(ACCESS_TOKEN),
      },
      uploadUrl: process.env.VUE_APP_API_BASE_URL + '/product/goods/upload',
      form: this.$form.createForm(this),
      loading: false,
      inputValue: '',
      skuList: [],
      specList: [],
      specs: [],
      totalSales: 0,
      title: '',
      visible: false,
      search: true,
      fileList: [],
      cacheSkuList: null,
      addLoading: false,
      formItemLayout: {
        labelCol: { span: 6 },
        wrapperCol: { span: 14 },
      },
    }
  },
  computed: {
    searchDisabled() {
      return this.skuList.length > 0
    },
  },
  methods: {
    getSku() {
      this.loading = true
      skuList({
        goodsSn: this.inputValue,
      }).then((res) => {
        if (res.success) {
          if (res.data.list !== null) {
            this.skuList = res.data.list
            let total = 0
            this.skuList.forEach((item) => {
              item.specString = this.getSpec(item.specAndValueList)
              total += item.sales
              item.editable = false
              item.imgEdit = false
            })
            this.totalSales = total
          } else {
            this.showConfirm()
          }
          this.loading = false
        } else {
          this.skuList = []
          notification.error({
            message: '错误',
            description: res.msg,
          })
        }
        this.loading = false
      })
    },
    getSpec(specAndValueList) {
      let specArr = []
      for (let i = 0; i < specAndValueList.length; i++) {
        const item = specAndValueList[i]
        specArr.push(item.spec)
        specArr.push(':')
        specArr.push(item.value)
        if (i !== specAndValueList.length - 1) {
          specArr.push(',')
        }
      }
      return specArr.join('')
    },
    getSpecList(param) {
      getSpecsByGoodsSn(param).then((res) => {
        if (res.success) {
          this.specList = res.data.list
          this.title = this.specList[0].title
        } else {
          notification.error({
            message: '错误',
            description: res.msg,
          })
        }
      })
    },
    openAdding() {
      this.visible = true
      this.getSpecList({ goodsSn: this.inputValue })
    },
    edit(index) {
      this.cacheSkuList = JSON.stringify(this.skuList)
      let oldData = this.skuList
      for (let i = 0; i < oldData.length; i++) {
        if (i === index) {
          oldData[i].editable = true
          oldData[i].imgEdit = true
        }
      }
      this.skuList = oldData
      this.$forceUpdate()
    },
    confirmEdit(index) {
      const data = this.skuList[index]
      let sku = {}
      sku.img = data.img
      sku.stock = data.stock
      sku.price = data.price
      sku.skuId = data.skuId
      sku.stockWarningCount = data.stockWarningCount
      editSku(sku).then((res) => {
        if (res.success) {
          notification.success({
            message: '成功',
            description: '修改单品信息成功',
          })
          this.getSku()
        } else {
          notification.error({
            message: '失败',
            description: res.msg,
          })
        }
      })
    },
    cancel(index) {
      this.skuList = JSON.parse(this.cacheSkuList)
    },
    deleteSku(index) {
      const that = this
      this.$confirm({
        title: '下架单品',
        content: '确认是否下架该单品?',
        onOk() {
          const id = that.skuList[index].skuId
          deleteSku(id).then((res) => {
            if (res.success) {
              notification.success({
                message: '成功',
                description: '商品下架成功',
              })
            let newData = that.skuList.filter(item=>{
                return item.skuId != id
            })
            that.skuList = newData
            } else {
              notification.error({
                message: '失败',
                description: res.msg,
              })
            }
          })
        },
      })
    },
    removeAll() {
      const that = this
      this.$confirm({
        title: '下架商品',
        content: '确认是否下架全部单品?',
        onOk() {
          deleteAllSku(that.inputValue.trim()).then(res=>{
            if (res.success) {
                notification.success({
                    message : "成功",
                    description : "下架成功"
                })
                that.skuList = []
            } else {
                notification.error({
                    message : '失败',
                    description : res.msg
                })
            }
        })
        },
      })
        
    },
    submitAddSku(e) {
      e.preventDefault()
      this.form.validateFields((err, values) => {
        if (!err) {
          this.addLoading = true
          const keys = Object.keys(values)
          const specKey = keys.filter((item) => {
            return item.startsWith('spec')
          })
          let goodsSku = {}
          let specStr = []
          specKey.forEach((spec) => {
            let str = spec.split(':')[1] + '-' + values[spec]
            specStr.push(str)
          })

          let specSn = specStr.join('&')
          let goodsId = ''
          if (this.skuList.length > 0) {
            goodsId = this.skuList[0].specSn.split('#')[0]
          } else {
            goodsId = this.specList[0].goodsId
          }
          goodsSku.specSn = goodsId + '#' + specSn
          goodsSku.price = values.price
          goodsSku.stockWarningCount = values.stockWarningCount
          goodsSku.stock = values.stock
          goodsSku.img = values.img.file.response.data.url
          addSku(goodsSku).then((res) => {
            if (res.success) {
              notification.success({
                message: '成功',
                description: '商品上架成功',
              })
              this.reset()
              this.getSku()
            } else {
              notification.error({
                message: '失败',
                description: res.msg,
              })
            }
            this.addLoading = false
          })
        }
      })
    },
    reset() {
      this.visible = false
      this.form.resetFields()
      this.fileList = []
    },
    showConfirm() {
      const that = this
      this.$confirm({
        title: '该商品还未上架单品',
        content: '是否上架商品？',
        onOk() {
          that.openAdding()
        },
      })
    },
    checkFile(file) {
      const sizeOk = file.size < 1024 * 300
      const start = file.type.indexOf('image')
      const typeOk = start >= 0

      return new Promise((resolve, reject) => {
        if (!typeOk) {
          this.$message.error('照片格式有误！')
          reject(file)
        } else if (!sizeOk) {
          this.$message.error('照片大小超过300K！')
          reject(file)
        } else {
          resolve(file)
        }
      })
    },
    afterUpload({ file, fileList }) {
      this.fileList = fileList
    },

    editImg({ file, fileList }) {
      if (file.status === 'done') {
        let url = file.response.data.url
        this.skuList.forEach((item) => {
          if (item.editable) {
            item.img = url
            item.imgEdit = false
          }
        })
        this.$forceUpdate()
      }
    },
    validateImg(rule, value, callback) {
      if (value.fileList.length === 0) {
        callback(rule.message)
      } else {
        callback()
      }
    },
  },
}
</script>

<style scoped lang='less'>
.ant-pro-page-header-search {
  text-align: center;
  margin-bottom: 16px;
}
.ant-avatar-lg {
  width: 48px;
  height: 48px;
  line-height: 48px;
}

.list-content-item {
  color: rgba(0, 0, 0, 0.45);
  display: inline-block;
  vertical-align: middle;
  font-size: 14px;
  margin-left: 40px;
  margin-right: 10px;
  span {
    line-height: 20px;
  }
  p {
    margin-top: 4px;
    margin-bottom: 0;
    line-height: 22px;
  }
}
</style>