<template>
  <div>
    <a-steps :current="current">
      <a-step :key="steps[0].key" :title="steps[0].title" />
      <a-step :key="steps[1].key" :title="steps[1].title" />
      <a-step :key="steps[2].key" :title="steps[2].title" />
    </a-steps>
    <div class="steps-content" v-if="current===0">
      <a-form :form="form">
        <a-form-item
          label="商品编号"
          :labelCol="{lg: {span: 7}, sm: {span: 7}}"
          :wrapperCol="{lg: {span: 10}, sm: {span: 17} }"
          help="输入商品编号后回车可查询已保存商品信息"
        >
          <a-input
            v-decorator="[
              'goodsSn',
              {rules: [{ required: true, message: '请输入商品编号' },
              { len: 9 , message: '商品编号为9位数字' }]}
            ]"
            name="goodsSn"
            placeholder="请输入商品编号"
            @pressEnter="queryGoodsForm"
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
              'categoryId',
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
              {rules: [{ required: true, message: '必须选择品牌商' }]}
            ]"
            show-search
            placeholder="选择或搜索品牌商"
            :filter-option="filterOption"
            allowClear
          >
            <a-select-option
              :value="item.id"
              v-for="(item,index) in brands"
              :key="index"
            >{{item.name}}</a-select-option>
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
          :wrapperCol="{lg: {span: 3}, sm: {span: 2} }"
          :required="true"
        >
          <a-radio-group v-model="discount" defaultValue="1">
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
          label="排序号"
          :labelCol="{lg: {span: 7}, sm: {span: 7}}"
          :wrapperCol="{lg: {span: 2}, sm: {span: 2} }"
          :required="true"
        >
          <a-input-number
            v-decorator="[
              'sort',
              {rules: [{ required: true, message: '请输入排序号' }]}
            ]"
            :min="minNum"
          />
        </a-form-item>
        <a-form-item
          label="商品主图"
          :labelCol="{lg: {span: 7}, sm: {span: 7}}"
          :wrapperCol="{lg: {span: this.fileList.length > 0 ? 10:2}, sm: {span: 17} }"
          :required="true"
        >
          <a-upload
            class="upload-list-inline"
            list-type="picture"
            :beforeUpload="checkFile"
            :action="uploadUrl"
            :headers="header"
            @change="afterUpload"
            :file-list="fileList"
            v-decorator="['titleImg', {rules:[{validator: validateImg, message: '必须上传一张商品主图'}]}]"
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
            v-decorator="['galleryList', {rules:[{validator: validateImg, message: '至少上传一张轮播图'}]}]"
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
      </a-form>
    </div>
    <div class="steps-content" v-else-if="current===1">
      <WangEditor ref="editor" @change="getEditorInfo" v-model="detail"></WangEditor>
    </div>
    <div class="steps-content" v-else-if="current===2">
      <div style=" padding: 20px;">
        <a-card size="small" :bordered="false" title="商品属性">
          <a-descriptions :column="4" size="middle">
            <a-descriptions-item v-for="(item,index) in attrs" :key="index" :label="item.attr">
              <a-input
                v-model="item.value"
                v-if="item.attrId === selectedAttr"
                @blur="addAttr"
                size="small"
              ></a-input>
              <div v-else>
                {{item.value}}
                <a-icon type="edit" ghost @click="openAdd(item)"></a-icon>
              </div>
            </a-descriptions-item>
          </a-descriptions>
        </a-card>
        <a-divider type="vertical" />
        <a-card size="small" title="商品规格" :bordered="false">
          <a-button slot="extra" type="primary" @click="addSpec">添加规格</a-button>
          <a-table :columns="specColumns" :data-source="specs" bordered :defaultExpandAllRows='true'>
            <div slot="expandedRowRender" slot-scope="record" style="margin: 0">
              <a-tag
                :closable="record.values.length > 1"
                @close="closeTag(value,record)"
                v-for="(value ,index ) in record.values"
                color="blue"
                :key="index"
              >{{value}}</a-tag>
              <a-input
                v-if="record.inputVisible"
                ref="input"
                type="text"
                size="small"
                v-model="record.value"
                :style="{ width: '78px' }"
                @blur="addValue(record)"
                @keyup.enter="addValue(record)"
              />
              <a-tag
                v-else
                style="background: #fff; borderStyle: dashed;"
                @click="showInput(record)"
              >
                <a-icon type="plus" />
                添加{{record.name}}
              </a-tag>
            </div>
            <template slot='action' slot-scope="text,record">
              <a-button icon='delete' type='danger' size='small' @click="deleteSpec(record)">删除</a-button>
            </template>
            <!-- <template v-for="col in ['name', 'sort']" :slot="col" slot-scope="text, record, index">
              <div :key="col"></div>
                <a-input
                  v-if="record.editable"
                  style="margin: -5px 0"
                  :value="text"
                  @blur="e => handleInputChange(e.target.value, record.key, col)"
                />
                <template v-else>{{ text }}</template>
              </div>
            </template>
            <template slot="action" slot-scope="text, record, index">
              <div class="editable-row-operations">
                <span v-if="record.editable">
                  <a @click="() => saveSpec(record)">保存</a>
                  <a-popconfirm title="确定取消修改?" @confirm="() => cancel(record.key)">
                    <a>取消</a>
                  </a-popconfirm>
                </span>
                <span v-else>
                  <a :disabled="editingKey !== ''" @click="() => edit(record.key)">编辑</a>
                  <a :disabled="editingKey !== ''" @click="() => deleteSpec(record.key)">删除</a>
                </span>
              </div>
            </template>-->
          </a-table>
          <a-modal
            title="添加规格"
            :visible="specVisible"
            :destroyOnClose="true"
            @ok="subitAddSpec"
            @cancel="()=>this.specVisible=false"
          >
            <a-form>
              <a-form-item
                label="规格名称"
                :required="true"
                :labelCol="{lg: {span: 4}, sm: {span: 7}}"
                :wrapperCol="{lg: {span: 10}, sm: {span: 17} }"
              >
                <a-input v-model="specForm.name"></a-input>
              </a-form-item>
              <a-form-item
                label="排序号"
                :required="true"
                :labelCol="{lg: {span: 4}, sm: {span: 7}}"
                :wrapperCol="{lg: {span: 10}, sm: {span: 17} }"
              >
                <a-input-number v-model="specForm.sort" :min="0" :defaultValue='0' ></a-input-number>
              </a-form-item>
            </a-form>
          </a-modal>
        </a-card>
      </div>
    </div>
    <div class="steps-action">
      <a-button @click="save" style="margin-right: 8px" v-if="current != steps.length - 1">保存</a-button>
      <a-button
        v-if="current < steps.length - 1"
        type="primary"
        style="margin-left: 8px"
        @click="next"
      >下一步</a-button>
      <a-button v-if="current == steps.length - 1" type="primary" @click="sumbitForm">完成</a-button>
      <a-button v-if="current > 0" style="margin-left: 8px" @click="prev">上一步</a-button>
    </div>
  </div>
</template>

<script>
import { getTree, getDetail } from '@/api/category'
import { notification } from 'ant-design-vue'
import { getAllBrand } from '@/api/brand'
import { ACCESS_TOKEN } from '@/store/mutation-types'
import { addGoods } from '@/api/goods'
import WangEditor from '@/components/Editor/WangEditor'
function getBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = () => resolve(reader.result)
    reader.onerror = (error) => reject(error)
  })
}
export default {
  name: 'AddGoods',
  components: { WangEditor },
  data() {
    return {
      uploadUrl: process.env.VUE_APP_API_BASE_URL + '/product/goods/upload',
      uploadGalleryUrl: process.env.VUE_APP_API_BASE_URL + '/product/goods/upload/gallery',
      header: {
        Authorization: window.sessionStorage.getItem(ACCESS_TOKEN),
      },
      current: 0,
      steps: [
        {
          key: 1,
          title: '商品基本信息',
        },
        {
          key: 2,
          title: '商品详情页信息',
        },
        {
          key: 3,
          title: '商品属性及规格',
        },
      ],
      attrColumns: [
        {
          title: '属性名',
          dataIndex: 'attr',
          width: '30%',
        },
        {
          title: '属性值',
          dataIndex: 'value',
          width: '30%',
          scopedSlots: { customRender: 'value' },
        },
      ],
      form: this.$form.createForm(this),
      categorys: [],
      categoryField: { label: 'name', value: 'id', children: 'children' },
      brands: [],
      isInput: false,
      minNum: 0,
      discount: 1,
      detail: '',
      fileList: [],
      selectedAttr: null,
      galleryImgList: [],
      previewVisible: false,
      previewImage: '',
      goodsDetail: {},
      attrs: [],
      specs: [],
      specForm: {},
      attrAndValue: {},
      loading: false,
      editingKey: '',
      specVisible: false,
      inputVisible: true,
      specColumns: [
        {
          title: '规格名',
          dataIndex: 'name',
          width: '30%',
          scopedSlots: { customRender: 'name' },
        },
        {
          title: '排序号',
          dataIndex: 'sort',
          width: '30%',
          scopedSlots: { customRender: 'sort' },
        },
        {
          title: '操作',
          dataIndex: 'action',
          scopedSlots: { customRender: 'action' },
        },
      ],
    }
  },
  mounted() {
    this.getCategory()
    this.getBrand()
  },

  watch: {
    current(value) {
      if (value === 2 && this.attrs.length === 0) {
        getDetail(this.goodsDetail.categoryId[2]).then((res) => {
          if (res.success) {
            const attrs = res.data.detail.attrs
            attrs.forEach((attr) => {
              this.attrs.push({ attr: attr.attrName, attrId: attr.id, value: '' })
            })
          } else {
            notification.error({
              message: '错误',
              description: res.msg,
            })
          }
        })
      }
    },
  },

  methods: {
    next() {
      if (this.current === 0) {
        this.form.validateFields((err, values) => {
          if (err == null) {
            this.goodsDetail = this.form.getFieldsValue()
            this.goodsDetail.discount = this.discount
            this.goodsDetail.detail = this.detail
            this.current++
          }
        })
      } else {
        // this.goodsDetail.discount = this.discount
        this.goodsDetail.detail = this.detail
        this.current++
      }
    },
    prev() {
      this.current--
      this.$nextTick(() => {
        this.form.setFieldsValue(this.goodsDetail)
      })
      this.fileList = this.goodsDetail.titleImg.fileList
      this.galleryImgList = this.goodsDetail.galleryList.fileList
      this.detail = this.goodsDetail.detail
      this.goodsDetail.attrValues = this.attrs
      this.goodsDetail.specs = this.specs
    },
    sumbitForm() {
      const emptyAttr = this.attrs.filter((item) => item.value === '')
      if (emptyAttr.length > 0) {
        notification.error({
          message: '错误',
          description: '还有未输入的商品属性值',
        })
        return
      }
      const emptySpec = this.specs.filter((item) => {
        item.name === '' || item.sort == '' || item.values.length === 0
      })
      if (emptySpec.length > 0 || this.specs.length === 0) {
        notification.error({
          message: '错误',
          description: '请输入完整的商品规格和规格值',
        })
        return
      }

      this.goodsDetail.attrValues = this.attrs
      this.goodsDetail.specs = []
      
      this.specs.forEach((spec) => {  
        let values = []
        spec.values.forEach(value=>{
            values.push({specValue:value})
        })      
        this.goodsDetail.specs.push({
          spec: { name: spec.name, sort: spec.sort },
          values: values,
        })
      })
      let goodsForm = {}
      goodsForm.goodsSn = this.goodsDetail.goodsSn
      goodsForm.name = this.goodsDetail.name
      goodsForm.brief = this.goodsDetail.brief
      goodsForm.title = this.goodsDetail.title
      goodsForm.status = 0
      goodsForm.sales = 0
      goodsForm.hot = 0
      goodsForm.isNew = 1
      goodsForm.brandId = this.goodsDetail.brandId
      goodsForm.categoryId = this.goodsDetail.categoryId[this.goodsDetail.categoryId.length - 1]
      goodsForm.sort = this.goodsDetail.sort
      goodsForm.unit = this.goodsDetail.unit
      goodsForm.price = this.goodsDetail.price
      goodsForm.weight = this.goodsDetail.weight
      goodsForm.discountPrice =
        typeof this.goodsDetail.discountPrice != 'undefined' ? this.goodsDetail.discountPrice : this.goodsDetail.price
      goodsForm.detail = this.goodsDetail.detail
      goodsForm.attrValues = this.goodsDetail.attrValues
      goodsForm.specs = this.goodsDetail.specs
      goodsForm.titleImg = this.getImgUrl(this.goodsDetail.titleImg.file)
      let galleryList = []
      this.goodsDetail.galleryList.fileList.forEach((file) => {
        galleryList.push(this.getImgUrl(file))
      })
      goodsForm.gallery = galleryList.join(',')

      addGoods(goodsForm).then((res) => {
        if (res.success) {
          notification.success({
            message: '成功',
            description: '商品添加成功',
          })
          window.localStorage.removeItem(goodsForm.goodsSn)
          this.$emit('toGoodsList', true)
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
    save() {
      let goodsSn = ''
      if (this.current === 0) {
        this.form.validateFields(['goodsSn'], (err, values) => {
          if (err === null) {
            goodsSn = this.form.getFieldValue('goodsSn')
            this.goodsDetail = this.form.getFieldsValue()
            this.goodsDetail.discount = this.discount
          }
        })
      }
      this.goodsDetail.detail = this.detail
      //   this.goodsDetail.attrValues = this.attrs
      //   this.goodsDetail.specs = this.specs
      window.localStorage.setItem(this.goodsDetail.goodsSn, JSON.stringify(this.goodsDetail))
      this.$message.success('保存成功')
    },

    queryGoodsForm() {
      const goodsSn = this.form.getFieldValue('goodsSn')
      if (window.localStorage.getItem(goodsSn) !== null) {
        this.goodsDetail = JSON.parse(window.localStorage.getItem(goodsSn))
        this.discount = this.goodsDetail.discount

        this.$nextTick(() => {
          this.form.setFieldsValue(this.goodsDetail)
        })
        this.fileList = this.goodsDetail.titleImg.fileList
        this.galleryImgList = this.goodsDetail.galleryList.fileList
        this.detail = this.goodsDetail.detail
      }
    },
    getEditorInfo(data) {
      this.detail = data
    },
    validateImg(rule, value, callback) {
      if (value.fileList.length === 0) {
        callback(rule.message)
      } else {
        callback()
      }
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
    edit(key) {
      const target = this.specs.filter((item) => key === item.key)[0]
      this.editingKey = key
      if (target) {
        target.editable = true
      }
    },
    cancel(key) {
      const newData = [...this.specs]
      const target = newData.filter((item) => key === item.key)[0]
      this.editingKey = ''
      if (target) {
        Object.assign(target, this.specs.filter((item) => key === item.key)[0])
        delete target.editable
        this.specs = newData
      }
    },
    deleteSpec(record) {
      const old = this.specs
      const name = record.name.trim()
      for (let i = 0; i < old.length; i++) {
          if (old[i].name === name) {
            old.splice(i,1);
            break
          }        
      }
      this.specs = old
    },
    closeTag(value, record) {
      let arr = record.values
      const newValues = arr.filter((item) => value !== item)
      record.values = newValues
    },
    addValue(record) {
      const inputValue = record.value
      let values = record.values
      if (inputValue && values.indexOf(inputValue) === -1) {
        values = [...values, inputValue]
      }
      record.values = values
      ;(record.inputVisible = false), (record.value = '')
      // Object.assign(this, {
      //   values,
      //   inputVisible: false,
      //   value: '',
      // });
    },
    showInput(record) {
      record.inputVisible = true
      let oldData = [...this.specs]
      for (let i = 0; i < oldData.length; i++) {
        if (oldData[i].name == record.name) {
          oldData[i] = record
        }
      }
      this.specs = oldData
      this.$nextTick(function () {
        this.$refs.input.focus()
      })
    },
    addSpec() {
      this.specVisible = true
      // let length = this.specs.length
      // if (length === 0) {
      //   this.specs.push({ key: '0', name: '', sort: '', editable: true })
      // } else {
      //   this.specs.push({ key: length.toString(), name: '', sort: '', editable: true })
      // }
    },
    subitAddSpec() {
      if (
        this.specForm.name == null ||
        this.specForm.name == '' ||
        this.specForm.sort == ''
      ) {
        this.$message.error('请输入完整表单')
        return
      }
      const count = this.specs.filter((spec) => spec.name === this.specForm.name).length
      if (count > 0) {
        this.$message.error('不能重复添加规格')
        return
      }
      this.specForm.values = []
      this.specForm.inputVisible = false
      this.specs.push(this.specForm)
      this.specForm = {}
      this.specVisible = false
    },
    modalCancel() {
      this.specVisible = false
    },
    openAdd(item) {
      this.selectedAttr = item.attrId
    },
    addAttr() {
      this.selectedAttr = 0
    },
    closeModal() {
      this.tagvisible = false
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
    handleChange({ fileList }) {
      this.galleryImgList = fileList
    },
    saveSpec(record) {
      if (record.name == '' || record.sort == '') {
        notification.error({
          message: '错误',
          description: '商品规格输入不完整',
        })
        return
      }
      const spec = this.specs.filter((item) => item.id === record.id)[0]
      record.editable = false
      this.editingKey = ''
    },
    handleInputChange(value, key, col) {
      this.specForm = [...this.specs]
      const target = this.specForm.filter((item) => key === item.key)[0]
      if (target) {
        target[col] = value
        this.spec = this.specForm
      }
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

    getImgUrl(file) {
      return file.response.data.url
    },
  },
}
</script>
<style scoped>
.steps-content {
  margin-top: 16px;
  border: 1px dashed #e9e9e9;
  border-radius: 6px;
  background-color: #fafafa;
  min-height: 200px;
  text-align: center;
  padding-top: 30px;
}

.steps-action {
  margin-top: 24px;
  text-align: center;
}
.upload-list-inline >>> .ant-upload-list-item {
  float: left;
  width: 200px;
  margin-right: 8px;
}
.ant-upload-select-picture-card i {
  font-size: 32px;
  color: #999;
}

.ant-upload-select-picture-card .ant-upload-text {
  margin-top: 8px;
  color: #666;
}
.editable-row-operations a {
  margin-right: 8px;
}
</style>