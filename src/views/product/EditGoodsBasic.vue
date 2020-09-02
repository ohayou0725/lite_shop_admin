<template>
  <a-form :form="form">
    <a-form-item
      label="商品编号"
      :labelCol="{lg: {span: 7}, sm: {span: 7}}"
      :wrapperCol="{lg: {span: 10}, sm: {span: 17} }"
    >
      <a-input
        :disabled="true"
        v-decorator="[
              'goodsSn',
              { initialValue: this.goodsInfo.goodsSn }
            ]"
        name="goodsSn"
      />
    </a-form-item>
    <a-form-item
      label="商品名称"
      :labelCol="{lg: {span: 7}, sm: {span: 7}}"
      :wrapperCol="{lg: {span: 10}, sm: {span: 17} }"
    >
      <a-input
        v-decorator="[
              'name',
              { initialValue: this.goodsInfo.name },
              {rules: [{ required: true, message: '请输入商品编号' }]}
            ]"
        name="name"
        placeholder="请输入商品名称"
      />
    </a-form-item>
    <a-form-item
      label="商品标题"
      :labelCol="{lg: {span: 7}, sm: {span: 7}}"
      :wrapperCol="{lg: {span: 10}, sm: {span: 17} }"
    >
      <a-input
        v-decorator="[
              'title',
              { initialValue: this.goodsInfo.title },
              {rules: [{ required: true, message: '请输入商品标题' }]}
            ]"
        name="title"
        placeholder="请输入商品标题"
      />
    </a-form-item>
    <a-form-item
      label="商品简介"
      :labelCol="{lg: {span: 7}, sm: {span: 7}}"
      :wrapperCol="{lg: {span: 10}, sm: {span: 17} }"
    >
      <a-textarea
        rows="2"
        placeholder="请输入商品简介"
        v-decorator="[
              'brief',   
              { initialValue: this.goodsInfo.brief },
              {rules: [{ required: true, message: '请输入商品简介' }]}
            ]"
      />
    </a-form-item>

    <a-form-item
      label="选择商品分类"
      :labelCol="{lg: {span: 7}, sm: {span: 7}}"
      :wrapperCol="{lg: {span: 6}, sm: {span: 17} }"
    >
      <a-cascader
        v-decorator="[
              'categoryIds',
             { initialValue: this.goodsInfo.categoryIds },
              {rules: [{ required: true, message: '必须选择商品分类' }]}
            ]"
        :options="categorys"
        :fieldNames="categoryField"
        placeholder="选择分类"
      />
    </a-form-item>
    <a-form-item
      label="选择所属品牌商"
      :labelCol="{lg: {span: 7}, sm: {span: 7}}"
      :wrapperCol="{lg: {span: 6}, sm: {span: 17} }"
    >
      <a-select
        v-decorator="[
              'brandId',
              { initialValue: this.goodsInfo.brandId },
              {rules: [{ required: true, message: '必须选择品牌商' }]}
            ]"
        show-search
        placeholder="选择或搜索品牌商"
        :filter-option="filterOption"
        allowClear
      >
        <a-select-option :value="item.id" v-for="(item,index) in brands" :key="index">{{item.name}}</a-select-option>
      </a-select>
    </a-form-item>
    <a-form-item
      label="商品单位"
      :labelCol="{lg: {span: 7}, sm: {span: 7}}"
      :wrapperCol="{lg: {span: 2}, sm: {span: 2} }"
      :required="true"
    >
      <a-input
        v-decorator="[
              'unit',
              { initialValue: this.goodsInfo.unit },
              {rules: [{ required: true, message: '请输入商品单位' }]}
            ]"
        name="unit"
        placeholder="单位"
      />
    </a-form-item>
    <a-form-item
      label="商品底价"
      :labelCol="{lg: {span: 7}, sm: {span: 7}}"
      :wrapperCol="{lg: {span: 2}, sm: {span: 2} }"
      :required="true"
    >
      <a-input-number
        v-decorator="[
              'price',
              { initialValue: this.goodsInfo.reservePrice },
              {rules: [{ required: true, message: '请输入商品底价' }]}
            ]"
        style="width:120px"
        :precision="2"
        :formatter="value => `¥ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')"
        :min="0.01"
      />
    </a-form-item>
    <a-form-item
      label="是否有折扣"
      :labelCol="{lg: {span: 7}, sm: {span: 7}}"
      :wrapperCol="{lg: {span: 7}, sm: {span: 17} }"
      :required="true"
    >
      <a-radio-group v-model="discount">
        <a-radio :value="1">否</a-radio>
        <a-radio :value="2">是</a-radio>
      </a-radio-group>
    </a-form-item>
    <div v-if="discount == 2">
      <a-form-item
        label="折扣价"
        :labelCol="{lg: {span: 7}, sm: {span: 7}}"
        :wrapperCol="{lg: {span: 2}, sm: {span: 2} }"
        :required="true"
      >
        <a-input-number
          v-decorator="[
              'discountPrice',
               { initialValue: this.goodsInfo.discountPrice },
               {rules: [{ required: this.discount == 2, message: '请输入商品底价' }]}

            ]"
          style="width:120px"
          :precision="2"
          :formatter="value => `¥ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')"
          :min="0.01"
        />
      </a-form-item>
    </div>
    <a-form-item
          label="商品重量(单位:kg)"
          :labelCol="{lg: {span: 7}, sm: {span: 7}}"
          :wrapperCol="{lg: {span: 2}, sm: {span: 2} }"
          :required="true"
        >
          <a-input-number
            v-decorator="[
              'weight',
              {rules: [{ required: true, message: '请输入商品重量' }]}
            ]"
            :precision="2"
          />
        </a-form-item>
    <a-form-item
      label="是否为新品"
      :labelCol="{lg: {span: 7}, sm: {span: 7}}"
      :wrapperCol="{lg: {span: 7}, sm: {span: 17} }"
      :required="true"
    >
      <a-radio-group
        v-decorator="[
              'isNew',
              { initialValue: this.goodsInfo.isNew },
              {rules: [{ required: true, message: '还未选择' }]}
            ]"
      >
        <a-radio :value="0">否</a-radio>
        <a-radio :value="1">是</a-radio>
      </a-radio-group>
    </a-form-item>
    <a-form-item
      label="是否为热卖品"
      :labelCol="{lg: {span: 7}, sm: {span: 7}}"
      :wrapperCol="{lg: {span: 7}, sm: {span: 17} }"
      :required="true"
    >
      <a-radio-group
        v-decorator="[
              'hot',
              { initialValue: this.goodsInfo.hot },
              {rules: [{ required: true, message: '还未选择' }]}
            ]"
      >
        <a-radio :value="0">否</a-radio>
        <a-radio :value="1">是</a-radio>
      </a-radio-group>
    </a-form-item>
    <a-form-item
      label="排序号"
      :labelCol="{lg: {span: 7}, sm: {span: 7}}"
      :wrapperCol="{lg: {span: 2}, sm: {span: 2} }"
      :required="true"
    >
      <a-input-number
        v-decorator="[
              'sort',
              { initialValue: this.goodsInfo.sort },
              {rules: [{ required: true, message: '请输入排序号' }]}
            ]"
        :min="0.01"
      />
    </a-form-item>
    <a-form-item
      label="商品主图"
      :labelCol="{lg: {span: 7}, sm: {span: 7}}"
      :wrapperCol="{lg: {span: this.fileList.length > 0 ? 10:2}, sm: {span: 17} }"
      help="需要更换图片时需上传"
    >
      <a-upload
        class="upload-list-inline"
        list-type="picture"
        :beforeUpload="checkFile"
        :action="uploadUrl"
        :headers="header"
        @change="afterUpload"
        :file-list="fileList"
        v-decorator="['titleImg',]"
      >
        <a-button v-if="fileList.length<1">
          <a-icon type="upload" />上传
        </a-button>
      </a-upload>
    </a-form-item>
    <a-form-item
      label="商品轮播图"
      :labelCol="{lg: {span: 7}, sm: {span: 7}}"
      :wrapperCol="{lg: {span: 17}, sm: {span: 7} }"
      :required="true"
    >
      <a-upload
        v-decorator="['galleryList']"
        list-type="picture-card"
        :beforeUpload="checkFile"
        :action="uploadGalleryUrl"
        :headers="header"
        @change="handleChange"
        :file-list="galleryImgList"
        @preview="handlePreview"
      >
        <div v-if="fileList.length < 8">
          <a-icon type="plus" />
          <div class="ant-upload-text">上传</div>
        </div>
      </a-upload>
      <a-modal :visible="previewVisible" :footer="null" @cancel="handleCancel">
        <img alt="example" style="width: 100%" :src="previewImage" />
      </a-modal>
    </a-form-item>  
    <a-form-item :wrapperCol="{ span: 24 }" style="text-align: center">
      <a-button type="primary" @click="submitForm">提交</a-button>
      <a-button style="margin-left: 8px" @click="close()">取消</a-button>
    </a-form-item>
  </a-form>
</template>

<script>
import { getTree, getDetail } from '@/api/category'
import { notification } from 'ant-design-vue'
import { getAllBrand } from '@/api/brand'
import { ACCESS_TOKEN } from '@/store/mutation-types'
import { editBasicInfo } from '@/api/goods'
function getBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = () => resolve(reader.result)
    reader.onerror = (error) => reject(error)
  })
}
export default {
  name: 'EditGoodsBasic',
  props: {
    goodsInfo: {},
  },
  mounted() {
    this.getCategory(), this.getBrand()
    this.discount = this.goodsInfo.discountPrice != this.goodsInfo.reservePrice ? 2 : 1
    for (let index = -1; index < this.goodsInfo.galleryList.length -1; index++) {
      this.galleryImgList.push({
        uid : index,
        name : '轮播图' + index + 1,
        status : 'done',
        url : this.goodsInfo.galleryList[index+1]
      })
    }
  },
  data() {
    return {
      uploadUrl: process.env.VUE_APP_API_BASE_URL + '/product/goods/upload',
      uploadGalleryUrl: process.env.VUE_APP_API_BASE_URL + '/product/goods/upload/gallery',
      header: {
        Authorization: window.sessionStorage.getItem(ACCESS_TOKEN),
      },
      form: this.$form.createForm(this),
      brands: [],
      categorys: [],
      categoryField: { label: 'name', value: 'id', children: 'children' },
      discount: '',
      fileList: [],
      flag: false,
      previewVisible: false,
      galleryImgList: [],
      previewImage : ''
    }
  },

  methods: {
    submitForm() {
      this.form.validateFields((err, value) => {
        let galleryArr = []
        this.galleryImgList.forEach(file=>{
            if (typeof(file.url) == "undefined") {
              galleryArr.push(file.response.data.url)
            } else {
              galleryArr.push(file.url)
            }
        })
        value.gallery = galleryArr.join(",")
        if (this.fileList.length > 0) {
          value.titleImg = this.fileList[0].response.data.url
        } else {
          value.titleImg = this.goodsInfo.titleImg
        }
        value.categoryId = value.categoryIds[value.categoryIds.length - 1]
        value.id = this.goodsInfo.id
        editBasicInfo(value).then((res) => {
          if (res.success) {
            notification.success({
              message: '成功',
              description: '修改商品信息成功',
            })
            this.flag = true
            this.close(this.flag)
          } else {
            notification.error({
              message: '失败',
              description: res.msg,
            })
          }
        })
      })
    },
    getCategory() {
      getTree().then((res) => {
        if (res.success) {
          this.categorys = res.data.tree
        } else {
          notification.error({
            message: '错误',
            description: res.msg,
          })
        }
      })
    },
    getBrand() {
      getAllBrand().then((res) => {
        if (res.success) {
          this.brands = res.data.list
        } else {
          notification.error({
            message: '错误',
            description: res.msg,
          })
        }
      })
    },
    filterOption(input, option) {
      return option.componentOptions.children[0].text.indexOf(input) >= 0
    },
    afterUpload({ file, fileList }) {
      this.fileList = fileList
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
    handleChange({ fileList }) {
      this.galleryImgList = fileList
    },
    handleCancel() {
      this.previewVisible = false
    },
    async handlePreview(file) {
      if (!file.url && !file.preview) {
        file.preview = await getBase64(file.originFileObj)
      }
      this.previewImage = file.url || file.preview
      this.previewVisible = true
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
    close() {
      this.$emit('close', this.flag)
    },
  },
}
</script>

<style scoped>
</style>